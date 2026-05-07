import { APIGatewayProxyHandler } from "aws-lambda";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { WebClient } from "@slack/web-api";
import * as crypto from "crypto";

const bedrockAgent = new BedrockAgentRuntimeClient({});
const sm = new SecretsManagerClient({});

const {
  BEDROCK_AGENT_ID,
  BEDROCK_AGENT_ALIAS_ID,
  SLACK_BOT_TOKEN_ARN,
  SLACK_SIGNING_SECRET_ARN,
} = process.env;

let slackClient: WebClient | null = null;
let cachedSigningSecret: string | null = null;

async function getSlackClient(): Promise<WebClient> {
  if (slackClient) return slackClient;
  const { SecretString } = await sm.send(
    new GetSecretValueCommand({ SecretId: SLACK_BOT_TOKEN_ARN! })
  );
  const { token } = JSON.parse(SecretString!);
  slackClient = new WebClient(token);
  return slackClient;
}

async function getSigningSecret(): Promise<string> {
  if (cachedSigningSecret) return cachedSigningSecret;
  const { SecretString } = await sm.send(
    new GetSecretValueCommand({ SecretId: SLACK_SIGNING_SECRET_ARN! })
  );
  const { secret } = JSON.parse(SecretString!);
  cachedSigningSecret = secret as string;
  return cachedSigningSecret;
}

function verifySignature(
  secret: string,
  body: string,
  timestamp: string,
  signature: string
): boolean {
  const base = `v0:${timestamp}:${body}`;
  const expected = `v0=${crypto.createHmac("sha256", secret).update(base).digest("hex")}`;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}

async function invokeAgent(userId: string, text: string): Promise<string> {
  const command = new InvokeAgentCommand({
    agentId: BEDROCK_AGENT_ID!,
    agentAliasId: BEDROCK_AGENT_ALIAS_ID!,
    sessionId: `chat-${userId}`,
    inputText: text,
  });

  const response = await bedrockAgent.send(command);
  let fullText = "";
  if (response.completion) {
    for await (const chunk of response.completion) {
      if (chunk.chunk?.bytes) {
        fullText += Buffer.from(chunk.chunk.bytes).toString("utf-8");
      }
    }
  }
  return (
    fullText ||
    "ごめんね、うまく考えがまとまらなかったよ。もう一度話しかけてみてね。"
  );
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body ?? "", "base64").toString("utf-8")
    : (event.body ?? "");

  const timestamp = event.headers["x-slack-request-timestamp"] ?? "";
  const signature = event.headers["x-slack-signature"] ?? "";

  const secret = await getSigningSecret();
  if (!verifySignature(secret, rawBody, timestamp, signature)) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  // Slack のリトライリクエストは処理しない（Lambda が継続中のため）
  if (event.headers["x-slack-retry-num"]) {
    return { statusCode: 200, body: "ok" };
  }

  const payload = JSON.parse(rawBody);

  // Slack App 初期設定の URL 検証チャレンジ
  if (payload.type === "url_verification") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge: payload.challenge }),
    };
  }

  if (payload.type !== "event_callback") {
    return { statusCode: 200, body: "ok" };
  }

  const ev = payload.event as Record<string, unknown>;

  // ボット自身・サブタイプ・テキストなしは無視
  if (ev.bot_id || ev.subtype || !ev.text || !ev.user) {
    return { statusCode: 200, body: "ok" };
  }
  if (ev.type !== "message" && ev.type !== "app_mention") {
    return { statusCode: 200, body: "ok" };
  }

  const userId = ev.user as string;
  const channelId = ev.channel as string;
  const text = (ev.text as string).replace(/<@[^>]+>\s*/g, "").trim();

  if (!text) return { statusCode: 200, body: "ok" };

  const slack = await getSlackClient();

  await slack.chat.postMessage({
    channel: channelId,
    text: "お母さん考えてるよ…ちょっと待ってね🤔",
  });

  const replyText = await invokeAgent(userId, text);

  await slack.chat.postMessage({
    channel: channelId,
    text: replyText,
  });

  return { statusCode: 200, body: "ok" };
};
