# Component Methods — MyMom

## 1. Purpose

このドキュメントは、MyMomのInceptionフェーズにおけるApplication Design成果物である。

`components.md` で定義した10コンポーネントのメソッドシグネチャを定義する。

詳細なビジネスルールはCONSTRUCTION フェーズのFunctional Designで定義する。ここでは入出力の型と高レベルの目的を記述する。

---

## 2. Client App

```typescript
// ユーザーへMyMomからの通知を表示する
displayPushNotification(event: PushEvent): void

// 会話履歴を表示する
renderConversationHistory(sessionId: string): ConversationMessage[]

// ユーザーの返信を送信する
submitUserReply(sessionId: string, text: string): void

// 候補カードを表示する
renderCandidateCards(candidates: Candidate[]): void

// 予定化相当の結果を表示する
renderScheduledLikeResult(result: ScheduledLikeResult): void

// 相手に送るメッセージを表示する
renderMessageToOtherPerson(message: string): void

// 愚痴・フィードバックを送信する
submitFeedback(sessionId: string, text: string): void
```

---

## 3. Push Scheduler

```typescript
// Push発火条件を評価してPushEventを生成する
evaluateAndFirePush(userId: string): Promise<PushEvent | null>

// デモ用の即時Push発火
fireDemoPush(userId: string, message: string): Promise<PushEvent>

// 未返信時の再通知を管理する
scheduleFollowUp(pushId: string, delayMinutes: number): void

// Push通知をConversation Orchestratorへ渡す
handoffToOrchestrator(event: PushEvent): Promise<ConversationSession>
```

---

## 4. Client Interaction Gate

```typescript
// 返信可能な会話状態かどうかを判定する
isReplyAllowed(userId: string): boolean

// アクティブな会話セッションを取得する
getActiveSession(userId: string): ConversationSession | null

// ユーザーの任意新規会話開始をブロックする
blockFreeConversationStart(userId: string): GateResult

// 会話終了後の入力ロック状態を設定する
lockAfterSessionClose(sessionId: string): void
```

---

## 5. Conversation Orchestrator

```typescript
// MyMomから会話セッションを開始する
startSession(pushEvent: PushEvent): Promise<ConversationSession>

// 会話状態を次のステップへ遷移させる
transitionState(sessionId: string, trigger: StateTrigger): Promise<ConversationSession>

// MyMomの発話を生成する
generateMomResponse(session: ConversationSession, context: ConversationContext): Promise<string>

// ユーザーの返信を受け取り処理する
handleUserReply(sessionId: string, text: string): Promise<void>

// Interest Signal Detectorへ発話を送る
forwardToInterestDetector(sessionId: string, utterance: string): Promise<InterestSignal | null>

// Candidate Generatorへ候補生成を依頼する
requestCandidates(sessionId: string, signal: InterestSignal): Promise<Candidate[]>

// Reservation / Planning Adapterへ予定化を依頼する
requestPlanning(sessionId: string, context: PlanningContext): Promise<ScheduledLikeResult>

// Safety Boundaryのチェックを実行する
runSafetyCheck(sessionId: string, content: SafetyTarget): Promise<SafetyDecision>

// 会話を終了してフィードバックフェーズへ移行する
closeSession(sessionId: string): Promise<void>
```

---

## 6. Interest Signal Detector

```typescript
// ユーザー発話から興味シグナルを検知する
detect(utterance: string, context: ConversationContext): Promise<InterestSignal | null>

// 明確な拒否かどうかを判定する
isClearRefusal(utterance: string): boolean

// 軽い回避（面倒くさい等）かどうかを判定する
isSoftAvoidance(utterance: string): boolean

// 行動化できそうなカテゴリを推定する
inferCategory(signal: InterestSignal): CandidateCategory
```

---

## 7. Candidate Generator

```typescript
// 関心カテゴリをもとに候補を生成する
generate(signal: InterestSignal, userContext: UserContext): Promise<Candidate[]>

// 候補をMyMomらしい言い方でラップする
wrapWithMomTone(candidates: Candidate[], persona: MomPersona): Candidate[]

// フィードバック履歴を反映して候補を調整する
adjustByFeedback(candidates: Candidate[], feedbacks: FeedbackRecord[]): Candidate[]

// 候補の安全性チェックを Safety Boundary へ依頼する
requestSafetyCheck(candidates: Candidate[]): Promise<Candidate[]>
```

---

## 8. Reservation / Planning Adapter

```typescript
// PlanningContextをもとに予定化相当の結果を生成する
createScheduledLikeResult(context: PlanningContext): Promise<ScheduledLikeResult>

// 疑似予約を生成する
generateMockReservation(context: PlanningContext): ScheduledLikeResult

// 予約リクエスト文面を生成する
generateReservationRequest(context: PlanningContext): string

// カレンダー予定を生成する
generateCalendarEvent(context: PlanningContext): CalendarEvent

// 予約完了風通知を生成する
generateCompletionLikeNotification(result: ScheduledLikeResult): string

// 相手に送るメッセージを生成する
generateMessageToOtherPerson(context: PlanningContext): string

// 結果をExcuse Evidence Storeへ保存する
persistToEvidenceStore(result: ScheduledLikeResult, sessionId: string): Promise<void>
```

---

## 9. Excuse Evidence Store

```typescript
// MyMomから会話が始まったPushEventを保存する
savePushEvidence(event: PushEvent): Promise<void>

// 会話セッション全体を保存する
saveConversationEvidence(session: ConversationSession): Promise<void>

// 候補提示の履歴を保存する
saveCandidateEvidence(sessionId: string, candidates: Candidate[]): Promise<void>

// 予定化相当の結果を保存する
saveScheduledLikeEvidence(result: ScheduledLikeResult): Promise<void>

// 相手に送るメッセージを保存する
saveMessageEvidence(sessionId: string, message: string): Promise<void>

// ユーザーが見返せる形で証跡を取得する
getEvidenceSummary(userId: string, sessionId: string): Promise<ExcuseEvidence>
```

---

## 10. Feedback Collector

```typescript
// 体験後のフィードバックを受け取る
collect(userId: string, sessionId: string, text: string): Promise<FeedbackRecord>

// フィードバックのセンチメントを分類する
classifySentiment(text: string): FeedbackSentiment

// 次回候補に活用できる簡易情報を抽出する
extractPreferenceHints(feedback: FeedbackRecord): PreferenceHint[]

// Conversation Orchestratorへ次回の会話材料を渡す
handoffToOrchestrator(hints: PreferenceHint[], userId: string): Promise<void>
```

---

## 11. Safety Boundary

```typescript
// 任意のコンテンツに対して安全性を判定する
evaluate(target: SafetyTarget, context: SafetyContext): Promise<SafetyDecision>

// 明確な拒否を検知する
detectClearRefusal(utterance: string): boolean

// 危険・違法・高額な候補を除外する
filterUnsafeCandidates(candidates: Candidate[]): Candidate[]

// MyMomの発話が強制的すぎないかチェックする
checkPressureLevel(text: string, persona: MomPersona): SafetyDecision

// 予定化相当の結果が実害につながらないかチェックする
checkScheduledLikeResult(result: ScheduledLikeResult): SafetyDecision
```

---

## 12. Shared Types

```typescript
type ConversationState =
  | 'Initiated'
  | 'Probing'
  | 'InterestDetected'
  | 'CandidatePresented'
  | 'Planning'
  | 'ScheduledLikeResultCreated'
  | 'EvidenceStored'
  | 'FeedbackRequested'
  | 'Closed'

type CandidateCategory =
  | 'Restaurant'
  | 'Exhibition'
  | 'Event'
  | 'CasualOuting'
  | 'MessagePrompt'

type FeedbackSentiment = 'Positive' | 'Negative' | 'Preference' | 'SocialResult' | 'Complaint'

type ScheduledLikeResultType =
  | 'MockReservation'
  | 'ReservationRequest'
  | 'CalendarEvent'
  | 'CompletionLikeNotification'
  | 'MessageToOtherPerson'

type SafetyDecisionType = 'Allow' | 'Warn' | 'Block'

type InterestSignalType =
  | 'WeakInterest'
  | 'ConditionalInterest'
  | 'Avoidance'
  | 'ExcuseSeeking'
  | 'ClearRefusal'
```
