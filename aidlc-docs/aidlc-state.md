# AI-DLC State — MyMom

## Project Info

| Field | Value |
|-------|-------|
| Project | MyMom（マイマム） |
| Team | おんぶにだっこ（音部に抱っこ） |
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
- [ ] Functional Design — UOW-01: Push Conversation Start
- [ ] Functional Design — UOW-02: Interest Signal Detection
- [ ] Functional Design — UOW-03: Candidate Nudge Generation
- [ ] Functional Design — UOW-04: Reservation / Planning Flow
- [ ] Functional Design — UOW-05: Excuse Evidence
- [ ] Functional Design — UOW-06: Feedback Loop
- [ ] Functional Design — UOW-07: Safety Boundary
- [ ] NFR Requirements
- [ ] Infrastructure Design
- [ ] Code Generation
- [ ] Build and Test

### 🟡 OPERATIONS PHASE
- [ ] Operations

## Units of Work

| Unit ID | Unit Name | Priority | Summary |
|---------|-----------|----------|---------|
| UOW-01 | Push Conversation Start | P0 | MyMomから会話が始まる体験を作る |
| UOW-02 | Interest Signal Detection | P0 | ユーザーの曖昧な反応から弱い興味を検知する |
| UOW-03 | Candidate Nudge Generation | P0 | MyMomが候補を勝手に見つけ、お節介に提示する |
| UOW-04 | Reservation / Planning Flow | P0 | 日程・場所・相手を詰め、予定化相当の結果を作る |
| UOW-05 | Excuse Evidence | P0 | ユーザーが言い訳として使える履歴を残す |
| UOW-06 | Feedback Loop | P1 | 体験後に愚痴や感想をMyMomへ返せるようにする |
| UOW-07 | Safety Boundary | P0 | お節介が危険な強制にならないようにする |

## Extension Configuration

| Extension | Enabled | Decided At |
|-----------|---------|------------|
| Security Baseline | Yes | Requirements Analysis |
| Property-Based Testing | No | Requirements Analysis |

## Evaluation Loop Status

| ループ | 実施日 | フォーカス | 主な改善 |
|--------|--------|-----------|---------|
| 1〜15 | 2026-04-28〜29 | 旧アーキ設計・実装 | Slack断り代行フロー（旧アーキ）の設計・実装・評価（アーキ転換により参考扱い） |
| 16 | 2026-05-10 | Inceptionアーキ転換 | お節介Push・予約代行アーキへ全面刷新、全Inception成果物を新アーキで再整合 |

## Submission Schedule

| 日付 | マイルストーン |
|------|-------------|
| 2026-05-08（金） | インセプション成果物を整合性取れた状態で提出（理想） |
| 2026-05-10（日） | 書類選考締め切り（ハードデッドライン） |
| 2026-05-15 | AWS側の審査期間終了 |
| 2026-06-25〜26 | 決勝（幕張メッセ） |

> プレゼン担当: 長野太郎

## Current Status

Inceptionフェーズ完了。「お節介Push・予約代行」アーキへ全面刷新済み。
全Inception成果物（requirements / user-stories / application-design / domain-entities / unit-of-work）が新アーキで整合済み。
次フェーズ: Construction（UOW-01から順に Functional Design → Code Generation）。

### Inception成果物（2026-05-10 整合完了）
- requirements.md: FR-01〜FR-08 + NFR-01〜NFR-06 + R-01〜R-05
- personas.md + stories.md: US-01〜US-25（3エピック＋安全境界）
- application-design.md: 10コンポーネント定義・データフロー・主要ユーザージャーニー
- domain-entities.md: 12エンティティ（PushEvent / ConversationSession / InterestSignal / Candidate等）
- components.md: 10コンポーネントの責務・インターフェース・設計制約
- component-methods.md: TypeScriptメソッドシグネチャ＋Shared Types
- services.md: 5サービス（ConversationService / PushService / EvidenceService / FeedbackService / SafetyService）
- component-dependency.md: 依存マトリクス・通信パターン・データフロー図
- unit-of-work.md: UOW-01〜UOW-07（体験価値・受入基準・MVP境界・トレーサビリティ）

### 勝利戦略
- 技術完成度より**思想・コンセプト・将来性**で勝負
- 審査員への訴求: 「考え方が面白い」＋「実際に動くMVP」
- 差別化の核: 「自分から始めたわけではない」（判断・責任の外部化）
