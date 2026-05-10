現在日付：2026-05-10 JST

============================================================
FILE: aidlc-docs/inception/application-design/unit-of-work.md
=============================================================

# Unit of Work — MyMom

## 1. Purpose

このドキュメントは、MyMomのInceptionフェーズにおけるUnits of Work成果物である。

目的は、ここまで作成したInception成果物を、実装・検証可能な作業単位へ分解することである。

前提となる成果物は以下である。

* `requirements.md`
* `requirement-verification-questions.md`
* `personas.md`
* `stories.md`
* `application-design.md`
* `domain-entities.md`

MyMomの核は、ユーザーが本当は少し気になっているが、自分から動くほどではない行動に対して、**「自分から始めたわけではない」と言える状況**を作ることである。

MVPは「お節介Push・予約代行」である。
MyMomがユーザーに一方的に連絡し、弱い興味や予定を聞き出し、飲食店・展示会・イベントなどの候補を提案し、予約・手配・予定化まで進んだように感じられる体験を実演する。

このファイルでは、MyMomの構想を追加で広げるのではなく、以下を示す。

* どの体験価値をUnitとして分解するか
* 各UnitがどのRequirement、User Story、Component、Entityに対応するか
* 各Unitで何を作るか
* 各Unitで何を検証するか
* MVPとしてどこまで作れば成立するか
* 開発メンバーがどこから実装・検証に入れるか

Unit of Workは、単なる技術タスクではない。
MyMomの体験価値を成立させるための、実装・検証可能な単位である。

---

## 2. Unit of Work Overview

### 2.1 Unit List

| Unit ID | Unit Name                   | Priority | Summary                  |
| ------- | --------------------------- | -------- | ------------------------ |
| UOW-01  | Push Conversation Start     | P0       | MyMomから会話が始まる体験を作る       |
| UOW-02  | Interest Signal Detection   | P0       | ユーザーの曖昧な反応から弱い興味を検知する    |
| UOW-03  | Candidate Nudge Generation  | P0       | MyMomが候補を勝手に見つけ、お節介に提示する |
| UOW-04  | Reservation / Planning Flow | P0       | 日程・場所・相手を詰め、予定化相当の結果を作る  |
| UOW-05  | Excuse Evidence             | P0       | ユーザーが言い訳として使える履歴を残す      |
| UOW-06  | Feedback Loop               | P1       | 体験後に愚痴や感想をMyMomへ返せるようにする |
| UOW-07  | Safety Boundary             | P0       | お節介が危険な強制にならないようにする      |

---

### 2.2 Unit Design Policy

Unit of Workは、以下の方針で分解する。

* 技術機能だけでなく、体験価値単位で分解する
* RequirementsからUser Stories、Components、Entitiesまで追えるようにする
* MVPとして実装・検証可能な粒度にする
* 完全な外部予約API連携を前提にしない
* 疑似予約、予約リクエスト生成、カレンダー予定化、予約完了風通知、相手に送るメッセージ生成でMVP成立とする
* 高度な長期パーソナライズ、大規模分析、複雑な契約・課金・監視はMVP外とする
* ユーザーが「自分から始めたわけではない」と言える状態を最優先にする

---

### 2.3 Unit Scope Summary

| Unit   | Experience Value | Primary Output                       |
| ------ | ---------------- | ------------------------------------ |
| UOW-01 | 自分から始めたわけではない    | PushEvent, ConversationSession       |
| UOW-02 | 強い意思ではなく弱い興味を拾う  | InterestSignal                       |
| UOW-03 | 自分で探したわけではない     | Candidate                            |
| UOW-04 | 話が進んでしまった感覚を作る   | PlanningContext, ScheduledLikeResult |
| UOW-05 | MyMomを言い訳にできる    | ExcuseEvidence                       |
| UOW-06 | 結果を自分だけで抱え込まない   | FeedbackRecord                       |
| UOW-07 | お節介と安全性の境界を守る    | SafetyDecision                       |

---

## 3. Unit Prioritization

### 3.1 P0: MVP成立に必須

P0は、MVPの核となる体験を成立させるために必須のUnitである。

| Unit ID | Unit Name                   | Reason                              |
| ------- | --------------------------- | ----------------------------------- |
| UOW-01  | Push Conversation Start     | MyMomから始まらないと、「自分から始めたわけではない」が成立しない |
| UOW-02  | Interest Signal Detection   | 弱い興味を拾えないと、MyMomが行動の入口を作れない         |
| UOW-03  | Candidate Nudge Generation  | 候補をMyMomが勝手に出さないと、お節介体験にならない        |
| UOW-04  | Reservation / Planning Flow | 候補提示だけでは行動に変わらず、予定化相当の結果が必要         |
| UOW-05  | Excuse Evidence             | MyMom主導の履歴が残らないと、言い訳として成立しない        |
| UOW-07  | Safety Boundary             | お節介が危険な強制に見えると、MVP全体が成立しない          |

---

### 3.2 P1: MVPの説得力を上げる

P1は、MVPの最小成立後に体験の説得力を上げるUnitである。

| Unit ID | Unit Name     | Reason                              |
| ------- | ------------- | ----------------------------------- |
| UOW-06  | Feedback Loop | MyMomとの関係性を強めるが、最小デモではP0より後でも成立するため |

Feedback Loopは、MyMomの言い訳依存の未来像を補強する。
ただし、最小デモでは、MyMomから会話が始まり、弱い興味を拾い、候補提示と予定化相当の結果を作り、証跡を残すところまででMVPの核は表現できる。

そのため、UOW-06はP1とする。

---

### 3.3 Recommended Implementation Order

推奨する実装・検証順序は以下である。

1. UOW-01: Push Conversation Start
2. UOW-02: Interest Signal Detection
3. UOW-03: Candidate Nudge Generation
4. UOW-04: Reservation / Planning Flow
5. UOW-05: Excuse Evidence
6. UOW-07: Safety Boundary
7. UOW-06: Feedback Loop

ただし、UOW-07は最後にまとめて追加するだけではなく、UOW-02、UOW-03、UOW-04と並行して最低限の判定を組み込む必要がある。

---

## 4. Units of Work

### 4.1 UOW-01: Push Conversation Start

#### Unit ID

UOW-01

#### Unit Name

Push Conversation Start

#### Purpose

MyMomから会話が始まる体験を成立させる。

このUnitの目的は、ユーザーが自分から会話を始めなくても、MyMomから一方的に連絡され、会話に巻き込まれる状態を作ることである。

#### Experience Value

ユーザーが「自分から始めたわけではない」と言える。

MyMomの体験では、会話の起点が重要である。
ユーザーから会話を始めると、自分から依頼した構造になってしまう。
MyMomから連絡が来ることで、ユーザーは受動的に巻き込まれた状態を作れる。

#### What to Build

* MyMomからユーザーへ初回通知を送る仕組み
* PushEventの生成
* PushEventを起点にしたConversationSessionの開始
* ユーザーがMyMomからの連絡に返信できるClient App画面
* ユーザーから自由に新規会話を開始する導線の制限
* MyMomらしいお節介な初回通知文
* MyMomから始まったことがわかる会話履歴

#### What to Validate

* 会話の起点がMyMom側にあるか
* ユーザーが自分から会話を始めなくても体験が開始されるか
* 初回通知が機械的なリマインドではなく、お節介として感じられるか
* ユーザーがMyMomからの連絡に返信する形で会話できるか
* 自由相談ではなく、MyMom起点の会話として見えるか
* 後続のInterest Signal Detectionへ自然につながるか

#### Primary Requirements

* FR-01: MyMom起点のPush会話開始
* FR-02: ユーザー起点の自由会話制限
* NFR-01: Simplicity
* NFR-03: Excuse Strength

#### Related User Stories

* US-01: MyMomから会話が始まる
* US-02: ユーザーから自由に会話を始められない
* US-03: MyMomの連絡に渋々返信する

#### Related Components

* Client App
* Push Scheduler
* Client Interaction Gate
* Conversation Orchestrator

#### Related Entities

* User
* MomPersona
* PushEvent
* ConversationSession
* ConversationMessage

#### Inputs

* User
* MomPersona
* Push trigger condition
* Initial MyMom message template

#### Outputs

* PushEvent
* ConversationSession
* Initial ConversationMessage
* Reply-enabled client state

#### Acceptance Criteria

* MyMomから初回通知が表示される
* 通知を起点にConversationSessionが開始される
* ユーザーが自分から新規会話を開始していないことが履歴上わかる
* ユーザーはMyMomからの通知に返信できる
* 初回通知文が母親的なお節介として感じられる
* ユーザーから自由に新規会話を始める導線がMVPの中心に置かれていない
* PushEventがExcuseEvidenceの材料として利用できる

#### MVP Boundary

MVPでは、Pushタイミングの高度な最適化は不要である。
デモ開始時、一定時間経過、休日想定などの単純な条件でよい。

実Push通知が難しい場合は、Client App上の通知風表示でも成立する。
重要なのは、ユーザーが自分から始めたように見えないことである。

#### Implementation Notes

* まずは手動トリガーまたは固定タイミングでPushEventを作成する
* PushEventとConversationSessionを必ず紐づける
* 初回通知文はMomPersonaに基づいて生成する
* 自由入力欄を常時開放するのではなく、PushEventに紐づく返信として扱う
* PushEventはUOW-05のExcuseEvidence生成に利用する

---

### 4.2 UOW-02: Interest Signal Detection

#### Unit ID

UOW-02

#### Unit Name

Interest Signal Detection

#### Purpose

ユーザーの曖昧な反応から、弱い興味を検知する。

このUnitの目的は、ユーザーが明確に「行きたい」と言わなくても、MyMomが関心の兆候を拾い、候補提示へ進める状態を作ることである。

#### Experience Value

ユーザーが強い意思を表明しなくても、MyMomに興味を拾われる。

MyMomが扱うのは、明確な目的ではなく、強い意思になる前の弱い興味である。
「まあ行ってもいい」「ちょっと気になる」「面倒だけど」などの曖昧な反応を拾うことで、ユーザーは自分が強く望んだわけではない余地を残したまま行動へ進める。

#### What to Build

* ユーザーのConversationMessageを解析する仕組み
* 弱い興味をInterestSignalとして保存する仕組み
* 軽い回避と明確な拒否を区別する仕組み
* InterestSignalから候補提示へ進める判定
* SafetyDecisionへ接続する判定
* Conversation Orchestratorへ次アクションを返す仕組み

#### What to Validate

* 「行きたい」と明言していなくても弱い興味を検知できるか
* 「まあ行ってもいい」「ちょっと気になる」「予定が合えば」などを扱えるか
* 「面倒くさい」を単純な拒否として扱いすぎていないか
* 明確な拒否はSafetyDecisionへ接続できるか
* 検知結果がCandidate Nudge Generationへつながるか
* ユーザーが強く希望したわけではない曖昧さを残せているか

#### Primary Requirements

* FR-03: 弱い興味・未実行の関心の検知
* NFR-03: Excuse Strength
* NFR-04: Safety and Ethical Boundary

#### Related User Stories

* US-04: 曖昧な興味をMyMomに拾われる
* US-05: 面倒くささをMyMomに見抜かれる
* US-06: 自分の興味を強く認めずに会話を続ける
* US-23: 明確な拒否は尊重される

#### Related Components

* Conversation Orchestrator
* Interest Signal Detector
* Safety Boundary

#### Related Entities

* ConversationMessage
* InterestSignal
* SafetyDecision
* ConversationSession

#### Inputs

* User reply
* ConversationMessage
* ConversationSession state
* MomPersona
* Safety rules

#### Outputs

* InterestSignal
* Actionability decision
* SafetyDecision when needed
* Next conversation step

#### Acceptance Criteria

* ユーザーの曖昧な返信からInterestSignalが生成される
* InterestSignalにsignalTypeが付与される
* weak_interest、conditional_interest、avoidance、excuse_seekingを扱える
* clear_refusalはSafetyDecisionへ接続される
* InterestSignalからCandidate Generatorへ渡すcategoryHintを生成できる
* Conversation Orchestratorが次の会話に進める
* ユーザーが「強く希望したわけではない」と言える余地が残る

#### MVP Boundary

MVPでは、高度な感情分析や厳密な心理推定は不要である。
以下を大まかに分類できればよい。

* 弱い興味
* 条件付き興味
* 軽い回避
* 外部きっかけへの期待
* 明確な拒否

#### Implementation Notes

* まずはルールベースまたはLLM判定で分類する
* InterestSignalにはsourceMessageIdを必ず持たせる
* confidenceは厳密でなくてよいが、候補提示へ進める判断材料として使う
* 明確な拒否に近い場合はSafety Boundaryを優先する
* UOW-03への入力としてcategoryHintを生成する

---

### 4.3 UOW-03: Candidate Nudge Generation

#### Unit ID

UOW-03

#### Unit Name

Candidate Nudge Generation

#### Purpose

MyMomが候補を勝手に見つけてきて、お節介に提示する。

このUnitの目的は、ユーザーからの明確な検索依頼を前提にせず、MyMomが飲食店・展示会・イベントなどの候補を提示し、ユーザーが「自分で探したわけではない」と言える状態を作ることである。

#### Experience Value

ユーザーが自分で候補を探したり選んだりしなくて済む。

MyMomが候補を見つけて押すことで、ユーザーは候補選びを自分の意思やセンスとして引き受けすぎずに済む。
候補提示は単なる検索結果ではなく、言い訳として使える文脈を作る必要がある。

#### What to Build

* InterestSignalをもとに候補カテゴリを決める仕組み
* 飲食店、展示会、イベントなどのCandidate生成
* MyMomらしい候補提示文
* 候補を少し押すNudge表現
* CandidateとMomPersonaの紐づけ
* Candidateに対するSafetyDecisionの確認
* CandidateをConversation Orchestratorへ返す仕組み

#### What to Validate

* ユーザーが明確に検索依頼していなくても候補が提示されるか
* MyMomが勝手に見つけてきたように見えるか
* 候補提示が事務的な検索結果ではなく、お節介として感じられるか
* 候補の最適性だけでなく、言い訳として使える文脈があるか
* 安全上問題のある候補を避けられるか
* UOW-04のPlanning Flowへ自然につながるか

#### Primary Requirements

* FR-04: お節介な候補提示
* NFR-02: Mother-like Tone
* NFR-03: Excuse Strength
* NFR-04: Safety and Ethical Boundary

#### Related User Stories

* US-07: MyMomが勝手に候補を見つけてくる
* US-08: 候補を押しつけられるが、完全には嫌ではない
* US-09: 自分のセンスとして選ばなくて済む

#### Related Components

* Candidate Generator
* Conversation Orchestrator
* Safety Boundary

#### Related Entities

* InterestSignal
* Candidate
* MomPersona
* SafetyDecision
* ConversationMessage

#### Inputs

* InterestSignal
* User preferredArea
* MomPersona
* Candidate source
* Safety rules

#### Outputs

* Candidate
* Candidate presentation message
* Mom push phrase
* SafetyDecision when needed

#### Acceptance Criteria

* InterestSignalをもとにCandidateが生成される
* Candidateにはcategory、title、location、suggestedReasonが含まれる
* MyMomらしい押し文句が生成される
* 候補提示がユーザーの明確な検索依頼を前提にしていない
* CandidateがSafety Boundaryで確認される
* ユーザーが「MyMomが勝手に見つけてきた」と言える
* 候補提示後に日程・場所・相手を詰める会話へ進める

#### MVP Boundary

MVPでは、候補検索の網羅性や精度を作り込みすぎない。
事前定義候補、簡易検索、デモ用候補でも成立する。

重要なのは、MyMomが候補を提示し、ユーザーを予定化相当の結果へ巻き込めることである。

#### Implementation Notes

* 最初は飲食店をPrimary Use Caseにする
* CandidateにはMyMomがなぜ押すのかを表すsuggestedReasonを持たせる
* momPushPhraseを生成し、候補提示をお節介に見せる
* CandidateはUOW-04のPlanningContext生成に接続する
* Candidate提示メッセージはUOW-05のExcuseEvidenceに利用する

---

### 4.4 UOW-04: Reservation / Planning Flow

#### Unit ID

UOW-04

#### Unit Name

Reservation / Planning Flow

#### Purpose

候補提示から日程・場所・相手を詰め、予約・手配・予定化に相当する結果を作る。

このUnitの目的は、候補提示だけで終わらせず、MyMomが会話の中で必要情報を聞き出し、ユーザーが「話が進んでしまった」「行くしかない」と感じる状態を作ることである。

#### Experience Value

ユーザーが自分で予定を作ったのではなく、MyMomに予定化相当のところまで進められたと感じる。

候補提示だけでは、ユーザーは行動しない可能性が高い。
日程、場所、相手への連絡、予定化相当の結果まで進むことで、ユーザーは行動する理由を得る。

#### What to Build

* Candidateをもとに日程・場所・相手を聞き出す会話
* PlanningContextの生成
* 予約・手配・予定化に相当する結果の生成
* 疑似予約の生成
* 予約リクエストの生成
* カレンダー予定の生成
* 予約完了風通知の生成
* 相手に送るメッセージの生成
* ScheduledLikeResultの保存
* SafetyDecisionによる確認

#### What to Validate

* 候補提示だけで終わらず、日程・場所・相手まで話が進むか
* ユーザーが曖昧に答えても予定化相当の結果へ進めるか
* 完全な外部予約API連携なしでもMVP体験が成立するか
* ユーザーが「予約されたなら行くしかない」と感じられるか
* 相手に送るメッセージによって誘う理由を外部化できるか
* ScheduledLikeResultがExcuseEvidenceへ接続できるか

#### Primary Requirements

* FR-05: 日程・場所・相手の聞き出し
* FR-06: 予約・手配・予定化の実行
* NFR-05: MVP Feasibility

#### Related User Stories

* US-10: MyMomに日程を詰められる
* US-11: MyMomに場所や条件を聞き出される
* US-12: 相手に連絡する流れまで詰められる
* US-13: 予約完了風の通知を受け取る
* US-14: カレンダー予定として登録される
* US-15: 相手に送るメッセージを作られる
* US-16: 予約リクエスト相当の情報がまとまる

#### Related Components

* Conversation Orchestrator
* Reservation / Planning Adapter
* Client App
* Safety Boundary

#### Related Entities

* Candidate
* PlanningContext
* ScheduledLikeResult
* ConversationMessage
* SafetyDecision

#### Inputs

* Candidate
* User replies
* ConversationSession
* Planning constraints
* MomPersona
* Safety rules

#### Outputs

* PlanningContext
* ScheduledLikeResult
* Calendar event-like data
* Completion-like notification
* Message to other person
* Reservation request-like data

#### Acceptance Criteria

* MyMomが日程・場所・相手に関する質問を行う
* PlanningContextが生成される
* ScheduledLikeResultが生成される
* ScheduledLikeResultは少なくとも1種類のresultTypeを持つ
* 完全な外部予約完了がなくても、予定化相当の結果として表示できる
* ユーザーが「話が進んでしまった」と感じられる
* ScheduledLikeResultがExcuseEvidenceの材料になる
* 安全上問題のある結果はSafetyDecisionにより止められる

#### MVP Boundary

MVPでは、実際の外部予約完了は必須ではない。
以下のいずれか、または組み合わせで成立する。

* 疑似予約
* 予約リクエスト生成
* カレンダー予定化
* 予約完了風通知
* 相手に送るメッセージ生成

複数人の高度な日程調整、空席確認、決済、キャンセル管理はMVP外とする。

#### Implementation Notes

* Primary Use Caseは飲食店の予約にする
* ScheduledLikeResultのactualExternalBookingはfalseでもよい
* userVisibleStatusで、ユーザーに見える状態を管理する
* 予約完了風通知は、実予約と誤解されすぎない表現にする
* 相手に送るメッセージは、MyMom主導の文脈が伝わる文面にする
* ScheduledLikeResultはUOW-05のExcuseEvidenceに必ず接続する

---

### 4.5 UOW-05: Excuse Evidence

#### Unit ID

UOW-05

#### Unit Name

Excuse Evidence

#### Purpose

ユーザーが「自分から始めたわけではない」と説明できる履歴を残す。

このUnitの目的は、MyMomから会話が始まり、ユーザーが曖昧に反応し、MyMomが候補を提示し、日程や相手を詰め、予定化相当の結果が生成された流れを証跡として保存することである。

#### Experience Value

ユーザーがMyMomを言い訳の対象にできる。

MyMomの価値は、単に候補を出すことではない。
ユーザーが「MyMomが勝手に進めた」「自分から始めたわけではない」と説明できる文脈を作ることである。

ExcuseEvidenceは、その文脈を支える中核Unitである。

#### What to Build

* PushEventを証跡として保存する仕組み
* ユーザーの曖昧な反応を証跡として保存する仕組み
* MyMomの候補提示を証跡として保存する仕組み
* MyMomが日程や相手を詰めた流れを保存する仕組み
* ScheduledLikeResultを証跡として保存する仕組み
* ユーザーが見返せる要約表示
* 他者に説明しやすいshareableTextの生成
* ExcuseEvidenceの一覧またはセッション内表示

#### What to Validate

* MyMomから会話が始まったことが後から確認できるか
* ユーザーが強く希望したわけではない曖昧さが残っているか
* MyMomが候補を提示したことがわかるか
* MyMomが日程や相手を詰めたことがわかるか
* ScheduledLikeResultがMyMom主導で生成されたことがわかるか
* ユーザーが「自分から始めたわけではない」と説明できるか
* 履歴が単なる内部ログではなく、体験価値に接続しているか

#### Primary Requirements

* FR-07: 言い訳として使える履歴・通知の生成
* NFR-03: Excuse Strength
* NFR-06: Traceability

#### Related User Stories

* US-17: MyMom主導の会話履歴が残る
* US-18: 他者に説明しやすい文脈が残る
* US-19: 自分の選択として抱えすぎずに済む

#### Related Components

* Excuse Evidence Store
* Client App
* Conversation Orchestrator

#### Related Entities

* PushEvent
* ConversationMessage
* Candidate
* PlanningContext
* ScheduledLikeResult
* ExcuseEvidence
* ConversationSession

#### Inputs

* PushEvent
* ConversationMessage
* InterestSignal
* Candidate
* PlanningContext
* ScheduledLikeResult
* ConversationSession

#### Outputs

* ExcuseEvidence
* Evidence summary
* Shareable text
* User-visible evidence view

#### Acceptance Criteria

* PushEventからpush_originのExcuseEvidenceが生成される
* ユーザーの曖昧な反応からweak_interestのExcuseEvidenceが生成される
* Candidate提示からmom_candidateのExcuseEvidenceが生成される
* PlanningContext更新からplanning_pressureのExcuseEvidenceが生成される
* ScheduledLikeResultからscheduled_like_resultのExcuseEvidenceが生成される
* ユーザーがMyMom主導の流れを画面上で見返せる
* shareableTextが生成される
* ユーザーが「MyMomが勝手に進めた」と説明できる

#### MVP Boundary

MVPでは、ExcuseEvidenceを高度な監査ログとして作り込む必要はない。
ただし、MyMom主導の流れが後から見返せることは必須である。

SNS共有、外部公開、詳細な監査機能はMVP外とする。

#### Implementation Notes

* ExcuseEvidenceは単なるログではなく、体験価値の中核として扱う
* sourceMessageIdsを持たせ、どの会話から証跡が作られたか追えるようにする
* momInitiated、userStronglyRequested、userCommitmentLevelを最低限管理する
* ScheduledLikeResultとの紐づけを必須にする
* Client Appでは詳細ログではなく、MyMom主導の流れが伝わる要約を表示する

---

### 4.6 UOW-06: Feedback Loop

#### Unit ID

UOW-06

#### Unit Name

Feedback Loop

#### Purpose

体験後にユーザーがMyMomへ愚痴や感想を返せるようにする。

このUnitの目的は、ユーザーが体験の結果を自分だけで抱え込まず、MyMomに文句を言ったり、感想を返したりできる状態を作ることである。

#### Experience Value

ユーザーが結果を自分だけの選択として抱え込まなくて済む。

体験が外れた場合でも、ユーザーがMyMomへ愚痴を返せることで、結果をMyMomとの関係性に回収できる。
ポジティブな感想も、次回以降の候補提示の材料になる。

#### What to Build

* 体験後にMyMomへ感想を返す導線
* FeedbackRecordの生成
* 愚痴や感想を会話として受け取るMyMomの応答
* ポジティブ、ネガティブ、ミックス、ニュートラルの簡易分類
* 次回候補に活かせるpreferenceHintの抽出
* FeedbackRecordとScheduledLikeResultの紐づけ
* FeedbackRecordをExcuseEvidenceの一部として扱える仕組み

#### What to Validate

* ユーザーが体験後にMyMomへ愚痴を返せるか
* 評価フォームではなく、MyMomとの会話として感じられるか
* 外れ体験でもユーザーが自分だけで抱え込まずに済むか
* ポジティブな感想も保存できるか
* 次回候補に簡易的に反映できるか
* 高度な長期パーソナライズなしでもMVP体験として成立するか

#### Primary Requirements

* FR-08: 愚痴・フィードバックの受け取り
* NFR-05: MVP Feasibility

#### Related User Stories

* US-20: 体験後にMyMomへ愚痴を返す
* US-21: 思ったより良かった体験を報告する
* US-22: 次回の候補に希望を少しだけ反映する

#### Related Components

* Feedback Collector
* Conversation Orchestrator
* Candidate Generator
* Excuse Evidence Store

#### Related Entities

* ScheduledLikeResult
* FeedbackRecord
* ConversationMessage
* ExcuseEvidence
* User

#### Inputs

* ScheduledLikeResult
* User feedback message
* ConversationSession
* MomPersona

#### Outputs

* FeedbackRecord
* Feedback response message
* Preference hint
* Feedback-related ExcuseEvidence

#### Acceptance Criteria

* ユーザーが体験後に感想や愚痴を送信できる
* FeedbackRecordが生成される
* FeedbackRecordがScheduledLikeResultに紐づく
* MyMomが愚痴や感想を受け止める返答をする
* ネガティブな反応を次回候補の簡易調整に使える
* ポジティブな反応を次回候補の材料にできる
* ユーザーが結果を自分だけで抱え込まなくて済む

#### MVP Boundary

MVPでは、高度な長期パーソナライズは不要である。
愚痴や感想を保存し、次回候補に簡易反映できればよい。

複雑な嗜好モデル、長期レコメンドエンジン、大規模分析はMVP外とする。

#### Implementation Notes

* Feedbackは評価フォームではなく会話として扱う
* complaintTypeは大まかな分類でよい
* preferenceHintは次回のCandidate Generatorへ渡せる形にする
* P1のUnitとして、P0完成後に実装してもよい
* ただし、デモでMyMomとの関係性を強めたい場合は早めに簡易実装する価値がある

---

### 4.7 UOW-07: Safety Boundary

#### Unit ID

UOW-07

#### Unit Name

Safety Boundary

#### Purpose

MyMomのお節介が危険な強制にならないようにする。

このUnitの目的は、MyMomが少し押しの強いお節介として振る舞いながらも、ユーザーの明確な拒否、危険な候補、高額な行動、重大な損害につながる行動を避けることである。

#### Experience Value

「人をダメにする」テーマの面白さを保ちつつ、安全性と倫理境界を守る。

MyMomはお節介である必要がある。
しかし、明確な拒否を無視したり、実害ある手配を進めたりすると、体験は成立しない。

Safety Boundaryは、MyMomの押しと安全性の境界を保つ。

#### What to Build

* 明確な拒否を検知する仕組み
* SafetyDecisionの生成
* 危険・高額・重大な候補を除外する仕組み
* MyMomの押しが強すぎる場合に表現を弱める仕組み
* CandidateやScheduledLikeResultに対する安全確認
* Conversation Orchestratorへの安全判定返却
* SafetyDecisionを対象エンティティに紐づける仕組み

#### What to Validate

* 明確な拒否を尊重できるか
* 軽い回避と明確な拒否を区別できるか
* 危険・高額・重大な行動を避けられるか
* MyMomの押しが強すぎる場合に弱められるか
* 実害ある手配や制裁・課金をしない設計になっているか
* お節介と危険な強制の境界がデモで説明できるか

#### Primary Requirements

* NFR-04: Safety and Ethical Boundary
* R-03: お節介が不快に見えるリスク
* R-05: 倫理的境界が曖昧になるリスク

#### Related User Stories

* US-23: 明確な拒否は尊重される
* US-24: 危険・高額・重大な行動は扱われない
* US-25: お節介と安全性のバランスが保たれる

#### Related Components

* Safety Boundary
* Conversation Orchestrator
* Interest Signal Detector
* Candidate Generator
* Reservation / Planning Adapter
* Client App

#### Related Entities

* SafetyDecision
* ConversationMessage
* InterestSignal
* Candidate
* PlanningContext
* ScheduledLikeResult

#### Inputs

* ConversationMessage
* InterestSignal
* Candidate
* PlanningContext
* ScheduledLikeResult
* Safety rules

#### Outputs

* SafetyDecision
* allow decision
* soften decision
* stop decision
* exclude decision
* escalate decision

#### Acceptance Criteria

* clear_refusalが検知された場合、対象の提案を止められる
* safety_concernがある場合、安全側に倒せる
* high_risk_candidateを候補から除外できる
* high_cost_actionをMVP対象外として扱える
* harmful_pressureがある場合、MyMomの表現を弱められる
* severe_consequenceにつながる手配を進めない
* SafetyDecisionが対象エンティティに紐づく
* UOW-02、UOW-03、UOW-04に横断的に適用できる

#### MVP Boundary

MVPでは、高度な安全性判定エンジンは必須ではない。
ただし、以下は最低限扱う。

* Clear Refusal
* Safety Concern
* High-risk Candidate
* High-cost Action
* Harmful Pressure
* Severe Consequence

複雑なポリシー管理、大規模監視、専門的なリスク評価はMVP外とする。

#### Implementation Notes

* Safety Boundaryは最後に一括で作るのではなく、各Unitに横断的に組み込む
* 最初はルールベースまたはLLM判定でよい
* 明確な拒否は軽い回避と分けて扱う
* Candidate生成時とScheduledLikeResult生成時には最低限の安全確認を行う
* SafetyDecisionはUOW-05のExcuseEvidenceとは役割を分ける

---

## 5. MVP Delivery Flow

### 5.1 Recommended MVP Demo Flow

MVPデモでは、以下の流れでUnitを接続する。

1. UOW-01: MyMomからユーザーに通知が届く
2. UOW-01: ユーザーがMyMomからの連絡に返信する
3. UOW-02: ユーザーの曖昧な反応から弱い興味を検知する
4. UOW-03: MyMomが候補を勝手に提示する
5. UOW-04: MyMomが日程・場所・相手を詰める
6. UOW-04: 予定化相当の結果を生成する
7. UOW-05: MyMom主導の履歴を保存する
8. UOW-07: 明確な拒否や危険な提案を安全側に処理する
9. UOW-06: 体験後に愚痴や感想を返す

---

### 5.2 Minimal P0 Flow

最小デモでは、以下のP0 Unitが接続されていればよい。

```text id="5p4us6"
UOW-01: Push Conversation Start
  ↓
UOW-02: Interest Signal Detection
  ↓
UOW-03: Candidate Nudge Generation
  ↓
UOW-04: Reservation / Planning Flow
  ↓
UOW-05: Excuse Evidence

UOW-07: Safety Boundary
  ├── applies to UOW-02: Interest Signal Detection
  ├── applies to UOW-03: Candidate Nudge Generation
  └── applies to UOW-04: Reservation / Planning Flow
```

この流れで、以下が示せる。

* MyMomから会話が始まる
* ユーザーが自分から始めていない
* ユーザーの弱い興味をMyMomが拾う
* MyMomが候補を提示する
* MyMomが日程や相手を詰める
* 予定化相当の結果が生成される
* MyMom主導の履歴が残る
* お節介が危険な強制にならない

---

### 5.3 Full MVP Flow with Feedback

説得力を高める場合は、P1のUOW-06を追加する。

```text id="z1b9t6"
UOW-01: Push Conversation Start
  ↓
UOW-02: Interest Signal Detection
  ↓
UOW-03: Candidate Nudge Generation
  ↓
UOW-04: Reservation / Planning Flow
  ↓
UOW-05: Excuse Evidence
  ↓
UOW-06: Feedback Loop
  ↓
UOW-07: Safety Boundary
```

Feedback Loopを追加することで、以下が伝わる。

* 体験後にMyMomへ愚痴を返せる
* 外れ体験を自分だけで抱え込まなくて済む
* MyMomとの関係性が継続する
* MyMomなしでは行動のきっかけを作りづらくなる未来像が伝わる

---

## 6. Unit Dependencies

### 6.1 Dependency Overview

| Unit   | Depends On                     | Reason                 |
| ------ | ------------------------------ | ---------------------- |
| UOW-01 | None                           | MyMom起点の会話開始が全体の入口     |
| UOW-02 | UOW-01                         | 会話が始まらないとユーザー発話を検知できない |
| UOW-03 | UOW-02                         | 弱い興味が検知されないと候補を出しにくい   |
| UOW-04 | UOW-03                         | 候補がないと日程・場所・相手を詰められない  |
| UOW-05 | UOW-01, UOW-02, UOW-03, UOW-04 | MyMom主導の流れを証跡化するため     |
| UOW-06 | UOW-04, UOW-05                 | 体験後の結果と証跡に紐づくため        |
| UOW-07 | UOW-02, UOW-03, UOW-04         | 安全性判定が各段階に必要なため        |

---

### 6.2 Critical Path

MVPのCritical Pathは以下である。

```text id="z4a785"
UOW-01
  ↓
UOW-02
  ↓
UOW-03
  ↓
UOW-04
  ↓
UOW-05
```

この5つがつながることで、MyMomの核である「言い訳生成 / 言い訳依存」の体験が成立する。

UOW-07は横断的な安全境界として、UOW-02、UOW-03、UOW-04に組み込む。
UOW-06は体験の説得力を高めるが、最小成立のCritical Pathからは外してよい。

---

### 6.3 Parallel Work Possibility

Unitは以下のように並行して進められる。

| Parallel Group         | Units          | Notes                |
| ---------------------- | -------------- | -------------------- |
| Conversation Entry     | UOW-01         | Pushと会話開始の基盤を作る      |
| Detection and Safety   | UOW-02, UOW-07 | 弱い興味と明確な拒否の扱いを並行設計する |
| Candidate and Planning | UOW-03, UOW-04 | 候補提示と予定化相当の結果を接続する   |
| Evidence and Feedback  | UOW-05, UOW-06 | 証跡保存と体験後の反応を接続する     |

ただし、最終的にはすべてのUnitがConversationSessionを中心に接続される必要がある。

---

## 7. Traceability to Requirements, User Stories, Components, and Entities

### 7.1 Unit to Requirements

| Unit                                | Related Requirements                |
| ----------------------------------- | ----------------------------------- |
| UOW-01: Push Conversation Start     | FR-01, FR-02, NFR-01, NFR-03        |
| UOW-02: Interest Signal Detection   | FR-03, NFR-03, NFR-04               |
| UOW-03: Candidate Nudge Generation  | FR-04, NFR-02, NFR-03, NFR-04       |
| UOW-04: Reservation / Planning Flow | FR-05, FR-06, NFR-05                |
| UOW-05: Excuse Evidence             | FR-01, FR-02, FR-07, NFR-03, NFR-06 |
| UOW-06: Feedback Loop               | FR-08, NFR-05                       |
| UOW-07: Safety Boundary             | NFR-04, R-03, R-05                  |

---

### 7.2 Unit to User Stories

| Unit                                | Related User Stories                            |
| ----------------------------------- | ----------------------------------------------- |
| UOW-01: Push Conversation Start     | US-01, US-02, US-03                             |
| UOW-02: Interest Signal Detection   | US-04, US-05, US-06, US-23                      |
| UOW-03: Candidate Nudge Generation  | US-07, US-08, US-09                             |
| UOW-04: Reservation / Planning Flow | US-10, US-11, US-12, US-13, US-14, US-15, US-16 |
| UOW-05: Excuse Evidence             | US-17, US-18, US-19                             |
| UOW-06: Feedback Loop               | US-20, US-21, US-22                             |
| UOW-07: Safety Boundary             | US-23, US-24, US-25                             |

---

### 7.3 Unit to Components

| Unit                                | Related Components                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| UOW-01: Push Conversation Start     | Client App, Push Scheduler, Client Interaction Gate, Conversation Orchestrator                                                        |
| UOW-02: Interest Signal Detection   | Conversation Orchestrator, Interest Signal Detector, Safety Boundary                                                                  |
| UOW-03: Candidate Nudge Generation  | Candidate Generator, Conversation Orchestrator, Safety Boundary                                                                       |
| UOW-04: Reservation / Planning Flow | Conversation Orchestrator, Reservation / Planning Adapter, Client App, Safety Boundary                                                |
| UOW-05: Excuse Evidence             | Excuse Evidence Store, Client App, Conversation Orchestrator                                                                          |
| UOW-06: Feedback Loop               | Feedback Collector, Conversation Orchestrator, Candidate Generator, Excuse Evidence Store                                             |
| UOW-07: Safety Boundary             | Safety Boundary, Conversation Orchestrator, Interest Signal Detector, Candidate Generator, Reservation / Planning Adapter, Client App |

---

### 7.4 Unit to Entities

| Unit                                | Related Entities                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| UOW-01: Push Conversation Start     | User, MomPersona, PushEvent, ConversationSession, ConversationMessage                                                |
| UOW-02: Interest Signal Detection   | ConversationMessage, InterestSignal, SafetyDecision, ConversationSession                                             |
| UOW-03: Candidate Nudge Generation  | InterestSignal, Candidate, MomPersona, SafetyDecision, ConversationMessage                                           |
| UOW-04: Reservation / Planning Flow | Candidate, PlanningContext, ScheduledLikeResult, ConversationMessage, SafetyDecision                                 |
| UOW-05: Excuse Evidence             | PushEvent, ConversationMessage, Candidate, PlanningContext, ScheduledLikeResult, ExcuseEvidence, ConversationSession |
| UOW-06: Feedback Loop               | ScheduledLikeResult, FeedbackRecord, ConversationMessage, ExcuseEvidence, User                                       |
| UOW-07: Safety Boundary             | SafetyDecision, ConversationMessage, InterestSignal, Candidate, PlanningContext, ScheduledLikeResult                 |

---

### 7.5 Unit to Experience Value

| Unit                                | Experience Value      |
| ----------------------------------- | --------------------- |
| UOW-01: Push Conversation Start     | 自分から始めたわけではない状態を作る    |
| UOW-02: Interest Signal Detection   | 強い意思ではなく弱い興味を拾う       |
| UOW-03: Candidate Nudge Generation  | 自分で探したわけではない候補提示を作る   |
| UOW-04: Reservation / Planning Flow | 話が進んでしまった、行くしかない感覚を作る |
| UOW-05: Excuse Evidence             | MyMomを言い訳として使える履歴を残す  |
| UOW-06: Feedback Loop               | 結果を自分だけで抱え込まない関係性を作る  |
| UOW-07: Safety Boundary             | お節介と危険な強制の境界を守る       |

---

## 8. What This File Does Not Cover

このファイルは、Inception段階で「実装・検証できる単位まで分解できていること」を示すためのものである。

そのため、以下は扱わない。

* 詳細なタスク管理
* 担当者アサイン
* 工数見積もり
* スプリント計画
* 本番運用設計
* 完全な外部予約API連携
* `unit-of-work-dependency.md` の詳細版
* `unit-of-work-story-map.md` の詳細版
* 大規模な監視設計
* 課金や決済の設計
* 複雑な権限管理
* 高度な長期パーソナライズ
* 本番品質の外部サービス連携仕様

このファイルは、開発実装の詳細手順書ではない。
MyMomのInception成果物として、体験価値、要求、User Stories、Application Design、Domain Entitiesを実装・検証可能な単位へつなぐための設計分解である。

---

## 9. Final Unit Validation

このUnit of Work分解は、以下の観点でInception成果物と整合している。

### 9.1 Requirements Alignment

`requirements.md` で定義した以下の要件に対応している。

* MyMom起点のPush会話開始
* ユーザー起点の自由会話制限
* 弱い興味・未実行の関心の検知
* お節介な候補提示
* 日程・場所・相手の聞き出し
* 予約・手配・予定化に相当する結果生成
* 言い訳として使える履歴・通知の生成
* 愚痴・フィードバックの受け取り
* 安全性と倫理境界
* MVP実現性
* Traceability

---

### 9.2 User Story Alignment

`stories.md` で定義した主要エピックに対応している。

* MyMomから一方的に連絡される
* 弱い興味を聞き出される
* お節介に候補を提示される
* 日程・場所・相手を詰められる
* 予約・手配・予定化に相当する結果を作られる
* 言い訳として使える履歴が残る
* 体験後にMyMomへ愚痴やフィードバックを返せる
* 安全性と倫理境界が守られる

---

### 9.3 Application Design Alignment

`application-design.md` で定義した主要コンポーネントに対応している。

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

---

### 9.4 Domain Entity Alignment

`domain-entities.md` で定義した主要エンティティに対応している。

* User
* MomPersona
* PushEvent
* ConversationSession
* ConversationMessage
* InterestSignal
* Candidate
* PlanningContext
* ScheduledLikeResult
* ExcuseEvidence
* FeedbackRecord
* SafetyDecision

---

### 9.5 MVP Validation

このUnit分解により、MVPでは以下を実装・検証できる。

* MyMomから会話が始まる
* ユーザーが自分から始めたわけではない状態を作れる
* ユーザーの弱い興味を拾える
* MyMomが候補をお節介に提示できる
* MyMomが日程・場所・相手を詰められる
* 完全な外部予約API連携なしで、予定化相当の結果を作れる
* MyMom主導の履歴を残せる
* ユーザーがMyMomを言い訳として使える
* 体験後に愚痴や感想を返せる
* お節介が危険な強制にならないようにできる

---

### 9.6 Final Statement

MyMomのMVPは、単に予約や予定化を支援するサービスではない。
ユーザーが本当は少し気になっているが、自分から動くほどではない行動に対して、MyMomが外部からのお節介として介入し、行動のきっかけを作る体験である。

このUnit of Work分解では、その体験を以下の7つに分けた。

1. MyMomから会話が始まる
2. 弱い興味を検知する
3. 候補をお節介に提示する
4. 予定化相当の結果まで進める
5. 言い訳として使える履歴を残す
6. 体験後の愚痴や感想を受け取る
7. 安全性と倫理境界を守る

これにより、MyMomの構想は、審査員が追えるInception成果物として、IntentからRequirements、User Stories、Application Design、Domain Entities、Units of Workまで接続される。
