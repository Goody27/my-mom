import { SQSHandler, SQSRecord } from "aws-lambda";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SchedulerClient, CreateScheduleCommand } from "@aws-sdk/client-scheduler";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { WebClient } from "@slack/web-api";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const scheduler = new SchedulerClient({});
const sm = new SecretsManagerClient({});

const {
  REQUESTS_TABLE,
  JUDGEMENT_LOGS_TABLE,
  DEPENDENCY_SCORES_TABLE,
  SLACK_BOT_TOKEN_ARN,
  SLA_HANDLER_FUNCTION_ARN,
  SCHEDULER_ROLE_ARN,
} = process.env;

let slackClient: WebClient | null = null;

async function getSlackClient(): Promise<WebClient> {
  if (slackClient) return slackClient;
  const { SecretString } = await sm.send(
    new GetSecretValueCommand({ SecretId: SLACK_BOT_TOKEN_ARN! })
  );
  const { token } = JSON.parse(SecretString!);
  slackClient = new WebClient(token);
  return slackClient;
}

async function processRecord(record: SQSRecord): Promise<void> {
  const { requestId, logId } = JSON.parse(record.body) as {
    requestId: string;
    logId: string;
  };

  // CANCELLED チェック（ユーザーが操作済みの場合はスキップ）
  const requestResult = await ddb.send(
    new GetCommand({ TableName: REQUESTS_TABLE!, Key: { requestId } })
  );
  const request = requestResult.Item;
  if (!request) return;
  if (request.status === "CANCELLED") return;

  // 判断ログを取得
  const logResult = await ddb.send(
    new GetCommand({ TableName: JUDGEMENT_LOGS_TABLE!, Key: { logId } })
  );
  const log = logResult.Item;
  if (!log) return;

  const slack = await getSlackClient();

  // 断り文 + AIフッター（NFR-06: 第三者への倫理的配慮）
  // quickReply ボタンは第三者ではなくユーザー向けのため断り文には含めない
  const replyWithFooter = `${log.replyText}\n\n_（このメッセージはAIアシスタント MyMom により生成されました）_`;

  // 相手方チャンネルへ断り文を送信（ボタンなし）
  await slack.chat.postMessage({
    channel: request.channelId,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: replyWithFooter },
      },
    ],
  });

  // 依存スコアをインクリメントして現在値を取得（ゲーミフィケーション演出）
  const scoreResult = await ddb.send(
    new UpdateCommand({
      TableName: DEPENDENCY_SCORES_TABLE!,
      Key: { userId: request.userId },
      UpdateExpression:
        "SET score = if_not_exists(score, :zero) + :one, lastUpdated = :now",
      ExpressionAttributeValues: {
        ":zero": 0,
        ":one": 1,
        ":now": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  const newScore = (scoreResult.Attributes?.score as number) ?? 1;

  // ユーザー本人へ「断っておいたよ」通知（Push型の根幹体験）
  // quickReply ボタンをここに表示（ユーザーが返信を選ぶのが正しい場所）
  const dmChannel = await slack.conversations.open({ users: request.userId });
  const dmChannelId = dmChannel.channel?.id;
  if (dmChannelId) {
    await slack.chat.postMessage({
      channel: dmChannelId,
      text: `✅ *断っておいたよ。*\n\n> ${log.replyText}\n\nお母さんがあなたの代わりに送っておいたよ。何もしなくていいからね。\n\n_今月の依存スコア: ${newScore} 回_`,
      ...(log.quickReplies?.length
        ? {
            blocks: [
              {
                type: "section" as const,
                text: {
                  type: "mrkdwn" as const,
                  text: `✅ *断っておいたよ。*\n\n> ${log.replyText}\n\nお母さんがあなたの代わりに送っておいたよ。何もしなくていいからね。\n\n_今月の依存スコア: ${newScore} 回_`,
                },
              },
              {
                type: "section" as const,
                text: { type: "mrkdwn" as const, text: "気が変わったら、返信を選んでね:" },
              },
              {
                type: "actions" as const,
                block_id: `actions_${requestId}`,
                elements: (log.quickReplies as string[]).map(
                  (label: string, i: number) => ({
                    type: "button" as const,
                    text: { type: "plain_text" as const, text: label },
                    action_id: `quick_reply_${i}`,
                    value: JSON.stringify({ requestId, reply: label }),
                  })
                ),
              },
            ],
          }
        : {}),
    });
  }

  // ステータス更新
  await ddb.send(
    new UpdateCommand({
      TableName: REQUESTS_TABLE!,
      Key: { requestId },
      UpdateExpression: "SET #s = :s, sentAt = :t",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: {
        ":s": "SENT",
        ":t": new Date().toISOString(),
      },
    })
  );

  // SLA タイマー: EventBridge Scheduler で5分後にone-time 実行
  // setTimeout(5分) + Lambda sleep というアンチパターンを回避
  const runAt = new Date(Date.now() + 5 * 60 * 1000);
  const scheduleExpr = `at(${runAt.toISOString().replace(/\.\d{3}Z$/, "")})`;

  await scheduler.send(
    new CreateScheduleCommand({
      Name: `mymom-sla-${requestId}`,
      ScheduleExpression: scheduleExpr,
      ScheduleExpressionTimezone: "UTC",
      FlexibleTimeWindow: { Mode: "OFF" },
      Target: {
        Arn: SLA_HANDLER_FUNCTION_ARN!,
        RoleArn: SCHEDULER_ROLE_ARN!,
        Input: JSON.stringify({ requestId, logId }),
      },
      // 実行後に自動削除
      ActionAfterCompletion: "DELETE",
    })
  );
}

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    await processRecord(record);
  }
};
