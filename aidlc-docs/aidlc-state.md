# AI-DLC State — MyMom

## Project Info

| Field        | Value                                  |
| ------------ | -------------------------------------- |
| Project      | MyMom（マイマム）                            |
| Team         | おんぶにだっこ（音部に抱っこ）                        |
| Event        | AWS Summit Japan 2026 AI-DLC Hackathon |
| Request Type | New Project (Greenfield)               |
| Complexity   | Complex                                |
| Scope        | System-wide                            |

## Stage Progress

### 🔵 INCEPTION PHASE

* [x] Workspace Detection
* [x] Requirements Analysis
* [x] User Stories
* [x] Workflow Planning
* [x] Application Design
* [x] Units Generation

### 🟢 CONSTRUCTION PHASE

* [ ] Functional Design — UOW-01: Push Conversation Start
* [ ] Functional Design — UOW-02: Interest Signal Detection
* [ ] Functional Design — UOW-03: Candidate Nudge Generation
* [ ] Functional Design — UOW-04: Reservation / Planning Flow
* [ ] Functional Design — UOW-05: Excuse Evidence
* [ ] Functional Design — UOW-06: Feedback Loop
* [ ] Functional Design — UOW-07: Safety Boundary
* [ ] NFR Requirements
* [ ] Infrastructure Design
* [ ] Code Generation
* [ ] Build and Test

### 🟡 OPERATIONS PHASE

* [ ] Operations

## Units of Work

| Unit ID | Unit Name                   | Priority | Summary                  |
| ------- | --------------------------- | -------- | ------------------------ |
| UOW-01  | Push Conversation Start     | P0       | MyMomから会話が始まる体験を作る       |
| UOW-02  | Interest Signal Detection   | P0       | ユーザーの曖昧な反応から弱い興味を検知する    |
| UOW-03  | Candidate Nudge Generation  | P0       | MyMomが候補を勝手に見つけ、お節介に提示する |
| UOW-04  | Reservation / Planning Flow | P0       | 日程・場所・相手を詰め、予定化相当の結果を作る  |
| UOW-05  | Excuse Evidence             | P0       | ユーザーが言い訳として使える履歴を残す      |
| UOW-06  | Feedback Loop               | P1       | 体験後に愚痴や感想をMyMomへ返せるようにする |
| UOW-07  | Safety Boundary             | P0       | お節介が危険な強制にならないようにする      |

## Extension Configuration

| Extension              | Enabled | Decided At            |
| ---------------------- | ------- | --------------------- |
| Security Baseline      | Yes     | Requirements Analysis |
| Property-Based Testing | No      | Requirements Analysis |

## Evaluation Loop Status

| ループ  | 実施日           | フォーカス           | 主な改善                                                                                                                |
| ---- | ------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1〜15 | 2026-04-28〜29 | 初期MVP候補の検討・実装評価 | 初期案をもとにMVP候補を検討し、体験価値・実現可能性・テーマ適合性を評価。最終方針への転換により、参考扱いとして整理                                                         |
| 16   | 2026-05-10    | Inceptionアーキ転換  | 「言い訳生成 / 言い訳依存」を核とする、お節介Push・予約代行アーキへ全面刷新。提出用Inception成果物を最新方針で再整合                                                  |
| 17   | 2026-05-10    | 提出前整合性確認        | README、Requirements、User Stories、Application Design、Domain Entities、Unit of Work、Execution Planの主導線を確認し、審査観点に合わせて整理 |

## Submission Schedule

| 日付              | マイルストーン                    |
| --------------- | -------------------------- |
| 2026-05-08（金）   | Inception成果物の整合完了目標        |
| 2026-05-10（日）   | 書類選考向け提出準備のハードデッドライン       |
| 2026-05-12（火）正午 | 運営宛に公開GitHubリポジトリURLを共有    |
| 2026-05-15（金）   | 書類選考結果発表                   |
| 2026-05-30（土）   | 予選会                        |
| 2026-06-25〜26   | AWS Summit Japan 2026 / 決勝 |

> プレゼン担当: 長野太郎

## Current Status

Inceptionフェーズ完了。

MyMomは、「言い訳生成 / 言い訳依存」を核とする、お節介Push・予約代行アーキへ全面刷新済み。

提出用Inception成果物は、以下のProduct Thesisに沿って整合済み。

> MyMomは、ユーザーが本当は少し気になっているが、自分から動くほどではない行動に対して、外部からのお節介として介入し、「自分から始めたわけではない」と言える状況を作るAIサービスである。

MVPは、完全な外部予約システムではない。

MVPの本質は、MyMomがユーザーの弱い興味を拾い、候補提示から予約・手配・予定化に相当する結果まで話を進め、ユーザーがMyMomを言い訳として使える状態を作ることである。

Primary Demo Scenarioは飲食店予約。

Secondary Use Casesとして、展示会、イベント、休日の外出、友人との食事、新しい趣味や体験を想定する。

次フェーズはConstruction。

UOW-01から順に、Functional Design → Code Generation → Build and Testへ進む。

## Inception Artifacts

### Submission Entry Point

* `README.md`: 審査員向けの入口。MyMomのIntent、MVP、読み方、Inception成果物への導線を示す

### Requirements

* `aidlc-docs/inception/requirements/requirements.md`: Intent、Problem、Product Thesis、MVP Scope、Functional / Non-Functional Requirements、Success Criteriaを定義
* `aidlc-docs/inception/requirements/requirement-verification-questions.md`: Requirements Analysis and Validationの補助成果物。要件の妥当性を検証する問いと回答を整理

### User Stories

* `aidlc-docs/inception/user-stories/personas.md`: MyMomが対象とするユーザー心理とペルソナを定義
* `aidlc-docs/inception/user-stories/stories.md`: ペルソナとExcuse TriggersをUser Storiesへ展開

### Application Design

* `aidlc-docs/inception/application-design/application-design.md`: MVPを実現する最小アプリケーション構成、コンポーネント、データフロー、主要ユーザージャーニーを定義
* `aidlc-docs/inception/application-design/domain-entities.md`: MVPが扱う主要エンティティとデータ構造を定義
* `aidlc-docs/inception/application-design/unit-of-work.md`: Requirements、User Stories、Application Design、Domain Entitiesを実装・検証可能なUnit of Workへ分解

### Execution Plan

* `aidlc-docs/inception/plans/execution-plan.md`: MVPをどの順番で実装・検証し、デモ成立状態まで持っていくかを整理

## Inception Traceability

Inception成果物は、以下の流れで接続されている。

Intent
↓
Requirements
↓
User Stories
↓
Application Design
↓
Domain Entities
↓
Unit of Work
↓
Execution Plan

## MVP Critical Path

MVPの最小成立に必要なCritical Pathは以下である。

UOW-01: Push Conversation Start
↓
UOW-02: Interest Signal Detection
↓
UOW-03: Candidate Nudge Generation
↓
UOW-04: Reservation / Planning Flow
↓
UOW-05: Excuse Evidence

UOW-07: Safety Boundaryは、最後に追加する後段処理ではなく、以下に横断適用される安全境界である。

UOW-07: Safety Boundary
├─ applies to UOW-02: Interest Signal Detection
├─ applies to UOW-03: Candidate Nudge Generation
└─ applies to UOW-04: Reservation / Planning Flow

UOW-06: Feedback LoopはP1として、最小MVP成立後に体験の説得力と継続性を高めるために追加する。

## Submission Strategy

* 技術完成度だけでなく、Intent、テーマ解釈、Unit分解、ドキュメント品質で勝負する
* 審査員への訴求は、「人をダメにする」の解釈の面白さと、Inception成果物としての追いやすさを重視する
* 差別化の核は、「自分から始めたわけではない」と言える状況を作ること
* MVPデモでは、飲食店予約を代表例として、お節介Pushから予定化相当の結果、言い訳として使える履歴までを一連の体験として見せる
* Constructionの詳細は、書類審査後にUnit of Work単位で進める
