============================================================
FILE: README.md
===============

# MyMom

自分から始めたわけではない、と言える状況を作るお節介Push型AIサービス

## 1. One-line Concept

MyMomは、ユーザーの弱い興味にお節介に介入し、行動のきっかけを「自分の意思」ではなく「MyMomのせい」にできるAIサービスです。

---

## 2. What is MyMom?

MyMomは、ユーザーからの依頼を待つAIではありません。

MyMomは、ユーザーに一方的に連絡し、まだ強い意思になっていない弱い興味を聞き出し、候補を提示し、日程・場所・相手を詰め、予約・手配・予定化に相当する結果まで話を進めます。

そして、その一連の流れをMyMom主導の履歴として残します。

ユーザーは、こう言えるようになります。

> MyMomが勝手に進めたから。
> 自分から始めたわけではない。

MyMomが作る価値は、最適な提案そのものではありません。
行動のきっかけを、自分の意思ではなく、外部からのお節介に置けることが価値です。

---

## 3. Why this makes people “ダメ”?

MyMomにおける「人をダメにする」とは、ユーザーの行動力を奪うことではありません。

むしろ、MyMomはユーザーの行動量を増やします。

ただし、その行動の起点はユーザー自身ではありません。

MyMomが勝手に聞いてくる。
MyMomが勝手に候補を探す。
MyMomが勝手に話を進める。
MyMomが予約・手配・予定化まで進んだように感じられる状態を作る。
ユーザーは、それに渋々巻き込まれる。

使えば使うほど、ユーザーは行動するために「自分の意思」ではなく、「外から与えられた言い訳」に頼るようになります。

MyMomがないと、新しい行動に踏み出しづらい。
MyMomがないと、自分の興味を自分のものとして認めづらい。
MyMomがないと、「まあ行ってみるか」の一歩を作れない。

これが、MyMomにおける「人をダメにする」です。

---

## 4. MVP: お節介Push・予約代行

MVPは「お節介Push・予約代行」です。

ただし、MyMomは飲食店予約アプリではありません。

MVPの本質は、MyMomがユーザーの弱い興味に介入し、候補提示から予約・手配・予定化に相当する結果まで進め、ユーザーが「自分から始めたわけではない」と言える状態を作ることです。

MVPでは、以下の体験を実演します。

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

Primary Demo Scenarioとして、飲食店予約を使います。

ただし、完全な外部予約API連携はMVPの必須範囲ではありません。
MVPでは、以下の手段で成立します。

* 疑似予約
* 予約リクエスト生成
* カレンダー予定化
* 予約完了風通知
* 相手に送るメッセージ生成

検証対象は、予約機能そのものではありません。
検証対象は、MyMomに巻き込まれて予定が進んだように感じられ、それが言い訳として成立する体験です。

---

## 5. Primary Demo Scenario: 飲食店予約

Primary Demo Scenarioは、飲食店予約です。

飲食店予約は、MyMomの体験構造を短く見せやすいユースケースです。

ユーザーには、以下のような心理があります。

* 本当は少し気になる相手や友人がいる
* 食事くらい行ってもいい
* でも自分から誘うほどではない
* 店を探すのが面倒
* 日程を決めるのが面倒
* 自分が行きたかったことにしたくない

MyMomは、この弱い興味にお節介に介入します。

デモでは、以下の流れを見せます。

1. MyMomから通知が来る
2. ユーザーが渋々返信する
3. MyMomが弱い興味を拾う
4. MyMomが店を提示する
5. MyMomが日程・相手への連絡を詰める
6. 予定化相当の結果を生成する
7. MyMom主導の履歴を残す
8. ユーザーが「MyMomが勝手に進めた」と言える

このシナリオにより、MyMomが単なる予約支援ではなく、行動の起点を外部化するサービスであることを示します。

---

## 6. Secondary Use Cases

MyMomの体験構造は、飲食店予約以外にも展開できます。

Secondary Use Casesは以下です。

* 美術館・博物館・展示会
* フェス・期間限定イベント
* 休日の外出
* 友人との食事
* 新しい趣味や体験

これらはいずれも、ユーザーが「本当は少し気になっているが、自分から動くほどではない」行動です。

ただし、MVPデモでは体験を分散させません。
まずはPrimary Demo Scenarioとして、飲食店予約の1本でMyMomの核を実演します。

---

## 7. What makes this different?

通常のAIチャットは、ユーザーからの依頼を待ちます。

通常のレコメンドサービスは、ユーザーの条件に合う最適な候補を返します。

MyMomは、そのどちらとも異なります。

MyMomが重視するのは、提案精度そのものではありません。
MyMomが重視するのは、行動の起点を外部化することです。

| Type                   | Main Behavior      | Value               |
| ---------------------- | ------------------ | ------------------- |
| AI Chat                | ユーザーからの質問や依頼に答える   | 情報提供・相談             |
| Recommendation Service | 条件に合う候補を提示する       | 最適化・比較              |
| MyMom                  | ユーザーの弱い興味にお節介に介入する | 自分から始めたわけではないと言える状況 |

MyMomでは、ユーザーがこう言えることが価値です。

> 自分から始めたわけではない。
> MyMomが勝手に進めた。

---

## 8. AI-DLC Inception Artifacts

MyMomのInception成果物は、以下に整理しています。

| Artifact                                                                  | Role                                                                             |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `aidlc-docs/inception/requirements/requirements.md`                       | MyMomのIntent、Problem、Product Thesis、MVP Scope、Requirements、Success Criteriaを定義する |
| `aidlc-docs/inception/requirements/requirement-verification-questions.md` | Requirementsを検証するための問いと回答を整理する                                                   |
| `aidlc-docs/inception/user-stories/personas.md`                           | MyMomが対象とするユーザー心理とペルソナを定義する                                                      |
| `aidlc-docs/inception/user-stories/stories.md`                            | ペルソナとExcuse TriggersをUser Storiesへ展開する                                           |
| `aidlc-docs/inception/application-design/application-design.md`           | MVPを実現する最小アプリケーション構成を定義する                                                        |
| `aidlc-docs/inception/application-design/domain-entities.md`              | MVPが扱う主要エンティティとデータ構造を定義する                                                        |
| `aidlc-docs/inception/application-design/unit-of-work.md`                 | Requirements、Stories、Designを実装・検証可能なUnit of Workへ分解する                            |
| `aidlc-docs/inception/plans/execution-plan.md`                            | MVPをどの順番で実装・検証し、デモ成立状態まで持っていくかを整理する                                              |

---

## 9. Document Reading Guide

審査時は、以下の順番で読むとIntentからExecution Planまで追いやすくなります。

### Recommended Reading Order

1. `README.md`
2. `aidlc-docs/inception/requirements/requirements.md`
3. `aidlc-docs/inception/user-stories/stories.md`
4. `aidlc-docs/inception/application-design/application-design.md`
5. `aidlc-docs/inception/application-design/unit-of-work.md`
6. `aidlc-docs/inception/plans/execution-plan.md`

### Detailed Reference

必要に応じて、以下を補助資料として参照します。

* `aidlc-docs/inception/requirements/requirement-verification-questions.md`
* `aidlc-docs/inception/user-stories/personas.md`
* `aidlc-docs/inception/application-design/domain-entities.md`

### Traceability

このリポジトリでは、以下の流れでInception成果物を接続しています。

Intent
→ Requirements
→ User Stories
→ Application Design
→ Domain Entities
→ Unit of Work
→ Execution Plan

---

## 10. MVP Critical Path

MVPのCritical Pathは以下です。

UOW-01: Push Conversation Start
→ UOW-02: Interest Signal Detection
→ UOW-03: Candidate Nudge Generation
→ UOW-04: Reservation / Planning Flow
→ UOW-05: Excuse Evidence

この流れにより、以下を実演します。

* MyMomから会話が始まる
* ユーザーの弱い興味を拾う
* MyMomが候補を提示する
* MyMomが日程・場所・相手を詰める
* 予約・手配・予定化に相当する結果を作る
* MyMom主導の履歴を残す
* ユーザーが「自分から始めたわけではない」と説明できる

UOW-07: Safety Boundaryは、最後に追加する後段処理ではありません。
UOW-02、UOW-03、UOW-04に横断適用される安全境界です。

UOW-06: Feedback LoopはP1です。
最小MVP成立後に、体験の説得力と継続性を高める追加要素として扱います。

---

## 11. Scope Boundary

MVPでは、以下をやりすぎません。

* 完全な外部予約API連携
* 決済
* キャンセル管理
* 複雑な日程調整
* 高度な長期パーソナライズ
* 大規模レコメンド
* 本番運用監視
* 複雑なユーザー設定
* 複数カテゴリの完全実装

MVPで重要なのは、機能を広げることではありません。
MyMomに巻き込まれて、予定が進んでしまったように感じられる1本の体験を成立させることです。

---

## 12. Safety and Ethical Boundary

MyMomはお節介ですが、危険な強制はしません。

Safety Boundaryでは、以下を守ります。

* 明確な拒否は尊重する
* 危険・高額・重大な行動は扱わない
* 実害のある制裁や課金はしない
* 候補提示、興味検知、予定化相当の各段階に安全境界を適用する

MyMomは、ユーザーを無理やり行動させるサービスではありません。
ユーザーが「押されたことにできる」程度のお節介を作るサービスです。

その境界を超えないために、Safety BoundaryをInception成果物全体で明示しています。

---

## 13. Repository Structure

このREADMEでは、Inception成果物の構成を中心に示します。

```text
aidlc-docs/
└── inception/
    ├── requirements/
    │   ├── requirements.md
    │   └── requirement-verification-questions.md
    ├── user-stories/
    │   ├── personas.md
    │   └── stories.md
    ├── application-design/
    │   ├── application-design.md
    │   ├── domain-entities.md
    │   └── unit-of-work.md
    └── plans/
        └── execution-plan.md
```

---

## 14. Current Status

* Inception artifacts are being prepared for AWS Summit Japan 2026 AI-DLC Hackathon submission.
* MVP scope is defined.
* Primary Demo Scenario is restaurant booking.
* Secondary Use Cases include exhibitions, events, weekend outings, meals with friends, and new experiences.
* Requirements, user stories, application design, domain entities, unit of work, and execution plan are aligned around the same product thesis.
* Construction details are intentionally kept out of scope for this README.
