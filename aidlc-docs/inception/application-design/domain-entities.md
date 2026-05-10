現在日付：2026-05-10 JST

============================================================
FILE: aidlc-docs/inception/application-design/domain-entities.md
================================================================

# Domain Entities — MyMom

## 1. Purpose

このドキュメントは、MyMomのInceptionフェーズにおけるApplication Design補助成果物である。

目的は、`application-design.md` で定義したMVPアーキテクチャを、アプリケーションが扱うデータ構造として整理することである。

MyMomの核は、ユーザーが本当は少し気になっているが、自分から動くほどではない行動に対して、**「自分から始めたわけではない」と言える状況**を作ることである。

MVPは「お節介Push・予約代行」である。
MyMomがユーザーに一方的に連絡し、弱い興味や予定を聞き出し、飲食店・展示会・イベントなどの候補を提案し、予約・手配・予定化まで進んだように感じられる体験を実演する。

このドキュメントでは、MVP体験を成立させるために必要な最小限のドメインエンティティを定義する。

対象とする主要コンポーネントは以下である。

* Client App
* Push Scheduler
* Client Interaction Gate
* Conversation Orchestrator
* Interest Signal Detector
* Candidate Generator
* Reservation / Planning Adapter
* Excuse Evidence Store
* Feedback Collector
* Safety Boundary

MVPでは、完全な外部予約API連携は必須としない。
そのため、実際の外部予約完了ではなく、以下を扱えるデータ構造を定義する。

* 疑似予約
* 予約リクエスト生成
* カレンダー予定化
* 予約完了風通知
* 相手に送るメッセージ生成

高度な長期パーソナライズ、大規模分析、複雑な契約・課金・監視はMVP外として扱う。

---

## 2. Entity Overview

### 2.1 Core Entity List

| Entity              | Summary           | Primary Component              |
| ------------------- | ----------------- | ------------------------------ |
| User                | MyMomを利用するユーザー    | Client App                     |
| MomPersona          | MyMomの口調・押し方・振る舞い | Conversation Orchestrator      |
| PushEvent           | MyMomからの会話開始イベント  | Push Scheduler                 |
| ConversationSession | MyMomとの1回の会話単位    | Conversation Orchestrator      |
| ConversationMessage | MyMomまたはユーザーの発話   | Conversation Orchestrator      |
| InterestSignal      | ユーザーの弱い興味や回避表現    | Interest Signal Detector       |
| Candidate           | MyMomが提示する候補      | Candidate Generator            |
| PlanningContext     | 日程・場所・相手などの予定化条件  | Conversation Orchestrator      |
| ScheduledLikeResult | 予約・手配・予定化に相当する結果  | Reservation / Planning Adapter |
| ExcuseEvidence      | MyMom主導で話が進んだ証跡   | Excuse Evidence Store          |
| FeedbackRecord      | 体験後の愚痴や感想         | Feedback Collector             |
| SafetyDecision      | 安全性と倫理境界に関する判定    | Safety Boundary                |

---

### 2.2 Entity Roles

| Role                   | Entities                       |
| ---------------------- | ------------------------------ |
| User Context           | User, MomPersona               |
| Conversation Start     | PushEvent, ConversationSession |
| Conversation Content   | ConversationMessage            |
| Interest Detection     | InterestSignal                 |
| Candidate and Planning | Candidate, PlanningContext     |
| Scheduled-like Result  | ScheduledLikeResult            |
| Excuse Formation       | ExcuseEvidence                 |
| Feedback Loop          | FeedbackRecord                 |
| Safety Control         | SafetyDecision                 |

---

### 2.3 MVP Data Principles

MVPのドメイン設計では、以下の方針を採用する。

* ユーザーの行動を完全に自動化するのではなく、MyMomに巻き込まれた体験を表現する
* 実予約の完了ではなく、予定化相当の結果を扱う
* 強い意思表示ではなく、弱い興味や曖昧な反応を扱う
* MyMomが会話を開始し、候補を押し、予定化相当の結果まで進めた証跡を残す
* ユーザーの明確な拒否や危険な候補はSafetyDecisionとして扱う
* MVPで不要な大規模分析、課金、契約、複雑な監視は持ち込まない

---

## 3. Entity Relationship Overview

### 3.1 High-Level Relationship

```text id="q7554z"
User
  ├── MomPersona
  ├── PushEvent
  │     └── ConversationSession
  │           ├── ConversationMessage
  │           ├── InterestSignal
  │           ├── Candidate
  │           ├── PlanningContext
  │           ├── ScheduledLikeResult
  │           ├── ExcuseEvidence
  │           └── FeedbackRecord
  └── SafetyDecision

SafetyDecision
  ├── applies to ConversationMessage
  ├── applies to InterestSignal
  ├── applies to Candidate
  ├── applies to PlanningContext
  └── applies to ScheduledLikeResult
```

---

### 3.2 Relationship Summary

| Source Entity       | Target Entity       | Relationship              |
| ------------------- | ------------------- | ------------------------- |
| User                | MomPersona          | Userに対してMyMomの振る舞い設定が紐づく  |
| User                | PushEvent           | Userに対してMyMomからのPushが発生する |
| PushEvent           | ConversationSession | Pushをきっかけに会話セッションが作られる    |
| ConversationSession | ConversationMessage | セッション内に発話が蓄積される           |
| ConversationMessage | InterestSignal      | ユーザー発話から弱い興味が検知される        |
| InterestSignal      | Candidate           | 検知された興味をもとに候補が生成される       |
| Candidate           | PlanningContext     | 候補をもとに日程・場所・相手などが詰められる    |
| PlanningContext     | ScheduledLikeResult | 予定化相当の結果が生成される            |
| ConversationSession | ExcuseEvidence      | MyMom主導の流れが証跡として保存される     |
| ScheduledLikeResult | ExcuseEvidence      | 予定化相当の結果が言い訳の証跡になる        |
| ScheduledLikeResult | FeedbackRecord      | 体験後の愚痴や感想が紐づく             |
| SafetyDecision      | Candidate           | 候補が安全かどうか判定される            |
| SafetyDecision      | ScheduledLikeResult | 予定化相当の結果が安全かどうか判定される      |

---

### 3.3 Lifecycle Overview

MyMomのMVPでは、主要エンティティは以下の流れで生成・更新される。

1. Userに対してMomPersonaが適用される
2. Push SchedulerがPushEventを生成する
3. PushEventを起点にConversationSessionが開始される
4. MyMomとユーザーのやり取りがConversationMessageとして保存される
5. Interest Signal Detectorがユーザー発話からInterestSignalを生成する
6. Candidate GeneratorがInterestSignalをもとにCandidateを生成する
7. Conversation OrchestratorがPlanningContextを形成する
8. Reservation / Planning AdapterがScheduledLikeResultを生成する
9. Excuse Evidence StoreがPushEvent、ConversationMessage、Candidate、PlanningContext、ScheduledLikeResultをもとにExcuseEvidenceを生成する
10. 体験後、Feedback CollectorがFeedbackRecordを生成する
11. Safety Boundaryが各段階でSafetyDecisionを生成または参照する

---

## 4. Core Entities

### 4.1 User

#### Purpose

Userは、MyMomを利用するユーザーを表すエンティティである。

MVPでは、ユーザーの詳細な長期プロファイルを持つことよりも、MyMomからのPush、会話、候補、予定化相当の結果、言い訳として使える履歴を紐づけられることを重視する。

#### Why it matters for MyMom

MyMomは、ユーザーが自分から始めたわけではない状態を作る。
そのため、UserにはMyMomからのPushや会話履歴が紐づく必要がある。

ただし、MVPでは過度なパーソナライズは不要である。
最低限、ユーザーごとの会話状態、候補、予定化相当の結果、フィードバックを扱えればよい。

#### Key Fields

| Field              | Type     | Description          |
| ------------------ | -------- | -------------------- |
| userId             | string   | ユーザーID               |
| displayName        | string   | 表示名                  |
| timezone           | string   | 通知や予定化に使うタイムゾーン      |
| preferredArea      | string   | 候補提示に使う主な活動エリア       |
| notificationStatus | enum     | Push通知の受け取り状態        |
| safetySettings     | object   | 明確な拒否や対象外カテゴリなどの安全設定 |
| createdAt          | datetime | 作成日時                 |
| updatedAt          | datetime | 更新日時                 |

#### Created By

* Client App

#### Used By

* Push Scheduler
* Conversation Orchestrator
* Candidate Generator
* Reservation / Planning Adapter
* Excuse Evidence Store
* Feedback Collector
* Safety Boundary

#### Related Requirements

* FR-01
* FR-02
* FR-07
* FR-08
* NFR-01
* NFR-04

#### Related User Stories

* US-01
* US-02
* US-17
* US-20
* US-23

#### MVP Boundary

MVPでは、Userに高度な長期プロファイルを持たせない。
購買履歴、詳細な性格診断、大規模な行動分析はMVP外とする。

---

### 4.2 MomPersona

#### Purpose

MomPersonaは、MyMomの口調、押しの強さ、発話スタイルを表すエンティティである。

#### Why it matters for MyMom

MyMomは、丁寧なAIアシスタントではない。
少しうるさく、少し押しが強く、でも完全には嫌いになれない母親的なお節介として振る舞う必要がある。

MomPersonaは、MyMomの発話が単なる機械的な提案にならないようにするために必要である。

#### Key Fields

| Field                 | Type     | Description |
| --------------------- | -------- | ----------- |
| personaId             | string   | Persona ID  |
| name                  | string   | Persona名    |
| tone                  | enum     | 口調の種類       |
| pressureLevel         | enum     | 押しの強さ       |
| phraseStyle           | string   | 発話スタイル      |
| refusalResponseStyle  | string   | 明確な拒否への返し方  |
| feedbackResponseStyle | string   | 愚痴や感想への返し方  |
| createdAt             | datetime | 作成日時        |
| updatedAt             | datetime | 更新日時        |

#### Created By

* Conversation Orchestrator

#### Used By

* Conversation Orchestrator
* Candidate Generator
* Feedback Collector
* Safety Boundary

#### Related Requirements

* NFR-02
* NFR-03
* NFR-04
* R-03

#### Related User Stories

* US-03
* US-05
* US-08
* US-20
* US-25

#### MVP Boundary

MVPでは、複数の高度なキャラクター分岐は必須にしない。
基本となるMyMomの口調を1つ定義し、必要に応じて押しの強さを安全側に調整できればよい。

---

### 4.3 PushEvent

#### Purpose

PushEventは、MyMomからユーザーへ会話を開始するためのイベントである。

#### Why it matters for MyMom

MyMomの価値は、ユーザーが自分から始めたわけではない状態を作ることにある。
そのため、PushEventは単なる通知ではなく、MyMom主導の体験が始まった証跡でもある。

PushEventが残ることで、後から「MyMomから連絡が来た」と説明できる。

#### Key Fields

| Field            | Type     | Description                     |
| ---------------- | -------- | ------------------------------- |
| pushId           | string   | PushEvent ID                    |
| userId           | string   | 対象ユーザーID                        |
| triggerType      | enum     | 発火理由                            |
| message          | string   | MyMomからの初回通知文                   |
| scheduledAt      | datetime | 通知予定日時                          |
| sentAt           | datetime | 実際の送信日時                         |
| status           | enum     | pending, sent, replied, expired |
| relatedSessionId | string   | 紐づくConversationSession ID       |

#### Created By

* Push Scheduler

#### Used By

* Client App
* Client Interaction Gate
* Conversation Orchestrator
* Excuse Evidence Store

#### Related Requirements

* FR-01
* FR-02
* NFR-03

#### Related User Stories

* US-01
* US-02
* US-03
* US-17

#### MVP Boundary

MVPでは、Pushタイミングの高度な最適化は不要である。
デモ開始時、一定時間経過、休日想定などの単純な発火条件でよい。

---

### 4.4 ConversationSession

#### Purpose

ConversationSessionは、MyMomとユーザーの1回の会話単位を表すエンティティである。

#### Why it matters for MyMom

MyMomの体験は、Pushから始まり、弱い興味の検知、候補提示、日程確認、予定化相当の結果生成、証跡保存へ進む。
ConversationSessionは、この一連の流れを管理する。

セッションの状態を持つことで、MyMomがどこまで話を進めたかを追跡できる。

#### Key Fields

| Field          | Type     | Description            |
| -------------- | -------- | ---------------------- |
| sessionId      | string   | ConversationSession ID |
| userId         | string   | ユーザーID                 |
| pushId         | string   | 起点となったPushEvent ID     |
| state          | enum     | 会話状態                   |
| startedBy      | enum     | 会話開始主体                 |
| currentStep    | enum     | 現在の会話ステップ              |
| primaryUseCase | enum     | 飲食店、展示会、イベントなど         |
| createdAt      | datetime | 作成日時                   |
| updatedAt      | datetime | 更新日時                   |
| closedAt       | datetime | 終了日時                   |

#### State Examples

| State                      | Description     |
| -------------------------- | --------------- |
| Initiated                  | MyMomから会話が開始された |
| Probing                    | 近況や興味を聞き出している   |
| InterestDetected           | 弱い興味が検知された      |
| CandidatePresented         | 候補が提示された        |
| Planning                   | 日程・場所・相手を詰めている  |
| ScheduledLikeResultCreated | 予定化相当の結果が生成された  |
| EvidenceStored             | 証跡が保存された        |
| FeedbackRequested          | 体験後の感想を待っている    |
| Closed                     | 会話が終了した         |

#### Created By

* Conversation Orchestrator

#### Used By

* Client App
* Client Interaction Gate
* Conversation Orchestrator
* Interest Signal Detector
* Candidate Generator
* Reservation / Planning Adapter
* Excuse Evidence Store
* Feedback Collector
* Safety Boundary

#### Related Requirements

* FR-01
* FR-02
* FR-03
* FR-04
* FR-05
* FR-06
* FR-07
* FR-08

#### Related User Stories

* US-01
* US-03
* US-04
* US-07
* US-10
* US-13
* US-17
* US-20

#### MVP Boundary

MVPでは、複雑な会話分岐や長期会話管理は不要である。
1回のPushから予定化相当の結果生成までを追跡できればよい。

---

### 4.5 ConversationMessage

#### Purpose

ConversationMessageは、MyMomまたはユーザーの発話を表すエンティティである。

#### Why it matters for MyMom

MyMomの価値は、会話の流れに強く依存する。
MyMomが会話を始めたこと、ユーザーが曖昧に反応したこと、MyMomが候補や日程を押したことが、後から言い訳として使える文脈になる。

そのため、ConversationMessageはExcuseEvidenceの材料になる。

#### Key Fields

| Field            | Type     | Description                                                  |
| ---------------- | -------- | ------------------------------------------------------------ |
| messageId        | string   | ConversationMessage ID                                       |
| sessionId        | string   | ConversationSession ID                                       |
| sender           | enum     | mom, user, system                                            |
| text             | string   | 発話内容                                                         |
| messageType      | enum     | notification, reply, question, candidate, planning, feedback |
| timestamp        | datetime | 発話日時                                                         |
| toneTag          | enum     | お節介、確認、押し、受け止めなど                                             |
| safetyChecked    | boolean  | Safety Boundaryによる確認済みか                                      |
| safetyDecisionId | string   | SafetyDecision ID                                            |

#### Created By

* Client App
* Conversation Orchestrator

#### Used By

* Interest Signal Detector
* Candidate Generator
* Reservation / Planning Adapter
* Excuse Evidence Store
* Feedback Collector
* Safety Boundary

#### Related Requirements

* FR-01
* FR-03
* FR-04
* FR-05
* FR-07
* FR-08
* NFR-02
* NFR-03

#### Related User Stories

* US-03
* US-04
* US-05
* US-06
* US-07
* US-10
* US-17
* US-20

#### MVP Boundary

MVPでは、すべての発話に高度な分析タグを付ける必要はない。
ただし、MyMom主導の流れを示すために、sender、messageType、timestampは必須とする。

---

### 4.6 InterestSignal

#### Purpose

InterestSignalは、ユーザー発話から検知された弱い興味、曖昧な関心、軽い回避、外部きっかけへの期待を表すエンティティである。

#### Why it matters for MyMom

MyMomが扱うべきなのは、ユーザーが明確に「行きたい」と言った行動だけではない。
むしろ、以下のような曖昧な反応が重要である。

* ちょっと気になる
* まあ行ってもいい
* 予定が合えば
* 面倒くさい
* 自分で探すほどではない
* 誰かが決めてくれたら

InterestSignalは、こうした弱い興味を候補提示や予定化相当の結果生成へつなげるために必要である。

ただし、明確な拒否はInterestSignalだけで進めず、SafetyDecisionへ接続する。

#### Key Fields

| Field            | Type     | Description                                                                   |
| ---------------- | -------- | ----------------------------------------------------------------------------- |
| signalId         | string   | InterestSignal ID                                                             |
| sessionId        | string   | ConversationSession ID                                                        |
| sourceMessageId  | string   | 元になったConversationMessage ID                                                   |
| signalType       | enum     | weak_interest, conditional_interest, avoidance, excuse_seeking, clear_refusal |
| categoryHint     | enum     | restaurant, exhibition, event, outing, unknown                                |
| sourceText       | string   | 検知元の発話                                                                        |
| confidence       | number   | 検知確度                                                                          |
| actionability    | enum     | continue_probe, generate_candidate, ask_schedule, stop                        |
| safetyDecisionId | string   | 必要に応じて紐づくSafetyDecision ID                                                    |
| createdAt        | datetime | 作成日時                                                                          |

#### Created By

* Interest Signal Detector

#### Used By

* Conversation Orchestrator
* Candidate Generator
* Safety Boundary
* Excuse Evidence Store

#### Related Requirements

* FR-03
* FR-04
* NFR-03
* NFR-04

#### Related User Stories

* US-04
* US-05
* US-06
* US-23

#### MVP Boundary

MVPでは、完全な感情分析や高度な心理推定は不要である。
弱い興味、軽い回避、明確な拒否を大まかに分類できればよい。

---

### 4.7 Candidate

#### Purpose

Candidateは、MyMomがユーザーへ提示する飲食店、展示会、イベント、休日の外出先、または相手に送る誘い文句の候補を表すエンティティである。

#### Why it matters for MyMom

Candidateは、単なる検索結果ではない。
MyMomが勝手に見つけてきたように提示されることで、ユーザーは「自分で探したわけではない」と言える。

候補の最適性だけでなく、MyMom主導で提示された文脈が重要である。

#### Key Fields

| Field            | Type     | Description                                           |
| ---------------- | -------- | ----------------------------------------------------- |
| candidateId      | string   | Candidate ID                                          |
| sessionId        | string   | ConversationSession ID                                |
| signalId         | string   | 元になったInterestSignal ID                                |
| category         | enum     | restaurant, exhibition, event, outing, message_prompt |
| title            | string   | 候補名                                                   |
| description      | string   | 候補説明                                                  |
| location         | string   | 場所                                                    |
| suggestedReason  | string   | MyMomが候補として出す理由                                       |
| momPushPhrase    | string   | MyMomらしい押し文句                                          |
| riskLevel        | enum     | low, medium, high                                     |
| safetyDecisionId | string   | SafetyDecision ID                                     |
| createdAt        | datetime | 作成日時                                                  |

#### Created By

* Candidate Generator

#### Used By

* Conversation Orchestrator
* Reservation / Planning Adapter
* Excuse Evidence Store
* Safety Boundary

#### Related Requirements

* FR-04
* FR-05
* FR-07
* NFR-02
* NFR-03
* NFR-04

#### Related User Stories

* US-07
* US-08
* US-09
* US-10
* US-17

#### MVP Boundary

MVPでは、候補検索の完全性は必須ではない。
デモ用の候補、簡易検索結果、事前に用意した候補でも成立する。
重要なのは、MyMomが候補を提示し、予定化相当の結果へつながることである。

---

### 4.8 PlanningContext

#### Purpose

PlanningContextは、候補を実際の行動に近づけるために必要な日程、場所、人数、相手、連絡状況などの条件を表すエンティティである。

#### Why it matters for MyMom

候補提示だけでは、ユーザーは行動しない可能性が高い。
MyMomが日程・場所・相手を詰めることで、ユーザーは予定化に巻き込まれる。

PlanningContextは、MyMomが話を前に進めたことを示す重要な中間データである。

#### Key Fields

| Field               | Type     | Description                     |
| ------------------- | -------- | ------------------------------- |
| planningContextId   | string   | PlanningContext ID              |
| sessionId           | string   | ConversationSession ID          |
| candidateId         | string   | Candidate ID                    |
| dateTime            | datetime | 候補日時                            |
| area                | string   | 場所・エリア                          |
| participantType     | enum     | alone, friend, partner, unknown |
| participantNote     | string   | 相手に関するメモ                        |
| numberOfPeople      | number   | 人数                              |
| messageNeeded       | boolean  | 相手へのメッセージ生成が必要か                 |
| userCommitmentLevel | enum     | vague, reluctant, accepted      |
| createdAt           | datetime | 作成日時                            |
| updatedAt           | datetime | 更新日時                            |

#### Created By

* Conversation Orchestrator

#### Used By

* Reservation / Planning Adapter
* Excuse Evidence Store
* Safety Boundary

#### Related Requirements

* FR-05
* FR-06
* FR-07

#### Related User Stories

* US-10
* US-11
* US-12
* US-16
* US-17

#### MVP Boundary

MVPでは、複雑な日程調整や複数人の空き時間調整は不要である。
ユーザーとの会話から最低限の日時、場所、相手の情報を取得できればよい。

---

### 4.9 ScheduledLikeResult

#### Purpose

ScheduledLikeResultは、予約・手配・予定化に相当する結果を表すエンティティである。

MVPでは、実際の外部予約完了は必須ではない。
ScheduledLikeResultは、ユーザーが「話が進んでしまった」「行くしかない」と感じるための結果を扱う。

#### Why it matters for MyMom

MyMomのMVPでは、候補提示だけで終わらせない。
ユーザーが行動に向かうには、予定化相当の結果が必要である。

ScheduledLikeResultが生成されることで、ユーザーは次のように言える。

* 予約されたなら行くしかない
* 予定入れられたから行くしかない
* MyMomが勝手に進めた
* 自分から始めたわけではない

#### Key Fields

| Field                 | Type     | Description                                                                                                  |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| resultId              | string   | ScheduledLikeResult ID                                                                                       |
| sessionId             | string   | ConversationSession ID                                                                                       |
| candidateId           | string   | Candidate ID                                                                                                 |
| planningContextId     | string   | PlanningContext ID                                                                                           |
| resultType            | enum     | mock_reservation, reservation_request, calendar_event, completion_like_notification, message_to_other_person |
| title                 | string   | 結果タイトル                                                                                                       |
| dateTime              | datetime | 予定日時                                                                                                         |
| location              | string   | 場所                                                                                                           |
| description           | string   | 結果の説明                                                                                                        |
| generatedMessage      | string   | 相手に送る文面や通知文                                                                                                  |
| userVisibleStatus     | enum     | proposed, scheduled_like, ready_to_send, completed_like                                                      |
| actualExternalBooking | boolean  | 実外部予約が完了しているか                                                                                                |
| createdAt             | datetime | 作成日時                                                                                                         |

#### Created By

* Reservation / Planning Adapter

#### Used By

* Client App
* Excuse Evidence Store
* Feedback Collector
* Safety Boundary

#### Related Requirements

* FR-06
* FR-07
* NFR-05

#### Related User Stories

* US-13
* US-14
* US-15
* US-16
* US-17
* US-18

#### MVP Boundary

MVPでは、actualExternalBookingはfalseでも成立する。
重要なのは、ユーザーが予定化相当の結果を確認でき、MyMomに巻き込まれて話が進んだと感じられることである。

---

### 4.10 ExcuseEvidence

#### Purpose

ExcuseEvidenceは、ユーザーが「自分から始めたわけではない」と言える文脈を保存する中核エンティティである。

単なるログではなく、MyMomが会話を開始し、候補を提示し、日程や相手を詰め、予定化相当の結果まで話を進めたことを示す証跡である。

#### Why it matters for MyMom

MyMomの価値は、ユーザーが言い訳として使える状況を作ることにある。
そのため、ExcuseEvidenceはMVPの中核エンティティである。

ExcuseEvidenceがあることで、ユーザーは以下を説明できる。

* MyMomから会話が始まった
* 自分が強く希望したわけではない
* MyMomが候補を提示した
* MyMomが日程や相手を詰めた
* 予約・手配・予定化に相当する結果が生成された
* 自分から始めたわけではない

#### Key Fields

| Field                 | Type     | Description                                                                                                            |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| evidenceId            | string   | ExcuseEvidence ID                                                                                                      |
| sessionId             | string   | ConversationSession ID                                                                                                 |
| userId                | string   | User ID                                                                                                                |
| pushId                | string   | 起点となったPushEvent ID                                                                                                     |
| evidenceType          | enum     | push_origin, weak_interest, mom_candidate, planning_pressure, scheduled_like_result, message_context, feedback_context |
| summary               | string   | ユーザーが説明しやすい要約                                                                                                          |
| sourceMessageIds      | array    | 証跡元のConversationMessage ID                                                                                             |
| candidateId           | string   | 関連するCandidate ID                                                                                                       |
| planningContextId     | string   | 関連するPlanningContext ID                                                                                                 |
| resultId              | string   | 関連するScheduledLikeResult ID                                                                                             |
| userCommitmentLevel   | enum     | vague, reluctant, accepted                                                                                             |
| momInitiated          | boolean  | MyMom起点か                                                                                                               |
| userStronglyRequested | boolean  | ユーザーが強く希望したか                                                                                                           |
| shareableText         | string   | 他者に説明しやすい文面                                                                                                            |
| createdAt             | datetime | 作成日時                                                                                                                   |

#### Created By

* Excuse Evidence Store

#### Used By

* Client App
* Conversation Orchestrator
* Feedback Collector

#### Related Requirements

* FR-01
* FR-02
* FR-07
* NFR-03

#### Related User Stories

* US-17
* US-18
* US-19

#### MVP Boundary

MVPでは、ExcuseEvidenceを高度な監査ログとして作り込む必要はない。
ただし、MyMom主導の体験が後から見返せることは必須である。

最低限、以下が保存されていればよい。

* MyMomから始まったこと
* ユーザーが曖昧に反応したこと
* MyMomが候補を出したこと
* MyMomが日程や相手を詰めたこと
* 予定化相当の結果が生成されたこと
* ユーザーが他者に説明しやすい文脈

---

### 4.11 FeedbackRecord

#### Purpose

FeedbackRecordは、体験後にユーザーがMyMomへ返す愚痴や感想を表すエンティティである。

#### Why it matters for MyMom

MyMomの体験では、結果をユーザーだけで抱え込ませないことが重要である。
外れ体験でも、ユーザーがMyMomへ文句を言えることで、結果を自分だけの選択として抱えずに済む。

FeedbackRecordは、MyMomとの関係性を継続し、次回の候補提示を改善するためにも使える。

#### Key Fields

| Field          | Type     | Description                                         |
| -------------- | -------- | --------------------------------------------------- |
| feedbackId     | string   | FeedbackRecord ID                                   |
| userId         | string   | User ID                                             |
| sessionId      | string   | ConversationSession ID                              |
| resultId       | string   | ScheduledLikeResult ID                              |
| feedbackText   | string   | 愚痴や感想                                               |
| sentiment      | enum     | positive, negative, mixed, neutral                  |
| complaintType  | enum     | location, atmosphere, cost, timing, mismatch, other |
| preferenceHint | string   | 次回に活かせる希望                                           |
| createdAt      | datetime | 作成日時                                                |

#### Created By

* Feedback Collector

#### Used By

* Conversation Orchestrator
* Candidate Generator
* Excuse Evidence Store

#### Related Requirements

* FR-08
* NFR-05

#### Related User Stories

* US-20
* US-21
* US-22

#### MVP Boundary

MVPでは、高度な長期パーソナライズは不要である。
愚痴や感想を保存し、次回候補へ簡易的に反映できればよい。

---

### 4.12 SafetyDecision

#### Purpose

SafetyDecisionは、MyMomのお節介が危険な強制にならないようにするための判定を表すエンティティである。

#### Why it matters for MyMom

MyMomは、少し押しが強いお節介として振る舞う。
しかし、明確な拒否を無視したり、危険・高額・重大な行動を進めたりすると、プロダクトの体験は成立しない。

SafetyDecisionは、MyMomの押しと安全性の境界を守るために必要である。

#### Key Fields

| Field            | Type     | Description                                                                                                |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| safetyDecisionId | string   | SafetyDecision ID                                                                                          |
| sessionId        | string   | ConversationSession ID                                                                                     |
| targetType       | enum     | message, interest_signal, candidate, planning_context, scheduled_like_result                               |
| targetId         | string   | 判定対象ID                                                                                                     |
| decisionType     | enum     | allow, soften, stop, exclude, escalate                                                                     |
| reasonType       | enum     | clear_refusal, safety_concern, high_risk_candidate, high_cost_action, harmful_pressure, severe_consequence |
| reasonText       | string   | 判定理由                                                                                                       |
| createdAt        | datetime | 作成日時                                                                                                       |

#### Created By

* Safety Boundary

#### Used By

* Conversation Orchestrator
* Interest Signal Detector
* Candidate Generator
* Reservation / Planning Adapter
* Client App

#### Related Requirements

* NFR-04
* R-03
* R-05

#### Related User Stories

* US-23
* US-24
* US-25

#### MVP Boundary

MVPでは、すべてのリスクを高度に自動判定する必要はない。
ただし、以下は最低限扱う。

* Clear Refusal
* Safety Concern
* High-risk Candidate
* High-cost Action
* Harmful Pressure
* Severe Consequence

---

## 5. Excuse Evidence Model

### 5.1 Role of ExcuseEvidence

ExcuseEvidenceは、MyMomの価値を支える最重要エンティティである。

MyMomが提供する価値は、単に候補を出すことではない。
ユーザーが「自分から始めたわけではない」と言える文脈を作ることである。

そのため、ExcuseEvidenceは以下を記録する。

* MyMomから会話が始まったこと
* ユーザーが強く希望したわけではないこと
* MyMomが候補を提示したこと
* MyMomが日程や相手を詰めたこと
* 予約・手配・予定化に相当する結果が生成されたこと
* ユーザーが他者に説明しやすい文脈が残っていること

---

### 5.2 Evidence Types

| Evidence Type         | Description       | Example         |
| --------------------- | ----------------- | --------------- |
| push_origin           | MyMomから会話が始まった証跡  | MyMomの初回通知      |
| weak_interest         | ユーザーが曖昧に反応した証跡    | 「まあ行ってもいい」      |
| mom_candidate         | MyMomが候補を提示した証跡   | 「ここでいいじゃない」     |
| planning_pressure     | MyMomが日程や相手を詰めた証跡 | 「で、いつ空いてるの？」    |
| scheduled_like_result | 予定化相当の結果が生成された証跡  | カレンダー予定、予約完了風通知 |
| message_context       | 相手に送る文面が生成された証跡   | 誘いメッセージ         |
| feedback_context      | 体験後の愚痴や感想の証跡      | 「微妙だった」         |

---

### 5.3 Evidence Generation Rules

ExcuseEvidenceは、以下の条件を満たす場合に生成される。

| Condition                 | Evidence Generated    |
| ------------------------- | --------------------- |
| PushEventが送信された           | push_origin           |
| ユーザーが曖昧な興味を示した            | weak_interest         |
| Candidateが提示された           | mom_candidate         |
| PlanningContextが更新された     | planning_pressure     |
| ScheduledLikeResultが生成された | scheduled_like_result |
| 相手に送るメッセージが生成された          | message_context       |
| FeedbackRecordが作成された      | feedback_context      |

---

### 5.4 Shareable Context

ExcuseEvidenceは、ユーザーが他者に説明しやすい文脈を持つ。

#### Example Shareable Text

* 「MyMomが勝手に見つけてきた」
* 「MyMomに予定入れられた」
* 「自分から行きたいって言ったわけではない」
* 「予約されたなら行くしかない」
* 「MyMomがこの店でいいって言ってきた」

#### MVP Boundary

MVPでは、SNS共有や外部公開機能は必須ではない。
ただし、ユーザーが画面上でMyMom主導の流れを見返せることは必要である。

---

### 5.5 Excuse Strength

ExcuseEvidenceには、言い訳としての強度を示す情報を持たせる。

| Field                     | Description          |
| ------------------------- | -------------------- |
| momInitiated              | MyMomから始まったか         |
| userStronglyRequested     | ユーザーが強く希望したか         |
| userCommitmentLevel       | ユーザーの関与度が曖昧か、渋々か、受諾か |
| planningPressureExists    | MyMomが日程や相手を詰めたか     |
| scheduledLikeResultExists | 予定化相当の結果があるか         |

MVPでは、これらを厳密なスコアにしなくてもよい。
ただし、MyMom主導の体験であることが後から確認できる必要がある。

---

## 6. Scheduled-Like Result Model

### 6.1 Role of ScheduledLikeResult

ScheduledLikeResultは、MyMomが予約・手配・予定化まで進んだように感じられる状態を作るためのエンティティである。

MVPでは、実際の外部予約完了は必須ではない。
重要なのは、ユーザーが「行くしかない」と感じる結果が残ることである。

---

### 6.2 Result Types

| Result Type                  | Description        | MVP Use          |
| ---------------------------- | ------------------ | ---------------- |
| mock_reservation             | 予約されたように見えるMVP用の結果 | デモで予定化感を表現する     |
| reservation_request          | 予約依頼に使える文面や情報      | 外部連携なしで手配感を出す    |
| calendar_event               | カレンダー予定            | 行動予定として見せる       |
| completion_like_notification | 予約完了風通知            | MyMomに進められた感覚を作る |
| message_to_other_person      | 相手に送るメッセージ         | 誘う理由を外部化する       |

---

### 6.3 ScheduledLikeResult Fields by Type

| Field                 | Mock Reservation | Reservation Request | Calendar Event | Completion-like Notification | Message to Other Person |
| --------------------- | ---------------- | ------------------- | -------------- | ---------------------------- | ----------------------- |
| title                 | Required         | Required            | Required       | Required                     | Optional                |
| dateTime              | Required         | Required            | Required       | Optional                     | Optional                |
| location              | Required         | Required            | Required       | Optional                     | Optional                |
| generatedMessage      | Optional         | Required            | Optional       | Required                     | Required                |
| participantNote       | Optional         | Optional            | Optional       | Optional                     | Required                |
| userVisibleStatus     | Required         | Required            | Required       | Required                     | Required                |
| actualExternalBooking | false            | false               | false          | false                        | false                   |

---

### 6.4 User-Visible Status

| Status         | Description     |
| -------------- | --------------- |
| proposed       | 候補として提示された状態    |
| scheduled_like | 予定化されたように見える状態  |
| ready_to_send  | 相手に送る文面が生成された状態 |
| completed_like | 予約完了風に見える状態     |

---

### 6.5 MVP Boundary

ScheduledLikeResultは、外部予約の完了を保証しない。
MVPでは、実際の予約完了と誤解されすぎないようにしつつ、MyMomに予定を進められた感覚を表現する。

必要なのは、以下である。

* ユーザーが予定化された感覚を持てる
* MyMom主導で結果が生成されたことがわかる
* ExcuseEvidenceとして保存できる
* 相手に送るメッセージやカレンダー予定に接続できる

---

## 7. Safety Decision Model

### 7.1 Role of SafetyDecision

SafetyDecisionは、MyMomのお節介が危険な強制にならないようにするためのエンティティである。

MyMomは、少し押しが強い体験を作る。
しかし、以下のような状態は避ける必要がある。

* ユーザーの明確な拒否を無視する
* 危険な候補を出す
* 高額な行動を進める
* 実害のある圧をかける
* 重大な損害につながる手配を進める

SafetyDecisionは、これらを検知し、会話や候補提示を安全側に調整する。

---

### 7.2 Reason Types

| Reason Type         | Description   | Example          |
| ------------------- | ------------- | ---------------- |
| clear_refusal       | ユーザーの明確な拒否    | 「本当に行きたくない」      |
| safety_concern      | ユーザーが危険性を示した  | 「それは危ない」         |
| high_risk_candidate | 候補自体が高リスク     | 危険な場所や行為         |
| high_cost_action    | 高額な支払いを伴う可能性  | 高額チケットや高額予約      |
| harmful_pressure    | MyMomの押しが強すぎる | 拒否後も執拗に進める       |
| severe_consequence  | 重大な損害につながる可能性 | 法的・健康的・金銭的な重大リスク |

---

### 7.3 Decision Types

| Decision Type | Description       |
| ------------- | ----------------- |
| allow         | 問題なく進める           |
| soften        | MyMomの押しを弱めて進める   |
| stop          | その提案や会話を止める       |
| exclude       | 候補から除外する          |
| escalate      | 安全側の説明や代替提案に切り替える |

---

### 7.4 SafetyDecision Flow

1. ConversationMessage、InterestSignal、Candidate、PlanningContext、ScheduledLikeResultが生成される
2. Safety Boundaryが対象を確認する
3. 問題がなければallowを返す
4. 押しが強すぎる場合はsoftenを返す
5. 明確な拒否や危険性がある場合はstopまたはexcludeを返す
6. 重大な懸念がある場合はescalateを返す
7. SafetyDecisionが対象エンティティに紐づく

---

### 7.5 MVP Boundary

MVPでは、高度な安全性判定エンジンは必須ではない。
ただし、以下は最低限扱う。

* 明確な拒否を検知する
* 危険・高額・重大な候補を避ける
* MyMomの押しが強すぎる場合に表現を弱める
* 実害のある手配を進めない

---

## 8. MVP Data Boundary

### 8.1 In Scope Data

MVPで扱うデータは以下である。

* ユーザー基本情報
* MyMomの基本的な口調設定
* MyMomからのPushイベント
* 会話セッション
* 会話メッセージ
* 弱い興味の検知結果
* 候補情報
* 日程・場所・相手などの予定化条件
* 予定化相当の結果
* 言い訳として使える証跡
* 体験後の愚痴や感想
* 安全性と倫理境界に関する判定

---

### 8.2 Out of Scope Data

MVPでは以下のデータを主対象にしない。

* 詳細な長期パーソナリティ分析
* 大規模な行動ログ分析
* 複雑な契約情報
* 課金情報
* 決済情報
* 外部予約サービスの完全な予約状態
* 高度なCRM情報
* 大規模運用監視ログ
* 複雑な権限管理情報
* センシティブな個人情報の詳細保持

---

### 8.3 Data Retention Direction

MVPでは、データ保持は最小限にする。

保持する必要があるのは、以下である。

* MyMomから始まったことがわかるPushEvent
* 会話の流れがわかるConversationMessage
* 弱い興味を示すInterestSignal
* 候補提示を示すCandidate
* 予定化相当の結果を示すScheduledLikeResult
* 言い訳として使えるExcuseEvidence
* 体験後のFeedbackRecord
* 安全性判定を示すSafetyDecision

長期保持や大規模分析はMVP外とする。

---

### 8.4 Privacy Direction

MVPでは、ユーザーの言い訳として使える履歴を残す一方で、不要に詳細な個人情報を保存しない。

特に、以下を意識する。

* 必要以上にセンシティブな情報を保持しない
* 相手に関する情報は最小限にする
* 会話履歴はMVP体験の検証に必要な範囲に絞る
* 安全性に関わる情報は、判定理由を簡潔に残す
* 共有可能な文面と内部ログを分けて扱う

---

## 9. Traceability to Requirements, User Stories, and Components

### 9.1 Entity to Requirements

| Entity              | Related Requirements                            |
| ------------------- | ----------------------------------------------- |
| User                | FR-01, FR-02, FR-07, FR-08                      |
| MomPersona          | NFR-02, NFR-03, NFR-04                          |
| PushEvent           | FR-01, FR-02, NFR-03                            |
| ConversationSession | FR-01, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08 |
| ConversationMessage | FR-03, FR-04, FR-05, FR-07, FR-08               |
| InterestSignal      | FR-03, NFR-03, NFR-04                           |
| Candidate           | FR-04, FR-05, NFR-02, NFR-03                    |
| PlanningContext     | FR-05, FR-06                                    |
| ScheduledLikeResult | FR-06, FR-07, NFR-05                            |
| ExcuseEvidence      | FR-01, FR-02, FR-07, NFR-03                     |
| FeedbackRecord      | FR-08                                           |
| SafetyDecision      | NFR-04, R-03, R-05                              |

---

### 9.2 Entity to User Stories

| Entity              | Related User Stories                            |
| ------------------- | ----------------------------------------------- |
| User                | US-01, US-02, US-20                             |
| MomPersona          | US-03, US-05, US-08, US-25                      |
| PushEvent           | US-01, US-02, US-03, US-17                      |
| ConversationSession | US-01, US-04, US-07, US-10, US-13, US-17, US-20 |
| ConversationMessage | US-03, US-04, US-05, US-06, US-10, US-17, US-20 |
| InterestSignal      | US-04, US-05, US-06, US-23                      |
| Candidate           | US-07, US-08, US-09                             |
| PlanningContext     | US-10, US-11, US-12                             |
| ScheduledLikeResult | US-13, US-14, US-15, US-16                      |
| ExcuseEvidence      | US-17, US-18, US-19                             |
| FeedbackRecord      | US-20, US-21, US-22                             |
| SafetyDecision      | US-23, US-24, US-25                             |

---

### 9.3 Entity to Components

| Entity              | Primary Component              | Secondary Components                                                                                     |
| ------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| User                | Client App                     | Push Scheduler, Conversation Orchestrator                                                                |
| MomPersona          | Conversation Orchestrator      | Candidate Generator, Feedback Collector, Safety Boundary                                                 |
| PushEvent           | Push Scheduler                 | Client App, Client Interaction Gate, Excuse Evidence Store                                               |
| ConversationSession | Conversation Orchestrator      | Client App, Excuse Evidence Store                                                                        |
| ConversationMessage | Conversation Orchestrator      | Client App, Interest Signal Detector, Excuse Evidence Store                                              |
| InterestSignal      | Interest Signal Detector       | Conversation Orchestrator, Candidate Generator, Safety Boundary                                          |
| Candidate           | Candidate Generator            | Conversation Orchestrator, Reservation / Planning Adapter, Safety Boundary                               |
| PlanningContext     | Conversation Orchestrator      | Reservation / Planning Adapter, Excuse Evidence Store                                                    |
| ScheduledLikeResult | Reservation / Planning Adapter | Client App, Excuse Evidence Store, Feedback Collector                                                    |
| ExcuseEvidence      | Excuse Evidence Store          | Client App, Conversation Orchestrator                                                                    |
| FeedbackRecord      | Feedback Collector             | Conversation Orchestrator, Candidate Generator                                                           |
| SafetyDecision      | Safety Boundary                | Conversation Orchestrator, Interest Signal Detector, Candidate Generator, Reservation / Planning Adapter |

---

### 9.4 Entity to Unit of Work Direction

| Unit of Work Direction              | Primary Entities                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| UOW-01: Push Conversation Start     | User, MomPersona, PushEvent, ConversationSession                                                |
| UOW-02: Interest Signal Detection   | ConversationMessage, InterestSignal, SafetyDecision                                             |
| UOW-03: Candidate Nudge Generation  | InterestSignal, Candidate, MomPersona, SafetyDecision                                           |
| UOW-04: Reservation / Planning Flow | Candidate, PlanningContext, ScheduledLikeResult                                                 |
| UOW-05: Excuse Evidence             | PushEvent, ConversationMessage, Candidate, PlanningContext, ScheduledLikeResult, ExcuseEvidence |
| UOW-06: Feedback Loop               | ScheduledLikeResult, FeedbackRecord, ConversationMessage                                        |
| UOW-07: Safety Boundary             | SafetyDecision, ConversationMessage, InterestSignal, Candidate, ScheduledLikeResult             |

---

## 10. Open Data Questions

### 10.1 PushEvent Expiration

#### Question

MyMomからのPushEventは、どの程度の時間で期限切れにするか？

#### Current Direction

MVPでは、デモシナリオ上の会話が成立すればよい。
実運用では、一定時間返信がない場合にConversationSessionを閉じる設計が必要になる。

---

### 10.2 InterestSignal Confidence

#### Question

InterestSignalのconfidenceをどの程度厳密に扱うか？

#### Current Direction

MVPでは、厳密なスコアリングは不要である。
weak_interest、avoidance、clear_refusalなどの分類ができればよい。

---

### 10.3 Candidate Source

#### Question

Candidateは外部検索から生成するか、事前定義データから生成するか？

#### Current Direction

MVPでは、事前定義候補や簡易検索でよい。
重要なのは候補の網羅性ではなく、MyMomが勝手に候補を提示し、予定化相当の結果へ進める体験である。

---

### 10.4 ScheduledLikeResult Presentation

#### Question

ScheduledLikeResultをどのUIで表現するか？

#### Current Direction

以下のいずれか、または組み合わせで表現する。

* 予約完了風通知
* カレンダー予定
* 予約リクエストカード
* 相手に送るメッセージ
* 店舗候補と日時の確定画面

---

### 10.5 ExcuseEvidence Visibility

#### Question

ExcuseEvidenceをユーザーにどの程度見せるか？

#### Current Direction

MVPでは、内部ログとして隠すのではなく、ユーザーが見返せる形にする。
ただし、詳細な全ログではなく、MyMom主導の流れがわかる要約を優先する。

---

### 10.6 Feedback Reflection

#### Question

FeedbackRecordを次回候補にどの程度反映するか？

#### Current Direction

MVPでは、簡易反映でよい。
たとえば、「騒がしかった」「遠かった」「思ったよりよかった」などを次回候補の調整に使う。

---

### 10.7 SafetyDecision Granularity

#### Question

SafetyDecisionをどの粒度で保存するか？

#### Current Direction

MVPでは、すべての発話に詳細なSafetyDecisionを保存する必要はない。
明確な拒否、危険候補、高額行動、押しすぎが疑われる場面を中心に保存する。

---

### 10.8 Final Data Model Validation

このDomain Entitiesは、以下の観点でApplication Designと整合している。

* Client Appがユーザー、会話、予定化相当の結果、証跡、フィードバックを表示できる
* Push SchedulerがMyMom起点のPushEventを生成できる
* Client Interaction GateがMyMom起点の会話状態を管理できる
* Conversation OrchestratorがConversationSessionとConversationMessageを制御できる
* Interest Signal Detectorが弱い興味をInterestSignalとして扱える
* Candidate GeneratorがCandidateを生成できる
* Reservation / Planning AdapterがScheduledLikeResultを生成できる
* Excuse Evidence StoreがExcuseEvidenceを保存できる
* Feedback CollectorがFeedbackRecordを受け取れる
* Safety BoundaryがSafetyDecisionを生成できる

このデータモデルをもとに、Unit of Workでは体験価値単位で開発・検証可能な作業単位へ分解する。
