# AI-DLC State — MyMom

## Project Info

| Field | Value |
|-------|-------|
| Project | MyMom（マイマム） |
| Team | 音部に抱っこ |
| Event | AWS Summit Japan 2026 AI-DLC Hackathon |
| Request Type | New Project (Greenfield) |
| Complexity | Complex |
| Scope | System-wide |

## Stage Progress

### 🔵 INCEPTION PHASE
- [x] Workspace Detection
- [x] Requirements Analysis
- [x] User Stories
- [x] Workflow Planning
- [x] Application Design
- [x] Units Generation

### 🟢 CONSTRUCTION PHASE
- [x] Functional Design — slack-decline-agent
- [x] Functional Design — chat-ui
- [x] Functional Design — personality-analyzer
- [x] NFR Requirements — slack-decline-agent
- [x] Infrastructure Design — slack-decline-agent
- [x] Infrastructure Design — chat-ui
- [x] Infrastructure Design — personality-analyzer
- [x] Shared Infrastructure Design
- [x] Code Generation — slack-decline-agent（dm_poller / analyzer / sender / interaction_handler / sla_handler）
- [x] Code Generation — chat-ui（chat_handler: Bedrock Agent セッション継続、Slack署名検証）
- [x] Code Generation — personality-analyzer（週次EventBridge cron、パーソナリティカード生成）
- [ ] Build and Test

### 🟡 OPERATIONS PHASE
- [ ] Operations

## Units of Work

| Unit | Description | Priority |
|------|-------------|----------|
| `slack-decline-agent` | MVP core: Slack DM → AI judgment → auto decline reply | 1 (MVP) |
| `chat-ui` | Chat interface with Bedrock-generated quick reply buttons | 2 |
| `personality-analyzer` | Weekly behavior analysis → personality profile → shareable card | 3 |

## Extension Configuration

| Extension | Enabled | Decided At |
|-----------|---------|------------|
| Security Baseline | Yes | Requirements Analysis |
| Property-Based Testing | No | Requirements Analysis |

## Evaluation Loop Status

| ループ | 実施日 | フォーカス | 主な改善 |
|--------|--------|-----------|---------|
| 1〜10 | 2026-04-28〜29 | 設計全般 | SQSバグ修正・Zapier比較・Ahaモーメント・unit economics・fallback 3パターン |
| 11 | 2026-04-29 | 実装コード品質 | sla_handler timeout修正・sender通知追加・dm_pollerページネーション+冪等性 |
| 12 | 2026-04-29 | セキュリティ&TOS | AIフッター実装・IAM改善指摘・オンボーディング設計追記 |
| 13 | 2026-04-29 | デモシナリオ | demo-trigger.sh作成・デモ台本追加 |
| 14 | 2026-04-29 | AWS技術深化 | bedrock.tf新規作成（致命的ブロッカー解消） |
| 15 | 2026-04-29 | ハッカソン勝利戦略 | seed.sh作成・README台本追加・総合スコア評価 |

## Submission Schedule

| 日付 | マイルストーン |
|------|-------------|
| 2026-05-08（金） | インセプション成果物を整合性取れた状態で提出（理想） |
| 2026-05-10（日） | 書類選考締め切り（ハードデッドライン） |
| 2026-05-15 | AWS側の審査期間終了 |
| 2026-06-25〜26 | 決勝（幕張メッセ） |

> プレゼン担当: 長野太郎

## Current Status

コード生成フェーズ完了。全Lambda実装済み（dm_poller / analyzer / sender / interaction_handler / chat_handler / personality_analyzer / sla_handler）。Terraform IaC実装済み・CI/CD設定済み。次タスク: デモシナリオ最終確認・書類提出（5/8）。

### 実装済みハイライト（2026-05-07 MTG確認）
- Slack断り代行フロー（DM検知→Bedrock Agent判断→SQS遅延送信→自動返信）
- お母さんメーター（信頼度0-40%/40-79%/80%+の3段階自律制御）
- chat_handler: Slack DM上でBedrock Agentと直接会話（セッション継続）
- Bedrock Guardrails: 倫理チェック・エスカレーション
- パーソナリティ分析（週次cron・4スコア・SNS共有カード）
- 責任SLA（MyMomが謝罪文を自動生成・送信）

### 勝利戦略（三石ミゲール確認）
- 技術完成度より**思想・コンセプト・将来性**で勝負
- 審査員への訴求: 「考え方が面白い」＋「実際に動くMVP」
- 差別化の核: 「もう断った。あなたは何もしていない」（責任の代替/共有）
