import { ScheduledHandler } from "aws-lambda";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { WebClient } from "@slack/web-api";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

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

async function fetchAllImChannels(slack: WebClient, botUserId: string) {
  const channels: { id: string; user: string }[] = [];
  let cursor: string | undefined;

  do {
    const res = await slack.conversations.list({
      types: "im",
      limit: 200,
      ...(cursor ? { cursor } : {}),
    });
    for (const ch of res.channels ?? []) {
      if (ch.id && ch.user && ch.user !== botUserId) {
        channels.push({ id: ch.id, user: ch.user });
      }
    }
    cursor = res.response_metadata?.next_cursor ?? undefined;
  } while (cursor);

  return channels;
}

export const handler: ScheduledHandler = async () => {
  const slack = await getSlackClient();

  const authResult = await slack.auth.test();
  const botUserId = authResult.user_id as string;

  const channels = await fetchAllImChannels(slack, botUserId);

  const now = Math.floor(Date.now() / 1000);
  // 直近70秒（1分ポーリング + 10秒バッファ）
  const oldest = String(now - 70);

  for (const channel of channels) {
    let historyCursor: string | undefined;
    const allMessages: NonNullable<Awaited<ReturnType<typeof slack.conversations.history>>["messages"]> = [];

    do {
      const page = await slack.conversations.history({
        channel: channel.id,
        oldest,
        limit: 100,
        ...(historyCursor ? { cursor: historyCursor } : {}),
      });
      if (page.messages) allMessages.push(...page.messages);
      historyCursor = page.has_more ? page.response_metadata?.next_cursor : undefined;
    } while (historyCursor);

    for (const msg of allMessages) {
      if (msg.bot_id || msg.subtype) continue;
      if (!msg.text || !msg.ts) continue;

      // requestId を channelId+messageTs の決定論的キーにすることで
      // ConditionExpression による完全な冪等性を実現する
      const requestId = `${channel.id}_${msg.ts}`;

      try {
        await ddb.send(
          new PutCommand({
            TableName: REQUESTS_TABLE,
            Item: {
              requestId,
              userId: channel.user,
              channelId: channel.id,
              messageTs: msg.ts,
              rawText: msg.text,
              status: "PENDING",
              createdAt: new Date().toISOString(),
            },
            ConditionExpression: "attribute_not_exists(requestId)",
          })
        );
      } catch (err: unknown) {
        // ConditionalCheckFailedException = 既に処理済み → 正常
        if (
          err instanceof Error &&
          err.name === "ConditionalCheckFailedException"
        ) {
          continue;
        }
        throw err;
      }
    }
  }
};
