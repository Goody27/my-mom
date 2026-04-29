#!/usr/bin/env bash
# DynamoDB 初期データ投入スクリプト
# 使い方: ./scripts/seed.sh <USER_ID> [AWS_PROFILE]
#
# デプロイ直後に実行してデモ用のデフォルトキャラクター設定とユーザーを作成する。

set -euo pipefail

USER_ID="${1:-demo-user-001}"
PROFILE="${2:-default}"
REGION="ap-northeast-1"

echo "🌱 MyMom シードデータ投入中..."
echo "   UserId : $USER_ID"
echo ""

# ── mymom-users: ユーザー初期データ ──────────────────────────
aws dynamodb put-item \
  --region "$REGION" \
  --profile "$PROFILE" \
  --table-name "mymom-users" \
  --item '{
    "userId":        {"S": "'"$USER_ID"'"},
    "displayName":   {"S": "デモユーザー"},
    "timezone":      {"S": "Asia/Tokyo"},
    "autoMode":      {"BOOL": true},
    "createdAt":     {"S": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}
  }'
echo "✅ mymom-users"

# ── mymom-characters: お母さんキャラクター設定 ──────────────
aws dynamodb put-item \
  --region "$REGION" \
  --profile "$PROFILE" \
  --table-name "mymom-characters" \
  --item '{
    "userId":      {"S": "'"$USER_ID"'"},
    "name":        {"S": "お母さん"},
    "tone":        {"S": "やさしいけど芯のある関西弁"},
    "personality": {"S": "子どもの幸せを最優先。無理な頼みはきっぱり断る。失敗は一緒に謝る。"},
    "signoff":     {"S": "お母さんより"},
    "createdAt":   {"S": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}
  }'
echo "✅ mymom-characters"

# ── mymom-plans: プラン情報（free tier）──────────────────────
aws dynamodb put-item \
  --region "$REGION" \
  --profile "$PROFILE" \
  --table-name "mymom-plans" \
  --item '{
    "userId":    {"S": "'"$USER_ID"'"},
    "tier":      {"S": "free"},
    "slaHours":  {"N": "0"},
    "createdAt": {"S": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}
  }'
echo "✅ mymom-plans"

# ── mymom-dependency-scores: 初期スコア ─────────────────────
aws dynamodb put-item \
  --region "$REGION" \
  --profile "$PROFILE" \
  --table-name "mymom-dependency-scores" \
  --item '{
    "userId":      {"S": "'"$USER_ID"'"},
    "score":       {"N": "0"},
    "lastUpdated": {"S": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}
  }'
echo "✅ mymom-dependency-scores"

echo ""
echo "🎉 シード完了！デモ準備完了です。"
echo "   次のステップ: ./scripts/demo-trigger.sh でdm-pollerを手動実行"
