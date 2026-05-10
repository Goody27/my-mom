# Components — MyMom

## 1. Purpose

このドキュメントは、MyMomのInceptionフェーズにおけるApplication Design成果物である。

`application-design.md` で定義した10コンポーネントの責務・インターフェース・設計上の制約を整理する。

---

## 2. Component Overview

| Component | Responsibility | Layer |
|---|---|---|
| Client App | MyMomからの連絡を受け取り、返信する画面 | Presentation |
| Push Scheduler | MyMomから会話を開始するタイミングを制御する | Application |
| Client Interaction Gate | ユーザー起点の自由会話を制限する | Application |
| Conversation Orchestrator | MyMomとの会話全体を制御する | Application (Core) |
| Interest Signal Detector | 弱い興味や曖昧な反応を検知する | Domain |
| Candidate Generator | 飲食店・展示会・イベントなどの候補を生成する | Domain |
| Reservation / Planning Adapter | 疑似予約・予定化・メッセージ生成を行う | Domain |
| Excuse Evidence Store | MyMom主導の履歴・予定化相当の結果を保存する | Infrastructure |
| Feedback Collector | 体験後の愚痴や感想を受け取る | Application |
| Safety Boundary | 危険な提案や明確な拒否の無視を防ぐ（横断的制約） | Cross-cutting |

---

## 3. Component Details

### 3.1 Client App

#### Responsibility

ユーザーがMyMomからの連絡を受け取り、返信するための画面。
ユーザーに能動的な操作をさせすぎない設計にする。

#### Key Interfaces

- MyMomからの通知を表示する
- MyMomとの会話履歴を表示する
- ユーザーの返信を受け付ける
- 候補カードを表示する
- 予定化相当の結果を表示する
- 相手に送るメッセージを表示する
- 愚痴やフィードバックを送信する

#### Design Constraints

- 自由相談・検索欄・詳細設定はMVPの中心に置かない
- ユーザーの主操作はMyMomからの連絡への返信

#### Related Requirements

FR-01, FR-02, FR-07, FR-08, NFR-01

---

### 3.2 Push Scheduler

#### Responsibility

MyMomからユーザーへ会話を開始するタイミングを制御する。
MyMomの価値である「ユーザーが自分から始めたわけではない」状態を作る中核コンポーネント。

#### Key Interfaces

- MyMomからの初回通知を発火する
- デモシナリオ上のPushタイミングを制御する
- 休日・空き時間・過去会話などをもとに連絡タイミングを決める
- 未返信時の再通知を管理する
- 通知内容をConversation Orchestratorへ渡す

#### MVP Boundary

MVPではPushの完全な自動最適化は不要。デモ開始・一定時間経過・休日想定タイミングで発火する単純条件でよい。

#### Related Requirements

FR-01, FR-02, NFR-03

---

### 3.3 Client Interaction Gate

#### Responsibility

ユーザーからの自由な会話開始を制限し、会話の起点をMyMom側に保つ。

#### Key Interfaces

- MyMomからのPushに紐づく会話だけを有効にする
- ユーザーが任意の新規会話を開始できないようにする
- 返信可能な会話状態を管理する
- 会話終了後の入力を制御する

#### Design Constraints

目的はユーザーの自由を奪うことではなく、「自分から始めたわけではない」体験価値を保つこと。

#### Related Requirements

FR-02, NFR-01, NFR-03

---

### 3.4 Conversation Orchestrator

#### Responsibility

MyMomとの会話全体を制御する中核コンポーネント。
弱い興味の聞き出し→候補提示→日程詰め→予定化相当の結果生成まで主導する。

#### Key Interfaces

- 会話状態を管理する
- MyMomの発話を生成する
- ユーザーの返信を受け取る
- Interest Signal Detectorへ発話を渡す
- Candidate Generatorへ候補生成を依頼する
- Reservation / Planning Adapterへ予定化を依頼する
- Safety Boundaryのチェック結果を反映する

#### Conversation States

| State | Description |
|---|---|
| Initiated | MyMomから会話が開始された状態 |
| Probing | 近況や興味を聞き出している状態 |
| InterestDetected | 弱い興味が検知された状態 |
| CandidatePresented | 候補が提示された状態 |
| Planning | 日程・場所・相手を詰めている状態 |
| ScheduledLikeResultCreated | 予定化相当の結果が生成された状態 |
| EvidenceStored | 言い訳として使える履歴が保存された状態 |
| FeedbackRequested | 体験後の感想や愚痴を待っている状態 |
| Closed | 会話が終了した状態 |

#### Related Requirements

FR-01, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08

---

### 3.5 Interest Signal Detector

#### Responsibility

ユーザーの発話から弱い興味や未実行の関心を検知する。
強い意思表示ではなく、「まあ」「ちょっと気になる」「面倒だけど」などの曖昧な反応を対象とする。

#### Key Interfaces

- ユーザー発話を解析する
- 弱い興味を検知する
- 面倒くささと明確な拒否を区別する
- 行動化できそうなカテゴリを推定する
- Candidate Generatorへ渡す関心カテゴリを作る

#### Detected Signal Types

| Signal Type | Example | Interpretation |
|---|---|---|
| Weak Interest | 「ちょっと気になる」 | 候補提示へ進める |
| Conditional Interest | 「予定が合えば」 | 日程確認へ進める |
| Avoidance | 「面倒くさい」 | 軽い回避として扱える可能性がある |
| Excuse-Seeking | 「誰かが決めてくれたら」 | MyMom主導の予定化と相性がよい |
| Clear Refusal | 「本当に行きたくない」 | Safety Boundaryで停止または撤退する |

#### Related Requirements

FR-03, NFR-03, NFR-04

---

### 3.6 Candidate Generator

#### Responsibility

ユーザーの弱い興味に対して、飲食店・展示会・イベントなどの候補を生成する。
候補はユーザーからの明確な依頼に応じた検索結果ではなく、MyMomが勝手に見つけてきたように見えることが重要。

#### Key Interfaces

- Interest Signal Detectorから関心カテゴリを受け取る
- 候補カテゴリを決定する
- 候補を生成または検索する
- 候補をMyMomらしい言い方で提示する
- 候補ごとに次アクション（日程・場所・相手）を付与する

#### Candidate Types

| Type | Example |
|---|---|
| Restaurant | 気になる相手や友人と行けそうな店 |
| Exhibition | 休日に行けそうな展示会 |
| Event | 期間限定イベント |
| Casual Outing | 休日の外出先 |
| Message Prompt | 相手に送る誘い文句 |

#### Related Requirements

FR-04, NFR-02, NFR-03

---

### 3.7 Reservation / Planning Adapter

#### Responsibility

候補提示後に予約・手配・予定化に相当する結果を生成する。
MVPでは完全な外部予約API連携を必須とせず、「話が進んでしまった」と感じさせることを目的とする。

#### Key Interfaces

- 日程・場所・人数・相手などの情報を受け取る
- 疑似予約を生成する
- 予約リクエスト文面を生成する
- カレンダー予定を生成する
- 予約完了風通知を生成する
- 相手に送るメッセージを生成する
- 予定化相当の結果をExcuse Evidence Storeへ渡す

#### MVP Output Types

| Output Type | Description |
|---|---|
| Mock Reservation | 予約されたように見えるMVP用の結果 |
| Reservation Request | 店舗や外部サービスへ送る前提のリクエスト文面 |
| Calendar Event | 日時・場所・内容が入った予定 |
| Completion-like Notification | MyMomからの予約完了風通知 |
| Message to Other Person | 相手に送る誘い文面 |

#### Related Requirements

FR-05, FR-06, NFR-05

---

### 3.8 Excuse Evidence Store

#### Responsibility

MyMom主導で会話や予定化相当の結果が進んだことを保存する。
MyMomの中核価値である「言い訳として使える文脈」を支える。

#### Key Interfaces

- MyMomから会話が始まった履歴を保存する
- ユーザーの曖昧な反応を保存する
- MyMomの候補提示履歴を保存する
- MyMomが日程や相手を詰めた履歴を保存する
- 予定化相当の結果を保存する
- 相手に送るメッセージを保存する
- ユーザーが後から見返せる形に整理する

#### Evidence Types

| Type | Description |
|---|---|
| Push Evidence | MyMomから会話が始まった記録 |
| Conversation Evidence | MyMomが会話を主導した記録 |
| Candidate Evidence | MyMomが候補を提示した記録 |
| Planning Evidence | MyMomが日程や条件を詰めた記録 |
| Scheduled-like Evidence | 予定化相当の結果 |
| Message Evidence | 相手に送る文面 |

#### Related Requirements

FR-07, NFR-03

---

### 3.9 Feedback Collector

#### Responsibility

体験後のユーザーからの愚痴や感想を受け取る。
結果をユーザーだけで抱え込ませず、MyMomとの関係性として回収する。

#### Key Interfaces

- 体験後の感想を受け取る
- 愚痴を会話として受け取る
- ポジティブ・ネガティブな反応を保存する
- 次回候補に活用できる簡易フィードバックを抽出する
- Conversation Orchestratorへ次回の会話材料を渡す

#### Feedback Types

| Type | Example | Use |
|---|---|---|
| Negative | 「微妙だった」 | 次回候補の調整 |
| Positive | 「思ったよりよかった」 | 類似候補の強化 |
| Preference | 「静かな店がいい」 | 条件反映 |
| Social Result | 「相手は楽しんでた」 | 次回文脈に利用 |
| Complaint | 「あれはない」 | MyMomとの関係性維持 |

#### Related Requirements

FR-08, NFR-05

---

### 3.10 Safety Boundary

#### Responsibility

MyMomのお節介が危険な強制にならないよう制御する。
単独のコンポーネントではなく、各コンポーネントに横断的に適用される制約として機能する。

#### Key Interfaces

- 明確な拒否を検知する
- 危険な行動を候補から除外する
- 違法行為・高額行動・健康被害につながる提案を避ける
- 実害のある強制や課金を防ぐ
- MyMomの押しが強すぎる場合に表現を調整する

#### Boundary Rules

| Rule | Description |
|---|---|
| Clear Refusal Respect | ユーザーの明確な拒否は尊重する |
| Low-Risk Domain | MVP対象を日常的で低リスクな行動に絞る |
| No Harmful Pressure | 実害のある強制をしない |
| No Illegal Action | 違法行為を促さない |
| No Severe Consequence | 重大な損害につながる手配をしない |

#### Related Requirements

NFR-04, R-03, R-05
