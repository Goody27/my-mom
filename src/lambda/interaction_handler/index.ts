import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { WebClient } from "@slack/web-api";
import { verifySlackSignature } from "../shared/slack";
import { getSlackSigningSecret } from "../shared/secrets";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sm = new SecretsManagerClient({});

const REQUESTS_TABLE = process.env.REQUESTS_TABLE!;
const SLACK_BOT_TOKEN_ARN = process.env.SLACK_BOT_TOKEN_ARN!;

let slackClient: WebClient | null = null;

async function getSlackClient(): Promise<WebClient> {
  if (slackClient) return slackClient;
  const { SecretString } = await sm.send(
    new GetSecretValueCommand({ SecretId: SLACK_BOT_TOKEN_ARN })
  );
  const { token } = JSON.parse(SecretString!);
  slackClient = new WebClient(token);
  return slackClient;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  // Slack 署名検証
  const timestamp = event.headers["x-slack-request-timestamp"] ?? "";
  const signature = event.headers["x-slack-signature"] ?? "";
  const body = event.body ?? "";

  const signingSecret = await getSlackSigningSecret();
  const isValid = verifySlackSignature(signingSecret, body, timestamp, signature);
  if (!isValid) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  // Slack は application/x-www-form-urlencoded で payload を送る
  const params = new URLSearchParams(body);
  const payloadStr = params.get("payload");
  if (!payloadStr) {
    return { statusCode: 400, body: "Bad Request" };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return { statusCode: 400, body: "Bad Request" };
  }

  // ボタン操作のみ処理
  if (payload.type !== "block_actions") {
    return { statusCode: 200, body: "" };
  }

  const actions = payload.actions as Array<Record<string, unknown>> | undefined;
  const action = actions?.[0];
  if (!action) {
    return { statusCode: 200, body: "" };
  }

  const { requestId, reply } = JSON.parse(action.value as string) as {
    requestId: string;
    reply: string;
  };

  // リクエスト情報を取得（channelId 送信のため）
  const requestResult = await ddb.send(
    new GetCommand({ TableName: REQUESTS_TABLE, Key: { requestId } })
  );
  const request = requestResult.Item;

  // ユーザーが操作した → CANCELLED にしてsenderのべき等処理で止める
  await ddb.send(
    new UpdateCommand({
      TableName: REQUESTS_TABLE,
      Key: { requestId },
      UpdateExpression: "SET #s = :s, userReply = :r, repliedAt = :t",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: {
        ":s": "CANCELLED",
        ":r": reply,
        ":t": new Date().toISOString(),
      },
    })
  );

  const slack = await getSlackClient();

  // ユーザーへ「取り消しました」DM を送信
  if (request?.userId) {
    const dmChannel = await slack.conversations.open({ users: request.userId });
    const dmChannelId = dmChannel.channel?.id;
    if (dmChannelId) {
      await slack.chat.postMessage({
        channel: dmChannelId,
        text: `↩️ *取り消しました。*\n\n選択した返信: 「${reply}」`,
      });
    }
  }

  // ユーザーが選んだ返信文を相手チャンネルへ送信
  if (request?.channelId && reply) {
    await slack.chat.postMessage({
      channel: request.channelId as string,
      text: reply,
    });
  }

  // Slack は 200 を返さないとリトライしてくる
  return { statusCode: 200, body: "" };
};
