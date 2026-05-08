# MyMom（マイマム）

> **「人をダメにするシステム」**
> 使えば使うほど思考しなくなる、信頼委任設計。

MyMomは、意思決定そのものではなく、意思決定の結果に伴う**"責任の重さ"をお母さんに委ねる**AIサービスです。

人が疲れているのは「考えること」ではなく、**「判断した結果の責任を自分で負うこと」**です。
MyMomはその責任を引き受けます。

**チーム**: おんぶにだっこ（音部に抱っこ）
**イベント**: AWS Summit Japan 2026 AI-DLC Hackathon

---

## テーゼ

既存のAIはすべて、ユーザーが指示して初めて動く:
```
ユーザーが考える → ユーザーが指示する → AIが動く → ユーザーが結果の責任を負う
```

MyMomは、考えることも責任を負うことも不要:
```
MyMomが検知する → MyMomが判断する → MyMomが実行する → ユーザーは「断っておいたよ」通知を受け取るだけ
```

ユーザーは何も頼んでいない。MyMomはもう断っていた。

### 今回のMVPについて

> 「今日はMyMomの全構想のうち、最も心理的コストが高い**"断る責任の委任"**だけをSlack上で実演します。
> Slack断り代行はMyMomの"最小実証"です。本質は、Slackの外の、もっと広い生活全体にあります。」

---

## Push型の本質的優位性

| 観点 | Zapier + Claude API | iOS Shortcuts | **MyMom** |
|------|---------------------|--------------|-----------|
| 設定コスト | 30分〜（ワークフロー設計） | 15分〜（トリガー設定） | **ゼロ。入れた瞬間に動く** |
| 判断主体 | ユーザーがルールを書く | ユーザーがトリガーを設計 | **AIが文脈を読んで判断** |
| 失敗の責任 | ユーザーの設計ミス | ユーザーの設定ミス | **MyMomが謝罪・リカバリを自律実行** |
| 差別化の一言 | Zapierは断り方を自動化した | Shortcutsは断り文を送った | **MyMomはもう断った。あなたは何もしていない** |

---

## Human Decisions / AI Generated Artifacts

このプロダクトの開発で、人間が決めたこととAIが生成したことを明示します:

| 人間が決めたこと | Claude Code が生成したこと |
|---------------|-------------------------|
| 「責任委任」というコアコンセプト | 要件定義・ユーザーストーリー・ペルソナ |
| Slackをデモプラットフォームに選ぶ | アーキテクチャ設計・ドメインモデル |
| チームメンバー自身がペルソナ | 全7Lambda関数のコード |
| 「お母さん」というキャラクター | Terraform IaC（全AWSリソース） |
| ハッカソン提出戦略・発表構成 | CI/CDパイプライン・デモスクリプト |
| AI-DLCメソドロジーで開発する | このREADMEを含む全aidlc-docsドキュメント |

---

## AI-DLCライフサイクル

このプロダクトは [AI-DLCメソドロジー](https://github.com/awslabs/aidlc-workflows) に従って開発:

| フェーズ | AIが行ったこと | 人間が行ったこと | エビデンス |
|---------|-------------|--------------|---------|
| **Inception（構想）** | 要件定義・ユーザーストーリー・ドメインモデル・アプリ設計を生成 | コンセプト決定・承認 | `aidlc-docs/inception/` |
| **Construction（実装）** | 機能設計・NFR・インフラ設計・全7LambdaコードをClaude Codeが生成。Terraform IaCも生成 | レビュー・承認・マージ | `aidlc-docs/construction/` + `src/` + `infra/` |
| **Operation（改善）** | 8タイプのAI評価者による15ループのマルチ評価者レビュー。致命的バグ4件を検出・修正 | 最終承認 | `aidlc-docs/audit.md` |

> **このREADMEも、要件定義もコードも、AIが書きました。人間はアイデアを出し、承認しただけです。**

---

## アーキテクチャ

```
EventBridge（1分）→ dm-poller Lambda → DynamoDB
                                           ↓（Streams）
                                    analyzer Lambda → Bedrock Agent
                                                           ↓（Guardrails + Claude 3.5 Sonnet）
                                                    SQS DelayQueue（DLQ付き）
                                                           ↓
                                                    sender Lambda → Slack
                                                                       ↓
                                                          「断っておいたよ」通知
```

完全なアーキテクチャ図: [aidlc-docs/construction/shared-infrastructure.md](aidlc-docs/construction/shared-infrastructure.md)

---

## 使用AWSサービス

- **Amazon Bedrock Agents** — トレース可能な推論による自律的マルチステップ判断
- **Bedrock Guardrails** — エージェントに直接アタッチした倫理フィルタ
- **Claude 3.5 Sonnet** — 断り文・チャット応答・パーソナリティ分析
- **Lambda（7関数）** — イベント駆動・サーバーレス実行
- **DynamoDB（9テーブル）** — 全エンティティの永続化
- **SQS DelayQueue** — 非同期送信キュー（DLQ付きでリトライ保証）
- **EventBridge Scheduler** — Push型トリガー（1分間隔 + 週次）
- **API Gateway** — Slack Webhook + チャットエンドポイント
- **Secrets Manager** — トークン管理（ハードコード禁止）
- **CloudWatch + X-Ray** — 可観測性とBedrockトレース可視化

---

## ドキュメント構成

```
aidlc-docs/
├── aidlc-state.md                          # ワークフロー進捗トラッカー
├── audit.md                                # AI-DLC監査ログ
├── inception/
│   ├── requirements/requirements.md        # 機能・非機能要件（競合比較・市場規模含む）
│   ├── requirements/requirement-verification-questions.md
│   ├── user-stories/stories.md             # ユーザーストーリー（受け入れ基準付き）
│   ├── user-stories/personas.md            # ペルソナ + 最初の10人獲得計画
│   └── application-design/
│       ├── application-design.md           # アーキテクチャ全体・コンポーネント設計
│       └── domain-entities.md             # ドメインモデル（クラス図付き）
└── construction/
    ├── slack-decline-agent/                # MVPユニット（デモコア）
    │   ├── functional-design/
    │   │   ├── business-logic-model.md    # ロバストネス図 + シーケンス図 + データフロー
    │   │   └── sla-flow.md               # 責任SLAフロー（有料プランのみ）
    │   ├── nfr-requirements/nfr-requirements.md
    │   └── infrastructure-design/infrastructure-design.md  # SAMテンプレート + IAMロール
    ├── chat-ui/                           # チャット + クイックリプライユニット
    │   ├── functional-design/business-logic-model.md
    │   └── infrastructure-design/infrastructure-design.md
    ├── personality-analyzer/              # パーソナリティ分析ユニット
    │   ├── functional-design/business-logic-model.md
    │   └── infrastructure-design/infrastructure-design.md
    ├── shared-infrastructure.md           # AWSアーキテクチャ全体図
    └── build-and-test/build-instructions.md
```

---

## クイックスタート

```bash
# 1. インフラデプロイ（Bedrock Agent + Lambda + DynamoDB 一式）
cd infra && terraform init && terraform apply

# 2. 初期データ投入
./scripts/seed.sh <あなたのSlack User ID>

# 3. デモ即時実行（審査員の前で使う）
./scripts/demo-trigger.sh
```

詳細: [aidlc-docs/construction/build-and-test/build-instructions.md](aidlc-docs/construction/build-and-test/build-instructions.md)

---

## デモ台本（審査員向け）

> **所要時間**: 約60秒  
> **必要なもの**: Slackアプリインストール済み端末 × 2台（送り手・受け手）

```
1. 「皆さん、今週末の飲み会、断れてますか？」
   ↓ 会場に問いかけて共感を作る

2. スマホを取り出す
   「さっき上司からこんなDMが届きました」
   → 事前に用意した"催促DM"を受け手スマホで見せる

3. ./scripts/demo-trigger.sh を実行
   「MyMomに任せます」
   ↓ 5〜10秒でCloudWatch Logsに Bedrock のトレースが流れる（画面投影）

4. 受け手スマホに断り文が届く
   「断っておいたよ」通知が送り手スマホにも届く

5. 「あなたは何もしていない。お母さんがもう断っていた。」
```

---


*お母さんが設計しました。*
