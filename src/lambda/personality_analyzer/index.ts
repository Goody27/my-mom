import { ScheduledHandler } from "aws-lambda";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const {
  JUDGEMENT_LOGS_TABLE,
  PERSONALITY_PROFILES_TABLE,
  DEPENDENCY_SCORES_TABLE,
  BEDROCK_MODEL_ID,
} = process.env;

interface PersonalityProfile {
  userId: string;
  declineRate: number;       // 0.0〜1.0
  topDeclineReasons: string[];
  updatedAt: string;
}

async function analyzePersonality(
  userId: string,
  logs: Array<{ decision: string; reason: string; replyText: string }>
): Promise<Pick<PersonalityProfile, "declineRate" | "topDeclineReasons">> {
  const declined = logs.filter((l) => l.decision === "DECLINE").length;
  const declineRate = logs.length > 0 ? declined / logs.length : 0;

  if (logs.length === 0) {
    return { declineRate: 0, topDeclineReasons: [] };
  }

  const prompt = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `以下はユーザー ${userId} の断り履歴です。断りの主な理由を3つ以内の短いフレーズで日本語で返してください。JSON配列形式のみで返答してください（例: ["疲れ・体調", "スケジュール過密", "人間関係の優先度"]）。

履歴:
${logs
  .slice(0, 20)
  .map((l) => `- 判断:${l.decision} 理由:${l.reason}`)
  .join("\n")}`,
      },
    ],
  };

  try {
    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId: BEDROCK_MODEL_ID ?? "anthropic.claude-3-5-sonnet-20241022-v2:0",
        contentType: "application/json",
        accept: "application/json",
        body: Buffer.from(JSON.stringify(prompt)),
      })
    );
    const result = JSON.parse(Buffer.from(response.body).toString("utf-8"));
    const text: string = result.content[0].text;
    const reasons = JSON.parse(text) as string[];
    return { declineRate, topDeclineReasons: reasons.slice(0, 3) };
  } catch {
    return { declineRate, topDeclineReasons: [] };
  }
}

export const handler: ScheduledHandler = async () => {
  // dependency_scores をスキャンして全 userId を取得
  // 本番では GSI を活用するが MVP ではスコアが存在するユーザーのみ対象
  const { Items: scoreItems } = await ddb.send(
    new QueryCommand({
      TableName: DEPENDENCY_SCORES_TABLE!,
      // dependency_scores は hash_key=userId のシンプルテーブルなので全件 scan が必要だが
      // MVP では seed.sh で投入したユーザー群のみ対象（テーブルサイズが小さい前提）
      KeyConditionExpression: "userId > :empty",
      ExpressionAttributeValues: { ":empty": "" },
      Limit: 100,
    }).catch(() => ({ Items: [] }))
  );

  if (!scoreItems || scoreItems.length === 0) return;

  for (const scoreItem of scoreItems) {
    const userId = scoreItem.userId as string;

    // 直近 50 件の判断ログを取得
    const { Items: logItems } = await ddb.send(
      new QueryCommand({
        TableName: JUDGEMENT_LOGS_TABLE!,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        Limit: 50,
        ScanIndexForward: false,
      })
    );

    if (!logItems || logItems.length === 0) continue;

    const logs = logItems.map((l) => ({
      decision: l.decision as string,
      reason: l.reason as string,
      replyText: l.replyText as string,
    }));

    const { declineRate, topDeclineReasons } = await analyzePersonality(userId, logs);

    await ddb.send(
      new PutCommand({
        TableName: PERSONALITY_PROFILES_TABLE!,
        Item: {
          userId,
          declineRate,
          topDeclineReasons,
          sampleSize: logs.length,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }
};
