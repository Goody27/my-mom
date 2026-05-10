現在日付：2026-05-10 JST

============================================================
FILE: aidlc-docs/inception/application-design/application-design.md
===================================================================

# Application Design — MyMom

## 1. Purpose

このドキュメントは、MyMomのInceptionフェーズにおけるApplication Design成果物である。

目的は、`requirements.md`、`requirement-verification-questions.md`、`personas.md`、`stories.md` で定義したプロダクト方針を、MVPとして実現可能なアプリケーション設計へ落とし込むことである。

MyMomの核は、ユーザーが本当は少し気になっているが、自分から動くほどではない行動に対して、**「自分から始めたわけではない」と言える状況**を作ることである。

MVPは「お節介Push・予約代行」である。
MyMomがユーザーに一方的に連絡し、弱い興味や予定を聞き出し、飲食店・展示会・イベントなどの候補を提案し、予約・手配・予定化まで進んだように感じられる体験を実演する。

このApplication Designでは、技術的に過剰な構成を避け、MVP体験を成立させるための最小構成を定義する。

MVPで重視するのは、完全な外部予約API連携ではない。
重要なのは、ユーザーがMyMomに巻き込まれて、予約・手配・予定化に相当するところまで話が進んだように感じられることである。

そのため、以下の代替実装を有効なMVP手段として扱う。

* 疑似予約
* 予約リクエスト生成
* カレンダー予定化
* 予約完了風通知
* 相手に送るメッセージ生成

---

## 2. Design Principles

### 2.1 MyMom-Originated Interaction

MyMomの会話は、ユーザーからではなくMyMomから始まる。

ユーザーが自由に相談を開始できると、「自分から始めた」構造になってしまう。
MyMomの体験では、ユーザーが受動的に巻き込まれることが重要である。

そのため、アプリケーション設計では以下を前提にする。

* 会話の起点はMyMom側に置く
* ユーザーはMyMomからの連絡に返信する
* ユーザーから任意の新規会話を開始する導線はMVPの中心に置かない
* MyMomが候補提示、日程確認、予定化相当の結果生成まで主導する

---

### 2.2 Excuse-First Experience

MyMomの価値は、候補の最適性そのものではなく、ユーザーが言い訳として使える体験にある。

そのため、設計では以下を重視する。

* MyMomから始まったことが履歴として残る
* ユーザーが強く希望したわけではない曖昧さを残す
* MyMomが候補を押したことがわかる
* MyMomが予定化相当の結果まで話を進めたことがわかる
* ユーザーが他者に「MyMomが勝手に進めた」と説明できる

---

### 2.3 Minimal Active Operation

ユーザーの操作は最小限にする。

MyMomの体験では、ユーザーが能動的に検索、比較、選択、手配している感覚を減らす必要がある。
操作が増えるほど、「自分でやった」感覚が強くなる。

MVPでは、ユーザーの操作を以下に絞る。

* MyMomからの通知を受け取る
* MyMomからの連絡に返信する
* 候補に曖昧に反応する
* 日程・場所・相手に関する質問に答える
* 生成された予定やメッセージを確認する
* 体験後に愚痴やフィードバックを返す

---

### 2.4 Booking-Like, Not Booking-Complete

MVPでは、完全な外部予約API連携を必須としない。

MVPで検証するのは、実際の予約完了ではなく、以下の状態である。

* MyMomが候補を提示した
* MyMomが日程や条件を詰めた
* MyMomが予定化相当の結果を生成した
* ユーザーが「行くしかない」と感じた
* ユーザーが「自分から始めたわけではない」と説明できる

そのため、MVPでは以下を正式な実現手段として扱う。

* 疑似予約
* 予約リクエスト生成
* カレンダー予定化
* 予約完了風通知
* 相手に送るメッセージ生成

---

### 2.5 Safety Before Pressure

MyMomはお節介である必要がある。
しかし、お節介が危険な強制になってはならない。

設計では、以下を境界として扱う。

* ユーザーの明確な拒否を尊重する
* 危険・違法・高額・健康被害につながる提案を避ける
* 実害のある制裁や課金を行わない
* MVP対象を日常的で低リスクな行動に絞る
* お節介の強さは、言い訳として使える範囲に留める

---

## 3. MVP Architecture Overview

### 3.1 High-Level Architecture

MyMomのMVPは、以下の最小構成で設計する。

```text id="z4yna4"
Client App
  ↓
Push Scheduler
  ↓
Client Interaction Gate
  ↓
Conversation Orchestrator
  ↓
Interest Signal Detector
  ↓
Candidate Generator
  ↓
Reservation / Planning Adapter
  ↓
Excuse Evidence Store
  ↓
Feedback Collector
  ↓
Safety Boundary
```

ただし、Safety Boundaryは単一の後段処理ではなく、各コンポーネントに横断的に適用される制約として扱う。

---

### 3.2 Component Responsibility Summary

| Component                      | Responsibility              | Main Value         |
| ------------------------------ | --------------------------- | ------------------ |
| Client App                     | ユーザーがMyMomからの連絡を受け取り、返信する画面 | 受動的に巻き込まれる体験を作る    |
| Push Scheduler                 | MyMomから会話を開始するタイミングを制御する    | 自分から始めたわけではない状態を作る |
| Client Interaction Gate        | ユーザー起点の自由会話を制限する            | 行動の起点をMyMom側に保つ    |
| Conversation Orchestrator      | MyMomとの会話全体を制御する            | お節介な会話の流れを作る       |
| Interest Signal Detector       | 弱い興味や曖昧な反応を検知する             | 強い意思になる前の関心を拾う     |
| Candidate Generator            | 飲食店・展示会・イベントなどの候補を生成する      | MyMomが勝手に候補を出す     |
| Reservation / Planning Adapter | 疑似予約、予定化、メッセージ生成を行う         | 行くしかない状態を作る        |
| Excuse Evidence Store          | 会話履歴や予定化相当の結果を保存する          | 言い訳として使える文脈を残す     |
| Feedback Collector             | 体験後の愚痴や感想を受け取る              | 結果を自分だけで抱え込ませない    |
| Safety Boundary                | 危険な提案や明確な拒否の無視を防ぐ           | お節介と安全性の境界を守る      |

---

### 3.3 Recommended Minimal Technical Shape

Inception段階では、以下のような技術構成を想定する。

| Layer               | Example Implementation        | Notes                |
| ------------------- | ----------------------------- | -------------------- |
| Client              | Web App or Mobile Web App     | MVPではチャット風UIを中心にする   |
| API                 | HTTP API                      | Client Appとバックエンドの接続 |
| Scheduling          | Event-based Scheduler         | デモでは手動発火でも可          |
| Conversation        | Server-side Orchestrator      | MyMomの会話状態を管理        |
| AI Generation       | LLM-based Response Generation | 会話、候補提示、文面生成に利用      |
| Data Store          | Key-Value / Document Store    | 会話履歴、候補、予定化相当の結果を保存  |
| Calendar / Planning | Calendar API or Mock Calendar | MVPでは疑似予定でも可         |
| Notification        | Push-like UI Notification     | 実Pushでなくてもデモ上の通知で可   |

この構成は、MVP体験を示すための最小構成である。
Production前提の過剰な監視、複雑なワークフロー、完全な外部予約連携は、MVPの必須範囲に含めない。

---

## 4. Core Components

### 4.1 Client App

#### Responsibility

Client Appは、ユーザーがMyMomからの連絡を受け取り、返信するための画面である。

MVPでは、自由な検索や相談ではなく、MyMomからの連絡に返信する体験を中心にする。

#### Key Functions

* MyMomからの通知を表示する
* MyMomとの会話履歴を表示する
* ユーザーの返信を送信する
* 候補カードを表示する
* 予定化相当の結果を表示する
* 相手に送るメッセージを表示する
* 愚痴やフィードバックを送信する

#### Design Notes

Client Appは、ユーザーに能動的な操作をさせすぎない。
検索欄、自由相談、詳細な設定画面はMVPの中心に置かない。

ユーザーの主な操作は、MyMomからの連絡への返信である。

#### Related Requirements

* FR-01
* FR-02
* FR-07
* FR-08
* NFR-01

---

### 4.2 Push Scheduler

#### Responsibility

Push Schedulerは、MyMomからユーザーへ会話を開始するタイミングを制御する。

MyMomの価値は、ユーザーが自分から始めたわけではない状態を作ることにある。
そのため、Push SchedulerはMVPの中核コンポーネントである。

#### Key Functions

* MyMomからの初回通知を発火する
* デモシナリオ上のPushタイミングを制御する
* 休日、空き時間、過去会話などをもとに連絡タイミングを決める
* ユーザーが返信していない場合の再通知を管理する
* 通知内容をConversation Orchestratorへ渡す

#### MVP Boundary

MVPでは、Pushの完全な自動最適化は不要である。
デモでは、以下のような単純な発火条件でよい。

* デモ開始時
* 一定時間経過
* 休日または空き時間を想定したタイミング
* ユーザーの過去入力に関連するカテゴリがある場合

#### Related Requirements

* FR-01
* FR-02
* NFR-03

#### Related User Stories

* US-01
* US-02
* US-03

---

### 4.3 Client Interaction Gate

#### Responsibility

Client Interaction Gateは、ユーザーからの自由な会話開始を制限し、会話の起点をMyMom側に保つ。

#### Key Functions

* MyMomからのPushに紐づく会話だけを有効にする
* ユーザーが任意の新規会話を開始できないようにする
* 返信可能な会話状態を管理する
* 会話が終了した後の入力制御を行う
* 自由相談ではなく返信中心の体験にする

#### Design Notes

このコンポーネントの目的は、ユーザーの自由を奪うことではない。
目的は、MyMomの体験価値である「自分から始めたわけではない」を保つことである。

#### Related Requirements

* FR-02
* NFR-01
* NFR-03

#### Related User Stories

* US-02
* US-03

---

### 4.4 Conversation Orchestrator

#### Responsibility

Conversation Orchestratorは、MyMomとの会話全体を制御する中核コンポーネントである。

MyMomの会話は、単なる質問応答ではない。
ユーザーの弱い興味を聞き出し、候補提示へ進み、日程や条件を詰め、予定化相当の結果へつなげる必要がある。

#### Key Functions

* 会話状態を管理する
* MyMomの発話を生成する
* ユーザーの返信を受け取る
* Interest Signal Detectorへ発話を渡す
* Candidate Generatorへ候補生成を依頼する
* Reservation / Planning Adapterへ予定化相当の処理を依頼する
* Safety Boundaryによるチェック結果を反映する

#### Conversation States

| State                      | Description         |
| -------------------------- | ------------------- |
| Initiated                  | MyMomから会話が開始された状態   |
| Probing                    | 近況や興味を聞き出している状態     |
| InterestDetected           | 弱い興味が検知された状態        |
| CandidatePresented         | 候補が提示された状態          |
| Planning                   | 日程・場所・相手を詰めている状態    |
| ScheduledLikeResultCreated | 予定化相当の結果が生成された状態    |
| EvidenceStored             | 言い訳として使える履歴が保存された状態 |
| FeedbackRequested          | 体験後の感想や愚痴を待っている状態   |
| Closed                     | 会話が終了した状態           |

#### Related Requirements

* FR-01
* FR-03
* FR-04
* FR-05
* FR-06
* FR-07
* FR-08

#### Related User Stories

* US-01
* US-04
* US-07
* US-10
* US-13
* US-17
* US-20

---

### 4.5 Interest Signal Detector

#### Responsibility

Interest Signal Detectorは、ユーザーの発話から弱い興味や未実行の関心を検知する。

MyMomが拾うべきなのは、強い意思表示ではない。
「まあ」「ちょっと気になる」「予定が合えば」「面倒だけど」などの曖昧な反応である。

#### Key Functions

* ユーザー発話を解析する
* 弱い興味を検知する
* 面倒くささと明確な拒否を区別する
* 行動化できそうなカテゴリを推定する
* Candidate Generatorへ渡す関心カテゴリを作る

#### Detected Signals

| Signal Type          | Example      | Interpretation            |
| -------------------- | ------------ | ------------------------- |
| Weak Interest        | 「ちょっと気になる」   | 候補提示へ進める                  |
| Conditional Interest | 「予定が合えば」     | 日程確認へ進める                  |
| Avoidance            | 「面倒くさい」      | 軽い回避として扱える可能性がある          |
| Excuse-Seeking       | 「誰かが決めてくれたら」 | MyMom主導の予定化と相性がよい         |
| Clear Refusal        | 「本当に行きたくない」  | Safety Boundaryで停止または撤退する |

#### Related Requirements

* FR-03
* NFR-03
* NFR-04

#### Related User Stories

* US-04
* US-05
* US-06
* US-23

---

### 4.6 Candidate Generator

#### Responsibility

Candidate Generatorは、ユーザーの弱い興味に対して、飲食店、展示会、イベントなどの候補を生成する。

候補提示は、ユーザーからの明確な依頼に応じた検索結果ではない。
MyMomが勝手に見つけてきたように見えることが重要である。

#### Key Functions

* Interest Signal Detectorから関心カテゴリを受け取る
* 候補カテゴリを決定する
* 候補を生成または検索する
* 候補をMyMomらしい言い方で提示する
* 候補ごとに日程・場所・相手などの次アクションを付与する

#### Candidate Types

| Candidate Type | Example          |
| -------------- | ---------------- |
| Restaurant     | 気になる相手や友人と行けそうな店 |
| Exhibition     | 休日に行けそうな展示会      |
| Event          | 期間限定イベント         |
| Casual Outing  | 休日の外出先           |
| Message Prompt | 相手に送る誘い文句        |

#### Related Requirements

* FR-04
* NFR-02
* NFR-03

#### Related User Stories

* US-07
* US-08
* US-09

---

### 4.7 Reservation / Planning Adapter

#### Responsibility

Reservation / Planning Adapterは、候補提示後に予約・手配・予定化に相当する結果を生成する。

MVPでは、完全な外部予約API連携を必須としない。
このコンポーネントは、ユーザーが「話が進んでしまった」と感じられる状態を作ることを目的とする。

#### Key Functions

* 日程・場所・人数・相手などの情報を受け取る
* 疑似予約を生成する
* 予約リクエスト文面を生成する
* カレンダー予定を生成する
* 予約完了風通知を生成する
* 相手に送るメッセージを生成する
* 予定化相当の結果をExcuse Evidence Storeへ渡す

#### MVP Output Types

| Output Type                  | Description            |
| ---------------------------- | ---------------------- |
| Mock Reservation             | 予約されたように見えるMVP用の結果     |
| Reservation Request          | 店舗や外部サービスへ送る前提のリクエスト文面 |
| Calendar Event               | 日時・場所・内容が入った予定         |
| Completion-like Notification | MyMomからの予約完了風通知        |
| Message to Other Person      | 相手に送る誘い文面              |

#### Related Requirements

* FR-05
* FR-06
* NFR-05

#### Related User Stories

* US-10
* US-11
* US-12
* US-13
* US-14
* US-15
* US-16

---

### 4.8 Excuse Evidence Store

#### Responsibility

Excuse Evidence Storeは、MyMom主導で会話や予定化相当の結果が進んだことを保存する。

このコンポーネントは、MyMomの中核価値である「言い訳として使える文脈」を支える。

#### Key Functions

* MyMomから会話が始まった履歴を保存する
* ユーザーの曖昧な反応を保存する
* MyMomの候補提示を保存する
* MyMomが日程や相手を詰めた履歴を保存する
* 予定化相当の結果を保存する
* 相手に送るメッセージを保存する
* ユーザーが後から見返せる形に整理する

#### Evidence Types

| Evidence Type           | Description       |
| ----------------------- | ----------------- |
| Push Evidence           | MyMomから会話が始まった記録  |
| Conversation Evidence   | MyMomが会話を主導した記録   |
| Candidate Evidence      | MyMomが候補を提示した記録   |
| Planning Evidence       | MyMomが日程や条件を詰めた記録 |
| Scheduled-like Evidence | 予定化相当の結果          |
| Message Evidence        | 相手に送る文面           |

#### Related Requirements

* FR-07
* NFR-03

#### Related User Stories

* US-17
* US-18
* US-19

---

### 4.9 Feedback Collector

#### Responsibility

Feedback Collectorは、体験後のユーザーからの愚痴や感想を受け取る。

MyMomの体験では、結果をユーザーだけで抱え込ませないことが重要である。
外れ体験であっても、MyMomに文句を言えることで、結果をMyMomとの関係性に回収できる。

#### Key Functions

* 体験後の感想を受け取る
* 愚痴を会話として受け取る
* ポジティブな反応を保存する
* ネガティブな反応を保存する
* 次回候補に活用できる簡易フィードバックを抽出する
* Conversation Orchestratorへ次回の会話材料を渡す

#### Feedback Types

| Feedback Type | Example     | Use          |
| ------------- | ----------- | ------------ |
| Negative      | 「微妙だった」     | 次回候補の調整      |
| Positive      | 「思ったよりよかった」 | 類似候補の強化      |
| Preference    | 「静かな店がいい」   | 条件反映         |
| Social Result | 「相手は楽しんでた」  | 次回文脈に利用      |
| Complaint     | 「あれはない」     | MyMomとの関係性維持 |

#### Related Requirements

* FR-08
* NFR-05

#### Related User Stories

* US-20
* US-21
* US-22

---

### 4.10 Safety Boundary

#### Responsibility

Safety Boundaryは、MyMomのお節介が危険な強制にならないように制御する。

Safety Boundaryは独立した単一機能ではなく、Conversation Orchestrator、Interest Signal Detector、Candidate Generator、Reservation / Planning Adapterに横断的に適用される。

#### Key Functions

* 明確な拒否を検知する
* 危険な行動を候補から除外する
* 違法行為や高リスクな提案を避ける
* 高額・健康被害につながる提案を避ける
* 実害のある制裁や課金を防ぐ
* MyMomの押しが強すぎる場合に表現を調整する

#### Boundary Rules

| Rule                  | Description          |
| --------------------- | -------------------- |
| Clear Refusal Respect | ユーザーの明確な拒否は尊重する      |
| Low-Risk Domain       | MVP対象を日常的で低リスクな行動に絞る |
| No Harmful Pressure   | 実害のある強制をしない          |
| No Illegal Action     | 違法行為を促さない            |
| No Severe Consequence | 重大な損害につながる手配をしない     |

#### Related Requirements

* NFR-04
* R-03
* R-05

#### Related User Stories

* US-23
* US-24
* US-25

---

## 5. Data Flow

### 5.1 End-to-End Flow

MVPの基本的なデータフローは以下である。

```text id="p64grm"
1. Push SchedulerがMyMomからの連絡タイミングを発火する
2. Client AppにMyMomからの通知が表示される
3. Client Interaction Gateが返信可能な会話状態を作る
4. ユーザーがMyMomからの連絡に返信する
5. Conversation Orchestratorが会話状態を更新する
6. Interest Signal Detectorが弱い興味や回避表現を検知する
7. Candidate Generatorが候補を生成する
8. Conversation OrchestratorがMyMomらしい口調で候補を提示する
9. ユーザーが曖昧に反応する
10. Conversation Orchestratorが日程・場所・相手を聞き出す
11. Reservation / Planning Adapterが予定化相当の結果を生成する
12. Excuse Evidence Storeが会話履歴と結果を保存する
13. Client Appが予約完了風通知、カレンダー予定、メッセージ文面などを表示する
14. 体験後、Feedback Collectorが愚痴や感想を受け取る
15. Safety Boundaryが各段階で危険な提案や明確な拒否を処理する
```

---

### 5.2 Data Flow by Component

| Step | Source | Target | Data |
|---|---|---|
| 1 | Push Scheduler | Client App | MyMom initial notification |
| 2 | Client App | Conversation Orchestrator | User reply |
| 3 | Conversation Orchestrator | Interest Signal Detector | User utterance |
| 4 | Interest Signal Detector | Conversation Orchestrator | Interest signal |
| 5 | Conversation Orchestrator | Candidate Generator | Candidate request |
| 6 | Candidate Generator | Conversation Orchestrator | Candidate list |
| 7 | Conversation Orchestrator | Client App | MyMom candidate message |
| 8 | Client App | Conversation Orchestrator | User reaction |
| 9 | Conversation Orchestrator | Reservation / Planning Adapter | Planning context |
| 10 | Reservation / Planning Adapter | Excuse Evidence Store | Scheduled-like result |
| 11 | Excuse Evidence Store | Client App | Evidence and result display |
| 12 | Client App | Feedback Collector | Feedback message |
| 13 | Feedback Collector | Excuse Evidence Store | Feedback record |
| 14 | Safety Boundary | All Components | Safety check result |

---

### 5.3 Data Objects

| Data Object         | Description       | Created By                     | Used By                                             |
| ------------------- | ----------------- | ------------------------------ | --------------------------------------------------- |
| PushEvent           | MyMomからの会話開始イベント  | Push Scheduler                 | Client App, Conversation Orchestrator               |
| ConversationSession | MyMomとの会話単位       | Conversation Orchestrator      | All conversation components                         |
| UserReply           | ユーザーの返信           | Client App                     | Conversation Orchestrator, Interest Signal Detector |
| InterestSignal      | 弱い興味や回避表現の検知結果    | Interest Signal Detector       | Candidate Generator                                 |
| Candidate           | 飲食店・展示会・イベントなどの候補 | Candidate Generator            | Conversation Orchestrator                           |
| PlanningContext     | 日程・場所・相手などの情報     | Conversation Orchestrator      | Reservation / Planning Adapter                      |
| ScheduledLikeResult | 予定化相当の結果          | Reservation / Planning Adapter | Client App, Excuse Evidence Store                   |
| ExcuseEvidence      | MyMom主導の履歴        | Excuse Evidence Store          | Client App                                          |
| FeedbackRecord      | 体験後の愚痴や感想         | Feedback Collector             | Candidate Generator, Conversation Orchestrator      |
| SafetyDecision      | 安全性判定             | Safety Boundary                | All components                                      |

---

## 6. Main User Journey

### 6.1 Journey Overview

MVPでは、以下の体験をメインユーザージャーニーとする。

```text id="ruppaq"
MyMomから連絡が来る
  ↓
ユーザーが渋々返信する
  ↓
MyMomが弱い興味を聞き出す
  ↓
MyMomが候補を提示する
  ↓
MyMomが日程・場所・相手を詰める
  ↓
予約・手配・予定化に相当する結果が生成される
  ↓
MyMom主導の履歴が残る
  ↓
ユーザーが「自分から始めたわけではない」と説明できる
  ↓
体験後にMyMomへ愚痴や感想を返す
```

---

### 6.2 Primary Scenario: 飲食店の予約

#### Step 1: MyMomから連絡が来る

MyMomがユーザーに通知を送る。

Example:

> 「最近どうなの？休みの日ずっと家にいるんじゃないでしょうね」

Related Components:

* Push Scheduler
* Client App
* Client Interaction Gate

Related Stories:

* US-01
* US-02
* US-03

---

#### Step 2: ユーザーが渋々返信する

ユーザーは積極的ではなく、短く曖昧に返信する。

Example:

> 「別に」
> 「まあ」
> 「うるさいな」

Related Components:

* Client App
* Conversation Orchestrator

Related Stories:

* US-03

---

#### Step 3: MyMomが弱い興味を聞き出す

MyMomは近況や人間関係を聞き出し、弱い興味を探る。

Example:

> 「気になる人とかいないの？」
> 「ご飯くらい行けばいいじゃない」

User Example:

> 「まあ、行ってもいいけど面倒くさい」

Related Components:

* Conversation Orchestrator
* Interest Signal Detector

Related Stories:

* US-04
* US-05
* US-06

---

#### Step 4: MyMomが候補を提示する

MyMomはユーザーの弱い興味をもとに、飲食店候補を提示する。

Example:

> 「ほら、こんなお店あるじゃない。ここでいいんじゃない？」

Related Components:

* Candidate Generator
* Conversation Orchestrator
* Client App

Related Stories:

* US-07
* US-08
* US-09

---

#### Step 5: MyMomが日程・場所・相手を詰める

MyMomは日程、場所、人数、相手への連絡を確認する。

Example:

> 「で、いつ空いてるの？」
> 「相手にはちゃんと送ったの？」
> 「じゃあこの文面送りなさい」

Related Components:

* Conversation Orchestrator
* Reservation / Planning Adapter

Related Stories:

* US-10
* US-11
* US-12

---

#### Step 6: 予定化相当の結果が生成される

MyMomは、予約完了風通知、カレンダー予定、予約リクエスト、相手に送るメッセージなどを生成する。

Example:

> 「はい、予定入れたからね。ちゃんと行きなさい」

Related Components:

* Reservation / Planning Adapter
* Client App
* Excuse Evidence Store

Related Stories:

* US-13
* US-14
* US-15
* US-16

---

#### Step 7: 言い訳として使える履歴が残る

MyMomが会話を開始し、候補を出し、予定化相当の結果まで進めた履歴が残る。

User Explanation Example:

> 「MyMomが勝手に進めたから」
> 「自分から始めたわけじゃない」

Related Components:

* Excuse Evidence Store
* Client App

Related Stories:

* US-17
* US-18
* US-19

---

#### Step 8: 体験後に愚痴や感想を返す

ユーザーは体験後にMyMomへ感想を返す。

Example:

> 「正直ちょっと微妙だった」
> 「まあ、行ったら行ったで面白かった」

Related Components:

* Feedback Collector
* Conversation Orchestrator
* Excuse Evidence Store

Related Stories:

* US-20
* US-21
* US-22

---

## 7. Domain Model Overview

### 7.1 Domain Entities

| Entity              | Description      | Key Fields                                              |
| ------------------- | ---------------- | ------------------------------------------------------- |
| User                | MyMomを利用するユーザー   | userId, displayName, preferences, safetySettings        |
| MomPersona          | MyMomの口調・振る舞い設定  | personaId, tone, pressureLevel, phraseStyle             |
| PushEvent           | MyMomからの会話開始イベント | pushId, userId, triggerType, message, scheduledAt       |
| ConversationSession | 1回の会話セッション       | sessionId, userId, state, startedBy, currentStep        |
| ConversationMessage | MyMomまたはユーザーの発話  | messageId, sessionId, sender, text, timestamp           |
| InterestSignal      | 弱い興味や回避表現の検知結果   | signalId, sessionId, signalType, confidence, sourceText |
| Candidate           | MyMomが提示する候補     | candidateId, category, title, location, reason          |
| PlanningContext     | 日程・場所・相手などの情報    | contextId, dateTime, area, participant, note            |
| ScheduledLikeResult | 予定化相当の結果         | resultId, resultType, title, dateTime, message          |
| ExcuseEvidence      | 言い訳として使える履歴      | evidenceId, sessionId, evidenceType, summary            |
| FeedbackRecord      | 体験後の愚痴や感想        | feedbackId, userId, resultId, sentiment, text           |
| SafetyDecision      | 安全性判定            | decisionId, targetType, decision, reason                |

---

### 7.2 Entity Relationships

```text id="i83kgo"
User
  └── MomPersona
  └── PushEvent
        └── ConversationSession
              ├── ConversationMessage
              ├── InterestSignal
              ├── Candidate
              ├── PlanningContext
              ├── ScheduledLikeResult
              ├── ExcuseEvidence
              └── FeedbackRecord

SafetyDecision
  └── applies to PushEvent / ConversationMessage / Candidate / ScheduledLikeResult
```

---

### 7.3 Entity Notes

#### User

Userは、MyMomから連絡される対象である。
MVPでは詳細な長期プロファイルを必須にしない。
最低限、会話、候補、予定化相当の結果を紐づけられればよい。

#### MomPersona

MomPersonaは、MyMomの口調や押しの強さを管理する。
MVPでは、少しうるさいが嫌いになれない母親的な口調を基本とする。

#### PushEvent

PushEventは、MyMomから会話が始まった証跡でもある。
この情報は、Excuse Evidenceの一部として扱う。

#### ConversationSession

ConversationSessionは、MyMomとの会話単位である。
状態遷移を持ち、会話がどの段階にあるかを管理する。

#### InterestSignal

InterestSignalは、ユーザーの弱い興味を表す。
「ちょっと気になる」「面倒だけど」「予定が合えば」などを対象とする。

#### Candidate

Candidateは、MyMomが提示する候補である。
候補の最適性だけでなく、MyMomが勝手に見つけてきた文脈が重要である。

#### ScheduledLikeResult

ScheduledLikeResultは、予約・手配・予定化に相当する結果である。
MVPでは、実際の予約完了ではなく、疑似予約、予定、メッセージなども含む。

#### ExcuseEvidence

ExcuseEvidenceは、MyMom主導で話が進んだことを示す履歴である。
ユーザーが他者に説明するための根拠になる。

#### FeedbackRecord

FeedbackRecordは、体験後の愚痴や感想である。
MVPでは高度な分析よりも、MyMomに結果を返せる体験を優先する。

#### SafetyDecision

SafetyDecisionは、安全性と倫理境界を守るための判定である。
明確な拒否、危険な提案、高額な行動、重大な損害につながる行動を扱う。

---

## 8. Safety and Ethical Boundary

### 8.1 Safety Philosophy

MyMomは「人をダメにする」テーマを扱うが、危険な行動や実害を伴う強制を行うサービスではない。

MyMomが目指すのは、ユーザーが日常の小さな行動に踏み出すための言い訳を作ることである。
そのため、MVPでは対象を日常的で低リスクな行動に絞る。

---

### 8.2 Safety Rules

| Rule ID | Rule       | Description                |
| ------- | ---------- | -------------------------- |
| SR-01   | 明確な拒否の尊重   | ユーザーが明確に拒否した場合、その対象の提案を止める |
| SR-02   | 低リスク対象に限定  | 飲食店、展示会、イベント、休日の外出などに絞る    |
| SR-03   | 危険行為の除外    | 違法・危険・健康被害につながる提案を避ける      |
| SR-04   | 高額行動の除外    | ユーザーに重大な金銭負担を与える提案を避ける     |
| SR-05   | 実害ある強制の禁止  | 実害のある制裁や課金を行わない            |
| SR-06   | 押しすぎの抑制    | MyMomの口調が不快な強制にならないよう調整する  |
| SR-07   | フィードバック可能性 | ユーザーが体験後に愚痴や感想を返せるようにする    |

---

### 8.3 Refusal Handling

ユーザーの反応は、以下のように分類する。

| User Response Type | Example       | Handling       |
| ------------------ | ------------- | -------------- |
| Weak Avoidance     | 「面倒くさい」       | 軽いお節介として会話継続可能 |
| Soft Hesitation    | 「まあ、予定が合えば」   | 日程確認へ進む        |
| Ambiguous Interest | 「気になるっちゃ気になる」 | 候補提示へ進む        |
| Clear Refusal      | 「本当に行きたくない」   | 対象提案を停止する      |
| Safety Concern     | 「それは危ない」      | 提案を停止し、安全側に倒す  |

---

### 8.4 Safety Checks by Component

| Component                      | Safety Check              |
| ------------------------------ | ------------------------- |
| Push Scheduler                 | 過剰な通知頻度になっていないか           |
| Client Interaction Gate        | ユーザーが明確に拒否した後も会話を強制していないか |
| Conversation Orchestrator      | MyMomの口調が不快な強制になっていないか    |
| Interest Signal Detector       | 明確な拒否を軽い回避として誤判定していないか    |
| Candidate Generator            | 危険・高額・重大な候補を出していないか       |
| Reservation / Planning Adapter | 実害ある手配を進めていないか            |
| Excuse Evidence Store          | ユーザーに不利な履歴の扱いになっていないか     |
| Feedback Collector             | ネガティブな反応を次回に反映できるか        |

---

## 9. MVP Implementation Boundary

### 9.1 In Scope

MVPの実装対象は以下である。

* MyMomからの会話開始
* ユーザーからの自由会話開始の制限
* MyMomとのチャット風会話
* 弱い興味の検知
* 飲食店を中心とした候補提示
* 日程・場所・相手の聞き出し
* 疑似予約
* 予約リクエスト生成
* カレンダー予定化
* 予約完了風通知
* 相手に送るメッセージ生成
* MyMom主導の履歴保存
* 体験後の愚痴・フィードバック受け取り
* 安全性と倫理境界の基本判定

---

### 9.2 Out of Scope for MVP

MVPの必須範囲に含めないものは以下である。

* 完全な外部予約API連携
* 複数予約サービスとの深い連携
* 高度な長期パーソナライズ
* 複雑なユーザー設定
* 汎用的な自由相談体験
* 高額な行動の自動手配
* 危険または重大な行動の提案
* 実害のある制裁や課金
* 大規模運用を前提にした複雑な監視設計
* すべてのカテゴリへの完全対応

---

### 9.3 MVP Success Implementation Criteria

MVP実装は、以下を満たせば成立する。

* MyMomから会話が始まる
* ユーザーが自分から始めたわけではない状態が作れる
* ユーザーの弱い興味を検知できる
* MyMomが候補を提示できる
* MyMomが日程や条件を詰められる
* 予約・手配・予定化に相当する結果を生成できる
* MyMom主導の履歴を残せる
* ユーザーが体験後に愚痴や感想を返せる
* 明確な拒否や危険な提案を安全側に処理できる

---

### 9.4 MVP Non-Goal

MVPの目的は、完全な予約プラットフォームを作ることではない。

MVPの目的は、以下の体験を示すことである。

> MyMomが勝手に聞いてきた。
> MyMomが勝手に候補を出した。
> MyMomが勝手に話を進めた。
> だから、自分から始めたわけではない。

---

## 10. Traceability to Requirements and User Stories

### 10.1 Components to Requirements

| Component                      | Related Requirements                            |
| ------------------------------ | ----------------------------------------------- |
| Client App                     | FR-01, FR-02, FR-07, FR-08, NFR-01              |
| Push Scheduler                 | FR-01, FR-02, NFR-03                            |
| Client Interaction Gate        | FR-02, NFR-01, NFR-03                           |
| Conversation Orchestrator      | FR-01, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08 |
| Interest Signal Detector       | FR-03, NFR-03, NFR-04                           |
| Candidate Generator            | FR-04, NFR-02, NFR-03                           |
| Reservation / Planning Adapter | FR-05, FR-06, NFR-05                            |
| Excuse Evidence Store          | FR-07, NFR-03                                   |
| Feedback Collector             | FR-08, NFR-05                                   |
| Safety Boundary                | NFR-04, R-03, R-05                              |

---

### 10.2 Components to User Stories

| Component                      | Related User Stories                            |
| ------------------------------ | ----------------------------------------------- |
| Client App                     | US-01, US-02, US-03, US-13, US-17, US-20        |
| Push Scheduler                 | US-01, US-03                                    |
| Client Interaction Gate        | US-02                                           |
| Conversation Orchestrator      | US-03, US-04, US-05, US-10, US-12, US-20        |
| Interest Signal Detector       | US-04, US-05, US-06, US-23                      |
| Candidate Generator            | US-07, US-08, US-09                             |
| Reservation / Planning Adapter | US-10, US-11, US-12, US-13, US-14, US-15, US-16 |
| Excuse Evidence Store          | US-17, US-18, US-19                             |
| Feedback Collector             | US-20, US-21, US-22                             |
| Safety Boundary                | US-23, US-24, US-25                             |

---

### 10.3 Requirements to Design Flow

| Requirement                         | Design Response                            |
| ----------------------------------- | ------------------------------------------ |
| FR-01: MyMom起点のPush会話開始             | Push Schedulerが会話開始を発火し、Client Appに通知する    |
| FR-02: ユーザー起点の自由会話制限                | Client Interaction Gateが会話開始を制御する          |
| FR-03: 弱い興味・未実行の関心の検知               | Interest Signal Detectorが曖昧な興味を検知する        |
| FR-04: お節介な候補提示                     | Candidate GeneratorがMyMomらしい候補提示を行う        |
| FR-05: 日程・場所・相手の聞き出し                | Conversation Orchestratorが会話内で条件を詰める       |
| FR-06: 予約・手配・予定化の実行                 | Reservation / Planning Adapterが予定化相当の結果を作る |
| FR-07: 言い訳として使える履歴・通知の生成            | Excuse Evidence StoreがMyMom主導の履歴を保存する      |
| FR-08: 愚痴・フィードバックの受け取り              | Feedback Collectorが体験後の反応を保存する             |
| NFR-04: Safety and Ethical Boundary | Safety Boundaryが各段階で安全性を確認する               |
| NFR-05: MVP Feasibility             | 完全連携ではなく疑似予約や予定化でMVP成立を優先する                |

---

### 10.4 Design to Unit of Work Direction

| Unit of Work Direction              | Main Components                                           |
| ----------------------------------- | --------------------------------------------------------- |
| UOW-01: Push Conversation Start     | Push Scheduler, Client App, Client Interaction Gate       |
| UOW-02: Interest Signal Detection   | Conversation Orchestrator, Interest Signal Detector       |
| UOW-03: Candidate Nudge Generation  | Candidate Generator, Conversation Orchestrator            |
| UOW-04: Reservation / Planning Flow | Conversation Orchestrator, Reservation / Planning Adapter |
| UOW-05: Excuse Evidence             | Excuse Evidence Store, Client App                         |
| UOW-06: Feedback Loop               | Feedback Collector, Conversation Orchestrator             |
| UOW-07: Safety Boundary             | Safety Boundary, All Components                           |

---

## 11. Open Design Questions

### 11.1 Push Frequency

#### Question

MyMomからのPush頻度はどの程度にするか？

#### Current Direction

MVPでは、デモシナリオ上の任意タイミングでPushを発生させる。
実運用では、数時間ごと、1日1回、数日に1回など、ユーザーの負担とお節介感のバランスを見て調整する。

#### Related Component

* Push Scheduler

---

### 11.2 Push Trigger Conditions

#### Question

MyMomは何をきっかけにユーザーへ連絡するか？

#### Current Direction

MVPでは、以下の単純条件を想定する。

* デモ開始時
* 一定時間経過
* 休日や予定の空きがあるタイミング
* 過去会話で関心が示されたカテゴリがある場合

#### Related Component

* Push Scheduler
* Conversation Orchestrator

---

### 11.3 Scheduled-Like Result UI

#### Question

予約・手配・予定化に相当する結果を、どのUIで見せるか？

#### Current Direction

MVPでは、以下のいずれか、または組み合わせで表現する。

* 予約完了風通知
* カレンダー予定
* 予約リクエストカード
* 相手に送るメッセージ
* 店舗候補と日時の確定画面

#### Related Component

* Reservation / Planning Adapter
* Client App
* Excuse Evidence Store

---

### 11.4 Mom Persona Strength

#### Question

MyMomの口調は、どの程度押しを強くするか？

#### Current Direction

少しうるさいが、完全には嫌いになれない母親的な口調を目指す。
ユーザーの明確な拒否を無視するほど強くしない。

#### Related Component

* Conversation Orchestrator
* Safety Boundary

---

### 11.5 Clear Refusal Detection

#### Question

ユーザーの明確な拒否をどのように判定するか？

#### Current Direction

MVPでは、以下のような表現を明確な拒否として扱う。

* 「本当に行きたくない」
* 「それはやめて」
* 「今日は無理」
* 「もう送らないで」
* 「それは嫌だ」

一方で、以下は軽い回避として扱える可能性がある。

* 「面倒くさい」
* 「まあ今度でいい」
* 「別にいいけど」
* 「予定が合えば」

#### Related Component

* Interest Signal Detector
* Safety Boundary

---

### 11.6 Feedback Usage

#### Question

体験後の愚痴や感想を、次回以降の候補にどこまで反映するか？

#### Current Direction

MVPでは、フィードバックの保存と簡易反映までを目指す。
高度な長期パーソナライズはMVPの必須範囲にしない。

Example:

* 「騒がしかった」→ 次回は静かな店を優先
* 「遠かった」→ 次回は近い候補を優先
* 「思ったよりよかった」→ 類似候補を出しやすくする

#### Related Component

* Feedback Collector
* Candidate Generator
* Conversation Orchestrator

---

### 11.7 Category Expansion

#### Question

MVPでは、飲食店以外のカテゴリをどこまで扱うか？

#### Current Direction

Primary Use Caseは飲食店の予約に絞る。
展示会、イベント、休日の外出はSecondary Use Caseとして、設計上拡張可能にする。

#### Related Component

* Candidate Generator
* Reservation / Planning Adapter

---

### 11.8 Evidence Presentation

#### Question

言い訳として使える履歴を、どの程度ユーザーに見せるか？

#### Current Direction

MVPでは、会話履歴、予定化相当の結果、相手に送るメッセージを見せる。
ユーザーが「MyMomが勝手に進めた」と説明できる程度の文脈を残す。

#### Related Component

* Excuse Evidence Store
* Client App

---

### 11.9 Final Design Validation

このApplication Designは、以下の観点でRequirementsおよびUser Storiesと整合している。

* MyMomから会話が始まる
* ユーザーから自由に始める体験をMVPの中心に置かない
* 弱い興味を検知する
* MyMomが候補を提示する
* MyMomが日程・場所・相手を詰める
* 完全な外部予約連携なしでも、予約・手配・予定化に相当する結果を作れる
* MyMom主導の履歴を残す
* 体験後に愚痴やフィードバックを返せる
* お節介が危険な強制にならないよう安全性と倫理境界を設ける

この設計をもとに、Unit of Workでは体験価値単位で開発・検証可能な単位へ分解する。
