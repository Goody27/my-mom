# Services — MyMom

## 1. Purpose

このドキュメントは、MyMomのInceptionフェーズにおけるApplication Design成果物である。

`components.md` で定義したコンポーネント群を横断するサービス層の定義と、オーケストレーションパターンを整理する。

---

## 2. Service Overview

| Service | Responsibility | Main Components |
|---|---|---|
| ConversationService | MyMomとの会話フロー全体を制御する中心サービス | Conversation Orchestrator, Interest Signal Detector, Candidate Generator, Reservation / Planning Adapter |
| PushService | MyMomから会話を開始するPushを管理する | Push Scheduler, Client Interaction Gate |
| EvidenceService | 言い訳として使える証跡の生成・保存・提供を管理する | Excuse Evidence Store, Conversation Orchestrator |
| FeedbackService | 体験後のフィードバック収集と次回への反映を管理する | Feedback Collector, Candidate Generator, Conversation Orchestrator |
| SafetyService | 各コンポーネントへの横断的な安全性チェックを提供する | Safety Boundary |

---

## 3. Service Details

### 3.1 ConversationService

#### Responsibility

MyMomとユーザーの会話フロー全体を制御する中心サービス。

PushEventを起点にセッションを開始し、弱い興味の検知→候補提示→日程詰め→予定化相当の結果生成まで一貫して主導する。

#### Orchestration Flow

```
PushEvent
  → startConversation()
      ConversationSession (state: Initiated)
  → probe()
      Conversation Orchestrator が近況・興味を聞き出す
      → Interest Signal Detector へ発話を渡す
  → onInterestDetected()
      Candidate Generator へ候補生成を依頼する
      ConversationSession (state: CandidatePresented)
  → onCandidateReaction()
      Conversation Orchestrator が日程・場所・相手を詰める
      ConversationSession (state: Planning)
  → onPlanningComplete()
      Reservation / Planning Adapter へ予定化を依頼する
      ConversationSession (state: ScheduledLikeResultCreated)
  → storeEvidence()
      Excuse Evidence Store へ履歴を保存する
      ConversationSession (state: EvidenceStored)
  → requestFeedback()
      ConversationSession (state: FeedbackRequested)
  → close()
      ConversationSession (state: Closed)
```

#### Key Methods

```typescript
startConversation(event: PushEvent): Promise<ConversationSession>
probe(sessionId: string): Promise<void>
handleUserReply(sessionId: string, text: string): Promise<ConversationSession>
presentCandidates(sessionId: string, signal: InterestSignal): Promise<void>
conductPlanning(sessionId: string): Promise<void>
finalizeResult(sessionId: string, context: PlanningContext): Promise<ScheduledLikeResult>
closeConversation(sessionId: string): Promise<void>
```

#### Related Requirements

FR-01, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08

---

### 3.2 PushService

#### Responsibility

MyMomからユーザーへのPushを管理する。
Pushがユーザー側ではなくMyMom側から始まることを保証する。

#### Orchestration Flow

```
発火条件の評価
  → Push Scheduler が条件を評価する
  → PushEvent を生成する
  → Client App へ通知する
  → Client Interaction Gate が返信可能状態を開ける
  → ConversationService.startConversation() へ渡す
```

#### Key Methods

```typescript
fire(userId: string): Promise<PushEvent>
fireDemoMode(userId: string, message: string): Promise<PushEvent>
scheduleFollowUp(pushId: string): void
ensureGateOpen(userId: string): void
```

#### Related Requirements

FR-01, FR-02, NFR-03

---

### 3.3 EvidenceService

#### Responsibility

MyMom主導で進んだことを証跡として生成・保存・提供する。
ユーザーが「MyMomが勝手に進めた」と説明できる文脈を維持する。

#### Orchestration Flow

```
ConversationSession の各フェーズ完了時
  → Push発生 → Push Evidence を保存する
  → 会話進行 → Conversation Evidence を保存する
  → 候補提示 → Candidate Evidence を保存する
  → 予定化完了 → Scheduled-like Evidence を保存する
  → メッセージ生成 → Message Evidence を保存する

ユーザーが証跡を確認するとき
  → EvidenceService.getSummary() を呼ぶ
  → ExcuseEvidence をClient Appへ返す
```

#### Key Methods

```typescript
recordPush(event: PushEvent): Promise<void>
recordConversation(session: ConversationSession): Promise<void>
recordCandidates(sessionId: string, candidates: Candidate[]): Promise<void>
recordResult(result: ScheduledLikeResult): Promise<void>
recordMessage(sessionId: string, message: string): Promise<void>
getSummary(userId: string, sessionId: string): Promise<ExcuseEvidence>
```

#### Related Requirements

FR-07, NFR-03

---

### 3.4 FeedbackService

#### Responsibility

体験後のフィードバックを収集し、次回の候補・会話に反映する。
外れ体験であっても、ユーザーがMyMomとの関係性として結果を返せるようにする。

#### Orchestration Flow

```
体験後（ConversationSession state: FeedbackRequested）
  → Feedback Collector がユーザーの愚痴・感想を受け取る
  → FeedbackRecord を保存する
  → PreferenceHints を抽出する
  → Candidate Generator へ次回調整材料として渡す
  → Conversation Orchestrator へ次回会話材料として渡す
```

#### Key Methods

```typescript
collect(userId: string, sessionId: string, text: string): Promise<FeedbackRecord>
extractHints(feedback: FeedbackRecord): PreferenceHint[]
applyHintsToNextSession(userId: string, hints: PreferenceHint[]): Promise<void>
```

#### Related Requirements

FR-08, NFR-05

---

### 3.5 SafetyService

#### Responsibility

各コンポーネントに横断的に適用される安全性チェックを提供する。
MyMomのお節介が危険な強制にならないよう保証する。

#### Orchestration Pattern

SafetyServiceは単独のフローを持たない。各コンポーネントがチェックを呼び出す横断的サービスとして機能する。

```
Conversation Orchestrator → SafetyService.checkUtterance()
Interest Signal Detector  → SafetyService.checkSignal()
Candidate Generator       → SafetyService.filterCandidates()
Reservation / Planning    → SafetyService.checkResult()
```

#### Key Methods

```typescript
checkUtterance(utterance: string, context: SafetyContext): Promise<SafetyDecision>
checkSignal(signal: InterestSignal): SafetyDecision
filterCandidates(candidates: Candidate[]): Candidate[]
checkResult(result: ScheduledLikeResult): SafetyDecision
isBlockingDecision(decision: SafetyDecision): boolean
```

#### Related Requirements

NFR-04, R-03, R-05

---

## 4. Service Interaction Overview

```
[PushService]
  PushEvent を発火
      ↓
[ConversationService]
  会話フロー全体を制御
      ├── Interest Signal Detector を呼ぶ
      ├── Candidate Generator を呼ぶ
      ├── Reservation / Planning Adapter を呼ぶ
      ├── [SafetyService] を各フェーズで呼ぶ（横断）
      └── [EvidenceService] を各フェーズで呼ぶ（横断）
      ↓
[FeedbackService]
  体験後の愚痴・感想を収集
  次回ConversationServiceへヒントを渡す
```

---

## 5. Traceability

### Requirements to Service

| Requirement | Service |
|---|---|
| FR-01: MyMom起点のPush会話開始 | PushService |
| FR-02: ユーザー起点の自由会話制限 | PushService |
| FR-03: 弱い興味の検知 | ConversationService |
| FR-04: お節介な候補提示 | ConversationService |
| FR-05: 日程・場所・相手の聞き出し | ConversationService |
| FR-06: 予約・手配・予定化の実行 | ConversationService |
| FR-07: 言い訳として使える履歴の生成 | EvidenceService |
| FR-08: 愚痴・フィードバックの受け取り | FeedbackService |
| NFR-04: Safety and Ethical Boundary | SafetyService |
