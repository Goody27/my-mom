#!/usr/bin/env bash
# デモ用: dm_poller Lambda を手動呼び出して即時実行する
# 使い方: ./scripts/demo-trigger.sh [AWS_PROFILE]
#
# 本番では EventBridge が1分ごとに呼び出すが、
# デモ当日は審査員の前でこのスクリプトを実行して「即座に動く」様子を見せる。

set -euo pipefail

PROFILE="${1:-default}"
FUNCTION_NAME="mymom-dm-poller"
REGION="ap-northeast-1"

echo "🚀 MyMom デモトリガー起動中..."
echo "   Function : $FUNCTION_NAME"
echo "   Profile  : $PROFILE"
echo "   Region   : $REGION"
echo ""

# dm_poller を同期呼び出し（--invocation-type RequestResponse でログを受け取る）
aws lambda invoke \
  --function-name "$FUNCTION_NAME" \
  --invocation-type RequestResponse \
  --log-type Tail \
  --region "$REGION" \
  --profile "$PROFILE" \
  --payload '{}' \
  /tmp/demo-response.json \
  | jq -r '.LogResult' | base64 -d

echo ""
echo "📨 レスポンス:"
cat /tmp/demo-response.json | jq .

echo ""
echo "⏱  Bedrock が断り文を生成中... (最大30秒)"
echo "   CloudWatch Logs でトレースを確認:"
echo "   https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#logsV2:log-groups/log-group/\$252Faws\$252Flambda\$252Fmymom-analyzer"
