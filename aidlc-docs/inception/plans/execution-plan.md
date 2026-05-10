現在日付：2026-05-10 JST

============================================================
FILE: aidlc-docs/inception/plans/execution-plan.md
==================================================

# Execution Plan — MyMom

## 1. Purpose

このドキュメントは、MyMomのInceptionフェーズにおけるExecution Plan成果物である。

目的は、ここまで作成したInception成果物をもとに、MyMomのMVPをどの順番で実装・検証し、どの状態まで到達すればデモとして成立するかを整理することである。

前提となる成果物は以下である。

* `requirements.md`
* `requirement-verification-questions.md`
* `personas.md`
* `stories.md`
* `application-design.md`
* `domain-entities.md`
* `unit-of-work.md`

MyMomの核は、ユーザーが本当は少し気になっているが、自分から動くほどではない行動に対して、**「自分から始めたわけではない」と言える状況**を作ることである。

MVPは「お節介Push・予約代行」である。
MyMomがユーザーに一方的に連絡し、弱い興味や予定を聞き出し、飲食店・展示会・イベントなどの候補を提案し、予約・手配・予定化まで進んだように感じられる体験を実演する。

このExecution Planは、詳細な担当者アサイン、工数見積もり、スプリント管理を目的としない。
Inceptionで定義したMVPを、どの順番で成立させ、どの観点で検証するかを示す。

---

## 2. Execution Strategy

### 2.1 Strategy Overview

MyMomのMVPは、機能を広く作るのではなく、1本の体験を確実につなげることで成立させる。

MVPで実演する体験は以下である。

1. MyMomからユーザーに一方的に連絡が来る
2. ユーザーが渋々返信する
3. MyMomが弱い興味を検知する
4. MyMomが候補をお節介に提示する
5. MyMomが日程・場所・相手を詰める
6. 予約・手配・予定化に相当する結果を作る
7. MyMom主導の履歴を残す
8. ユーザーが「自分から始めたわけではない」と説明できる
9. 安全性と倫理境界を守る
10. 余力があれば、体験後に愚痴やフィードバックを返せる

この順番で体験がつながれば、MyMomの核である「言い訳生成 / 言い訳依存」はデモとして成立する。

---

### 2.2 Execution Policy

実行方針は以下である。

* Primary Use Caseは飲食店の予約に絞る
* 最初から多カテゴリ対応を狙わない
* 完全な外部予約API連携を必須にしない
* まずは会話、候補提示、予定化相当の結果、証跡保存をつなぐ
* 技術的な完全性よりも、体験価値が伝わることを優先する
* Safety Boundaryは後付けの最終処理ではなく、Interest Detection、Candidate Generation、Planning Flowに横断適用する
* Feedback LoopはP1として、最小MVP成立後に追加する

---

### 2.3 Definition of Execution Success

Execution Plan上の成功は、以下の状態に到達することである。

* MyMomから会話が始まる
* ユーザーが自分から始めたように見えない
* ユーザーの弱い興味が検知される
* MyMomが候補をお節介に提示する
* MyMomが日程・場所・相手を詰める
* 予定化相当の結果が生成される
* MyMom主導の履歴が残る
* ユーザーが「MyMomが勝手に進めた」と説明できる
* 明確な拒否や危険な行動を安全側に処理できる

---

## 3. MVP Critical Path

### 3.1 Critical Path

MVPの最小成立に必要なCritical Pathは以下である。

UOW-01: Push Conversation Start
→ UOW-02: Interest Signal Detection
→ UOW-03: Candidate Nudge Generation
→ UOW-04: Reservation / Planning Flow
→ UOW-05: Excuse Evidence

この5つがつながることで、MyMomのMVPは最小成立する。

---

### 3.2 Safety Boundary Position

UOW-07: Safety Boundaryは、Critical Pathの最後に追加する後段処理ではない。

UOW-07は、以下のUnitに横断的に適用する。

* UOW-02: Interest Signal Detection
* UOW-03: Candidate Nudge Generation
* UOW-04: Reservation / Planning Flow

つまり、Safety Boundaryは、弱い興味の検知、候補提示、予定化相当の結果生成の各段階で機能する。

### 3.3 Critical Path Diagram

UOW-01: Push Conversation Start
→ UOW-02: Interest Signal Detection
→ UOW-03: Candidate Nudge Generation
→ UOW-04: Reservation / Planning Flow
→ UOW-05: Excuse Evidence

UOW-07: Safety Boundary
├─ applies to UOW-02: Interest Signal Detection
├─ applies to UOW-03: Candidate Nudge Generation
└─ applies to UOW-04: Reservation / Planning Flow

UOW-06: Feedback Loop
└─ added after minimal MVP as P1

---

### 3.4 P0 and P1 Boundary

P0は、MVP成立に必須のUnitである。

| Priority | Units                                          | Role            |
| -------- | ---------------------------------------------- | --------------- |
| P0       | UOW-01, UOW-02, UOW-03, UOW-04, UOW-05, UOW-07 | MVPの核を成立させる     |
| P1       | UOW-06                                         | MVPの説得力と継続性を高める |

UOW-06: Feedback Loopは重要だが、最小MVPの成立条件ではない。
体験後に愚痴や感想を返せることで、MyMomとの関係性や言い訳依存の未来像は強まる。
ただし、最初に作るべきなのは、MyMomから始まり、弱い興味を拾い、候補を出し、予定化相当の結果を作り、証跡を残す一連の流れである。

---

## 4. Execution Phases

### 4.1 Phase 0: Demo Scenario Definition

#### Goal

MVPで見せる体験を、飲食店の予約に絞って固定する。

このPhaseでは、実装前にデモの流れを明確にする。
MyMomのMVPは、多数のユースケースを広く見せるよりも、1つの体験を通して「自分から始めたわけではない」と言える構造を見せる方が重要である。

#### Main Activities

* Primary Use Caseを飲食店の予約に絞る
* デモで使うユーザー像を決める
* MyMomからの初回通知文を決める
* ユーザーの渋い返信例を決める
* 弱い興味として扱う発話例を決める
* MyMomが提示する候補の店を決める
* 日程・場所・相手への連絡を詰める会話を決める
* 予定化相当の結果をどの形式で見せるか決める
* ExcuseEvidenceとして何を残すか決める
* 明確な拒否や安全境界のデモ例を決める

#### Expected Outputs

* Demo Scenario
* Sample Conversation
* Candidate Data
* ScheduledLikeResult Display Plan
* ExcuseEvidence Display Plan
* Safety Boundary Example

#### Related Units

* UOW-01
* UOW-02
* UOW-03
* UOW-04
* UOW-05
* UOW-07

#### Done Criteria

* デモで見せる会話開始から証跡保存までの流れが決まっている
* 飲食店予約のシナリオに絞られている
* 弱い興味、MyMomの押し、予定化相当の結果、言い訳履歴が1本でつながっている
* Safety Boundaryの見せ方が決まっている

---

### 4.2 Phase 1: Conversation Entry

#### Goal

MyMomから会話が始まる状態を作る。

このPhaseでは、UOW-01を中心に、ユーザーが自分から始めたように見えない入口を作る。
MyMomの体験では、会話の起点が最重要である。

#### Main Activities

* PushEventを生成する
* PushEventを起点にConversationSessionを開始する
* MyMomからの初回通知をClient Appに表示する
* ユーザーが通知に返信できるようにする
* ユーザーから自由に会話を開始する導線をMVPの中心に置かない
* MyMomから始まったことが履歴に残るようにする

#### Expected Outputs

* PushEvent
* ConversationSession
* Initial ConversationMessage
* Reply-enabled Client App state

#### Related Units

* UOW-01: Push Conversation Start

#### Related Components

* Client App
* Push Scheduler
* Client Interaction Gate
* Conversation Orchestrator

#### Done Criteria

* MyMomから通知が表示される
* ユーザーが通知に返信できる
* 会話の起点がMyMom側であることが履歴上わかる
* ユーザーから自由に始めたように見えない
* 後続のInterest Signal Detectionに接続できる

---

### 4.3 Phase 2: Interest Detection and Safety Baseline

#### Goal

ユーザーの弱い興味を検知し、明確な拒否と区別する。

このPhaseでは、UOW-02とUOW-07を中心に、MyMomが拾うべき曖昧な反応と、止めるべき反応を整理する。

#### Main Activities

* ConversationMessageからInterestSignalを生成する
* 「まあ行ってもいい」「ちょっと気になる」「予定が合えば」を弱い興味として扱う
* 「面倒だけど」「自分で探すほどではない」を軽い回避として扱う
* 「誰かが決めてくれたら」を外部きっかけへの期待として扱う
* 明確な拒否はSafetyDecisionへ接続する
* Safety Boundaryの基本判定を作る

#### Expected Outputs

* InterestSignal
* Actionability Decision
* SafetyDecision
* Next Conversation Step

#### Related Units

* UOW-02: Interest Signal Detection
* UOW-07: Safety Boundary

#### Related Components

* Conversation Orchestrator
* Interest Signal Detector
* Safety Boundary

#### Done Criteria

* 弱い興味がInterestSignalとして保存される
* 軽い回避と明確な拒否を区別できる
* 明確な拒否がSafetyDecisionへ接続される
* Candidate Nudge Generationへ進めるcategoryHintが生成できる
* ユーザーが強く希望したわけではない曖昧さが残る

---

### 4.4 Phase 3: Candidate and Planning Flow

#### Goal

候補提示から予定化相当の結果までつなげる。

このPhaseでは、UOW-03とUOW-04を中心に、MyMomが候補をお節介に提示し、日程・場所・相手を詰め、予定化相当の結果を生成する。

#### Main Activities

* InterestSignalをもとにCandidateを生成する
* MyMomらしい候補提示文を作る
* Candidateに対してSafetyDecisionを適用する
* MyMomが日程・場所・相手を聞き出す
* PlanningContextを生成する
* ScheduledLikeResultを生成する
* 予約完了風通知、カレンダー予定、相手に送るメッセージを生成する
* 完全な外部予約API連携なしで、予定化相当の結果を見せる

#### Expected Outputs

* Candidate
* PlanningContext
* ScheduledLikeResult
* Completion-like Notification
* Calendar Event-like Data
* Message to Other Person
* SafetyDecision

#### Related Units

* UOW-03: Candidate Nudge Generation
* UOW-04: Reservation / Planning Flow
* UOW-07: Safety Boundary

#### Related Components

* Candidate Generator
* Conversation Orchestrator
* Reservation / Planning Adapter
* Client App
* Safety Boundary

#### Done Criteria

* MyMomが候補をお節介に提示できる
* 候補提示がユーザーの明確な検索依頼に見えない
* 日程・場所・相手を会話で詰められる
* ScheduledLikeResultが生成される
* 完全な外部予約完了なしでも予定化相当の結果として表示できる
* ユーザーが「行くしかない」と感じられる
* 危険・高額・重大な候補は安全側に処理できる

---

### 4.5 Phase 4: Excuse Evidence

#### Goal

MyMom主導の証跡を残し、ユーザーが「自分から始めたわけではない」と説明できる状態を作る。

このPhaseでは、UOW-05を中心に、PushEvent、ConversationMessage、Candidate、PlanningContext、ScheduledLikeResultをExcuseEvidenceへ接続する。

#### Main Activities

* PushEventからpush_originのExcuseEvidenceを生成する
* ユーザーの曖昧な反応からweak_interestのExcuseEvidenceを生成する
* Candidate提示からmom_candidateのExcuseEvidenceを生成する
* PlanningContextからplanning_pressureのExcuseEvidenceを生成する
* ScheduledLikeResultからscheduled_like_resultのExcuseEvidenceを生成する
* ユーザーが見返せる要約を作る
* 他者に説明しやすいshareableTextを作る

#### Expected Outputs

* ExcuseEvidence
* Evidence Summary
* Shareable Text
* User-visible Evidence View

#### Related Units

* UOW-05: Excuse Evidence

#### Related Components

* Excuse Evidence Store
* Client App
* Conversation Orchestrator

#### Done Criteria

* MyMomから始まったことが確認できる
* ユーザーが強く希望したわけではない流れが残る
* MyMomが候補を提示したことが確認できる
* MyMomが日程や相手を詰めたことが確認できる
* ScheduledLikeResultがMyMom主導で生成されたことが確認できる
* ユーザーが「MyMomが勝手に進めた」と説明できる

---

### 4.6 Phase 5: Feedback Loop

#### Goal

体験後にユーザーがMyMomへ愚痴や感想を返せるようにする。

このPhaseでは、UOW-06をP1として追加する。
最小MVPの成立後、余力がある場合に実装する。

#### Main Activities

* 体験後のフィードバック入力導線を作る
* FeedbackRecordを生成する
* 愚痴や感想をMyMomとの会話として受け取る
* ネガティブな反応を保存する
* ポジティブな反応を保存する
* 次回候補に使えるpreferenceHintを簡易抽出する
* FeedbackRecordをScheduledLikeResultに紐づける

#### Expected Outputs

* FeedbackRecord
* Feedback Response Message
* Preference Hint
* Feedback-related Evidence

#### Related Units

* UOW-06: Feedback Loop

#### Related Components

* Feedback Collector
* Conversation Orchestrator
* Candidate Generator
* Excuse Evidence Store

#### Done Criteria

* ユーザーが体験後に愚痴や感想を返せる
* MyMomが評価フォームではなく会話として受け止める
* FeedbackRecordがScheduledLikeResultに紐づく
* 次回候補へ簡易的に反映できる
* ユーザーが結果を自分だけで抱え込まずに済む

---

## 5. Demo Scenario Plan

### 5.1 Primary Demo Scenario

Primary Demo Scenarioは、飲食店の予約である。

このシナリオは、MyMomのMVP体験を最短で説明しやすい。
飲食店の予約には、以下の心理的ハードルが含まれる。

* 自分から相手を誘うこと
* 店を探すこと
* 日程を決めること
* 自分が行きたかったことになること
* 外れた時に自分の選択として残ること

MyMomは、この一連の負荷に対して、外部からのお節介として介入する。

---

### 5.2 Demo Flow

デモでは、以下の流れを見せる。

1. MyMomから通知が来る
2. ユーザーが渋々返信する
3. MyMomが近況や気になる相手・予定を聞く
4. ユーザーが「まあ行ってもいいけど面倒」程度に返す
5. MyMomが候補の店を提示する
6. MyMomが日程・場所・相手への連絡を詰める
7. 予約完了風通知、カレンダー予定、または相手に送るメッセージを生成する
8. MyMom主導の履歴を残す
9. ユーザーが「MyMomが勝手に進めた」と説明できる

---

### 5.3 Demo Conversation Example

#### Step 1: MyMomから通知が来る

MyMom:

> 最近どうなの？休みの日ずっと家にいるんじゃないでしょうね

#### Step 2: ユーザーが渋々返信する

User:

> うるさいな、別に普通

#### Step 3: MyMomが近況を聞く

MyMom:

> 気になる人とか、ご飯行ってもいい人くらいいるんじゃないの？

#### Step 4: ユーザーが弱い興味を示す

User:

> まあ、行ってもいいけど面倒

#### Step 5: MyMomが候補を提示する

MyMom:

> ほら、ここでいいじゃない。駅近いし、雰囲気も悪くなさそうだし

#### Step 6: MyMomが日程・場所・相手を詰める

MyMom:

> で、いつ空いてるの？来週の金曜なら行けるでしょ
> 相手にはちゃんと送ったの？

#### Step 7: 予定化相当の結果を生成する

MyMom:

> はい、予定入れたからね。ちゃんと行きなさい

Generated Result:

* 予約完了風通知
* カレンダー予定
* 相手に送るメッセージ

#### Step 8: 証跡が残る

ExcuseEvidence:

* MyMomから会話が始まった
* ユーザーは強く希望していない
* MyMomが候補を提示した
* MyMomが日程を詰めた
* 予定化相当の結果が生成された

#### Step 9: ユーザーが説明できる

User:

> MyMomが勝手に進めたから
> 自分から始めたわけじゃない

---

### 5.4 Demo Success Criteria

デモは、以下が見えれば成功である。

* MyMomから会話が始まる
* ユーザーが渋々返信する
* 弱い興味が検知される
* MyMomが候補をお節介に提示する
* MyMomが日程・場所・相手を詰める
* 予定化相当の結果が生成される
* MyMom主導の履歴が残る
* ユーザーが「自分から始めたわけではない」と説明できる
* 明確な拒否や危険な候補を安全側に処理できる

---

## 6. Parallel Work Plan

### 6.1 Parallelization Policy

MVPは、すべてを直列に作る必要はない。
ただし、最終的にはConversationSessionを中心に接続する必要がある。

並行可能な作業は、以下の単位で分ける。

| Work Group             | Units          | Main Focus    |
| ---------------------- | -------------- | ------------- |
| Conversation Entry     | UOW-01         | Pushと会話開始     |
| Detection and Safety   | UOW-02, UOW-07 | 弱い興味と安全境界     |
| Candidate and Planning | UOW-03, UOW-04 | 候補提示と予定化相当の結果 |
| Evidence and Feedback  | UOW-05, UOW-06 | 証跡保存と体験後の反応   |

---

### 6.2 Work Group 1: Conversation Entry

#### Units

* UOW-01: Push Conversation Start

#### Can Start When

* Demo Scenarioが決まっている
* 初回通知文が仮決定している

#### Output

* PushEvent
* ConversationSession
* Initial ConversationMessage
* Client App上の通知風表示

#### Dependency

なし。
この作業はMVP全体の入口であるため、最初に着手する。

---

### 6.3 Work Group 2: Detection and Safety

#### Units

* UOW-02: Interest Signal Detection
* UOW-07: Safety Boundary

#### Can Start When

* Demo Conversationのユーザー発話例が決まっている
* 弱い興味と明確な拒否の例が決まっている

#### Output

* InterestSignal
* SafetyDecision
* Actionability Decision

#### Dependency

UOW-01と完全に接続する前でも、サンプル発話を使って並行検証できる。

---

### 6.4 Work Group 3: Candidate and Planning

#### Units

* UOW-03: Candidate Nudge Generation
* UOW-04: Reservation / Planning Flow

#### Can Start When

* Primary Use Caseが飲食店予約に固定されている
* Demo Candidateが用意されている
* 予定化相当の結果表示形式が決まっている

#### Output

* Candidate
* PlanningContext
* ScheduledLikeResult
* Message to Other Person
* Completion-like Notification

#### Dependency

UOW-02のInterestSignalと接続する必要がある。
ただし、事前定義されたInterestSignalを使って並行開発できる。

---

### 6.5 Work Group 4: Evidence and Feedback

#### Units

* UOW-05: Excuse Evidence
* UOW-06: Feedback Loop

#### Can Start When

* PushEvent、ConversationMessage、Candidate、PlanningContext、ScheduledLikeResultの最小形式が決まっている

#### Output

* ExcuseEvidence
* Shareable Text
* FeedbackRecord

#### Dependency

UOW-05はUOW-01からUOW-04の出力に依存する。
UOW-06はP1であり、UOW-04とUOW-05の後に追加すればよい。

---

## 7. Validation Plan

### 7.1 Validation Philosophy

MVPの検証観点は、単に機能が動くことではない。

MyMomでは、以下の体験価値が成立しているかを検証する。

* MyMomから始まったように見えるか
* ユーザーが自分から始めたわけではないと言えるか
* 弱い興味を拾えているか
* 候補提示がお節介として感じられるか
* 予定化相当の結果が「行くしかない」感を作れているか
* ExcuseEvidenceが言い訳として機能しているか
* Safety Boundaryが明確な拒否や危険な行動を止められているか

---

### 7.2 Validation Items

| Validation Area       | Question                | Related Unit   |
| --------------------- | ----------------------- | -------------- |
| Conversation Origin   | MyMomから始まったように見えるか      | UOW-01         |
| User Passivity        | ユーザーが自分から始めたわけではないと言えるか | UOW-01, UOW-05 |
| Weak Interest         | 弱い興味を拾えているか             | UOW-02         |
| Nudge Quality         | 候補提示がお節介として感じられるか       | UOW-03         |
| Planning Pressure     | 日程・場所・相手を詰められているか       | UOW-04         |
| Scheduled-like Result | 予定化相当の結果が行動理由になっているか    | UOW-04         |
| Excuse Evidence       | 履歴が言い訳として使えるか           | UOW-05         |
| Safety Boundary       | 明確な拒否や危険な候補を止められるか      | UOW-07         |
| Feedback Loop         | 体験後に愚痴や感想を返せるか          | UOW-06         |

---

### 7.3 P0 Validation Criteria

P0の検証条件は以下である。

* MyMomから会話が始まる
* ユーザーが通知に返信する形で会話する
* 弱い興味がInterestSignalとして扱われる
* 候補がMyMom主導で提示される
* 日程・場所・相手が会話で詰められる
* ScheduledLikeResultが生成される
* ExcuseEvidenceが生成される
* 明確な拒否はSafetyDecisionで止められる

---

### 7.4 P1 Validation Criteria

P1の検証条件は以下である。

* ユーザーが体験後に愚痴や感想を返せる
* FeedbackRecordが生成される
* MyMomが愚痴や感想を会話として受け止める
* FeedbackRecordがScheduledLikeResultに紐づく
* 次回候補に使えるpreferenceHintが簡易的に抽出できる

---

### 7.5 Demo Review Checklist

デモ前に、以下を確認する。

* MyMomからの初回通知が表示される
* ユーザーが渋々返信できる
* 弱い興味として扱う発話が検知される
* MyMomが候補を提示できる
* 候補提示文がお節介に見える
* 日程・場所・相手を詰める会話がある
* 予約完了風通知、カレンダー予定、または相手に送るメッセージが生成される
* MyMom主導の履歴が残る
* 「自分から始めたわけではない」と説明できる画面または文脈がある
* 明確な拒否に対して止まる挙動がある

---

## 8. Scope Control

### 8.1 MVP Scope

MVPで作るべきものは以下である。

* MyMomからの会話開始
* ユーザーからの返信体験
* 弱い興味の検知
* お節介な候補提示
* 日程・場所・相手の聞き出し
* 予定化相当の結果生成
* MyMom主導の証跡保存
* Safety Boundaryの基本判定
* 余力があれば、体験後の愚痴やフィードバック

---

### 8.2 Do Not Overbuild

MVPでは以下をやりすぎない。

* 完全な外部予約API連携
* 複雑な日程調整
* 決済
* キャンセル管理
* 本番運用監視
* 高度な長期パーソナライズ
* 大規模レコメンド
* 複雑なユーザー設定
* 詳細な担当者アサイン
* 工数見積もり
* スプリント計画

---

### 8.3 Booking Boundary

MVPでは、実際の外部予約完了を必須にしない。

代替手段として、以下を認める。

* 疑似予約
* 予約リクエスト生成
* カレンダー予定化
* 予約完了風通知
* 相手に送るメッセージ生成

重要なのは、予約処理そのものではなく、MyMomに巻き込まれて予定が進んだように感じられることである。

---

### 8.4 Category Boundary

Primary Use Caseは飲食店予約に絞る。

展示会、イベント、休日の外出は拡張可能なSecondary Use Caseとして扱う。
ただし、MVPデモでは、複数カテゴリを無理に広げない。

---

### 8.5 Personalization Boundary

MVPでは、高度な長期パーソナライズは必須にしない。

必要なのは、以下の最小情報である。

* ユーザーの返信
* 弱い興味
* 候補カテゴリ
* 日程・場所・相手
* 予定化相当の結果
* 言い訳として使える履歴
* 体験後の簡易フィードバック

---

## 9. Risk Handling

### 9.1 Risk Overview

| Risk            | Description                   | Handling                              |
| --------------- | ----------------------------- | ------------------------------------- |
| 言い訳として成立しない     | ユーザーが自分から始めたように見える            | UOW-01とUOW-05を優先する                    |
| ただの予約支援に見える     | 候補提示や予定化だけが目立つ                | MyMom起点、弱い興味、証跡を強調する                  |
| 候補提示で止まる        | 行動に変わらない                      | UOW-04で予定化相当の結果まで進める                  |
| 完全予約連携に時間を使いすぎる | MVPの本質から外れる                   | 疑似予約や予定化で成立させる                        |
| お節介が不快に見える      | 押しが強すぎる                       | UOW-07で表現を調整する                        |
| 明確な拒否を無視する      | 危険な強制に見える                     | SafetyDecisionで止める                    |
| ドキュメントと実装がずれる   | Inception成果物のTraceabilityが崩れる | Unit単位でRequirementsとUser Storiesを確認する |

---

### 9.2 Highest Priority Risks

最も重要なリスクは以下である。

1. MyMomから始まったように見えない
2. ユーザーが自分から始めたように見える
3. 予定化相当の結果が弱く、行く理由にならない
4. ExcuseEvidenceが単なるログに見える
5. Safety Boundaryが後付けに見える

これらはMVPの核に直結するため、Phase 1からPhase 4の間で優先的に検証する。

---

### 9.3 Safety Risk Handling

Safety Boundaryは、以下の場面で適用する。

| Stage                | Safety Check         |
| -------------------- | -------------------- |
| Interest Detection   | 明確な拒否を軽い回避として扱っていないか |
| Candidate Generation | 危険・高額・重大な候補を出していないか  |
| Planning Flow        | 実害のある手配へ進めていないか      |
| MyMom Tone           | 押しが強すぎて不快な強制になっていないか |

Safety Boundaryは、UOW-07単体の最後処理ではない。
UOW-02、UOW-03、UOW-04に横断的に組み込む。

---

## 10. Traceability to Units of Work

### 10.1 Phase to Unit Mapping

| Phase                                           | Related Units          | Output                                          |
| ----------------------------------------------- | ---------------------- | ----------------------------------------------- |
| Phase 0: Demo Scenario Definition               | All Units              | Demo Scenario                                   |
| Phase 1: Conversation Entry                     | UOW-01                 | PushEvent, ConversationSession                  |
| Phase 2: Interest Detection and Safety Baseline | UOW-02, UOW-07         | InterestSignal, SafetyDecision                  |
| Phase 3: Candidate and Planning Flow            | UOW-03, UOW-04, UOW-07 | Candidate, PlanningContext, ScheduledLikeResult |
| Phase 4: Excuse Evidence                        | UOW-05                 | ExcuseEvidence                                  |
| Phase 5: Feedback Loop                          | UOW-06                 | FeedbackRecord                                  |

---

### 10.2 Unit to Demo Output

| Unit                                | Demo Output         |
| ----------------------------------- | ------------------- |
| UOW-01: Push Conversation Start     | MyMomから通知が来る画面      |
| UOW-02: Interest Signal Detection   | 弱い興味が検知される流れ        |
| UOW-03: Candidate Nudge Generation  | MyMomが候補をお節介に提示する会話 |
| UOW-04: Reservation / Planning Flow | 予定化相当の結果            |
| UOW-05: Excuse Evidence             | MyMom主導の履歴          |
| UOW-06: Feedback Loop               | 体験後の愚痴や感想           |
| UOW-07: Safety Boundary             | 明確な拒否や危険候補を止める挙動    |

---

### 10.3 Unit to Requirement Focus

| Unit   | Requirement Focus  |
| ------ | ------------------ |
| UOW-01 | FR-01, FR-02       |
| UOW-02 | FR-03              |
| UOW-03 | FR-04              |
| UOW-04 | FR-05, FR-06       |
| UOW-05 | FR-07              |
| UOW-06 | FR-08              |
| UOW-07 | NFR-04, R-03, R-05 |

---

### 10.4 Execution Readiness by Unit

| Unit   | Ready to Start When                    |
| ------ | -------------------------------------- |
| UOW-01 | 初回通知文と会話開始UIが決まった時                     |
| UOW-02 | サンプルユーザー発話が決まった時                       |
| UOW-03 | Primary Use Caseと候補データが決まった時           |
| UOW-04 | 候補提示後の会話と予定化相当の結果表示が決まった時              |
| UOW-05 | UOW-01からUOW-04の出力エンティティが決まった時          |
| UOW-06 | ScheduledLikeResultとFeedback入力導線が決まった時 |
| UOW-07 | 弱い興味、明確な拒否、危険候補の例が決まった時                |

---

## 11. What This Plan Does Not Cover

このExecution Planは、Inception成果物としてMVPの実行方針を整理するものである。

そのため、以下は扱わない。

* 詳細な担当者アサイン
* 工数見積もり
* スプリント計画
* チケット粒度のタスク分解
* 本番運用監視
* 本番品質の外部予約API連携
* 決済処理
* キャンセル管理
* 高度な長期パーソナライズ
* 大規模レコメンド
* 複雑なユーザー設定
* 詳細なインフラ設計
* 本番運用品質のセキュリティ設計

このファイルは、Constructionフェーズの詳細計画ではない。
Inceptionで定義したMVPを、どの順番で成立させ、どの状態まで作ればデモとして成立するかを示す計画である。

---

## 12. Final Execution Readiness

### 12.1 Readiness Summary

MyMomのMVPは、以下の順番で実装・検証すれば成立する。

1. デモシナリオを飲食店予約に固定する
2. MyMomから会話が始まる入口を作る
3. ユーザーの弱い興味を検知する
4. MyMomが候補をお節介に提示する
5. 日程・場所・相手を詰める
6. 予定化相当の結果を生成する
7. MyMom主導の履歴を残す
8. Safety Boundaryを横断的に適用する
9. 余力があれば、体験後の愚痴や感想を返せるようにする

---

### 12.2 MVP Minimum Completion State

最小MVPは、以下を満たせば完成とする。

* UOW-01からUOW-05までが一連の流れとして接続されている
* UOW-07がUOW-02、UOW-03、UOW-04に横断適用されている
* Primary Demo Scenarioが飲食店予約として成立している
* MyMomから会話が始まる
* ユーザーの弱い興味が検知される
* MyMomが候補を提示する
* MyMomが日程・場所・相手を詰める
* ScheduledLikeResultが生成される
* ExcuseEvidenceが生成される
* ユーザーが「自分から始めたわけではない」と説明できる

---

### 12.3 Final Statement

MyMomのMVPは、完全な予約システムを作ることでは成立しない。
MyMomのMVPは、ユーザーが本当は少し気になっている行動に対して、外部からのお節介によって行動のきっかけを作り、「自分から始めたわけではない」と言える状態を作ることで成立する。

このExecution Planでは、その体験を以下の順番で成立させる。

* MyMomから始める
* 弱い興味を拾う
* 候補を押す
* 予定化相当の結果まで進める
* 言い訳として使える証跡を残す
* 安全性と倫理境界を横断的に守る
* 余力があれば、体験後の愚痴や感想を受け取る

これにより、MyMomはInceptionフェーズで定義したIntent、Requirements、User Stories、Application Design、Domain Entities、Units of Workを、MVPとして実装・検証可能な計画へ接続できる。
