# Component Dependency — MyMom

## 1. Purpose

このドキュメントは、MyMomのInceptionフェーズにおけるApplication Design成果物である。

`components.md` で定義した10コンポーネントの依存関係・通信パターン・データフローを整理する。

---

## 2. Dependency Matrix

行が依存元、列が依存先。`→` は依存あり。

|  | Client App | Push Scheduler | Client Interaction Gate | Conversation Orchestrator | Interest Signal Detector | Candidate Generator | Reservation / Planning Adapter | Excuse Evidence Store | Feedback Collector | Safety Boundary |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Client App** | — | | | → | | | | → | → | |
| **Push Scheduler** | → | — | → | → | | | | | | |
| **Client Interaction Gate** | | | — | → | | | | | | |
| **Conversation Orchestrator** | → | | | — | → | → | → | → | | → |
| **Interest Signal Detector** | | | | → | — | → | | | | → |
| **Candidate Generator** | | | | → | | — | | | | → |
| **Reservation / Planning Adapter** | | | | → | | | — | → | | → |
| **Excuse Evidence Store** | → | | | | | | | — | | |
| **Feedback Collector** | | | | → | | → | | → | — | |
| **Safety Boundary** | | | | | | | | | | — |

---

## 3. Dependency Details

### 3.1 Push Scheduler

**依存先**:
- `Client App` — PushEventを通知として表示させる
- `Client Interaction Gate` — Push発火後に返信可能状態を開ける
- `Conversation Orchestrator` — PushEventを渡して会話を開始させる

**通信パターン**: Push Schedulerが主体的に呼び出す（outbound only）

---

### 3.2 Client Interaction Gate

**依存先**:
- `Conversation Orchestrator` — 返信可能なセッション状態を確認する

**通信パターン**: 状態照会 → ゲート開閉制御

---

### 3.3 Conversation Orchestrator

**依存先**:
- `Client App` — MyMomの発話・候補・結果を表示させる
- `Interest Signal Detector` — ユーザー発話を解析して興味シグナルを取得する
- `Candidate Generator` — 興味シグナルをもとに候補を生成させる
- `Reservation / Planning Adapter` — PlanningContextを渡して予定化相当の結果を生成させる
- `Excuse Evidence Store` — 会話の各フェーズで証跡を保存させる
- `Safety Boundary` — 各フェーズで安全性チェックを依頼する

**通信パターン**: Conversation Orchestratorが全コンポーネントを順次呼び出すオーケストレーター

---

### 3.4 Interest Signal Detector

**依存先**:
- `Conversation Orchestrator` — シグナル検知結果を返す（コールバック）
- `Candidate Generator` — 検知したカテゴリを渡して候補生成を促す
- `Safety Boundary` — 明確な拒否の判定を依頼する

**通信パターン**: 解析 → 結果返却

---

### 3.5 Candidate Generator

**依存先**:
- `Conversation Orchestrator` — 生成した候補を返す（コールバック）
- `Safety Boundary` — 候補の安全性フィルタリングを依頼する

**通信パターン**: 生成 → フィルタリング → 返却

---

### 3.6 Reservation / Planning Adapter

**依存先**:
- `Conversation Orchestrator` — 予定化相当の結果を返す（コールバック）
- `Excuse Evidence Store` — 結果を証跡として保存させる
- `Safety Boundary` — 予定化相当の結果の安全性チェックを依頼する

**通信パターン**: 生成 → 保存 → 返却

---

### 3.7 Excuse Evidence Store

**依存先**:
- `Client App` — 証跡サマリーを表示させる

**通信パターン**: 保存（write）+ 読み出し（read）

---

### 3.8 Feedback Collector

**依存先**:
- `Conversation Orchestrator` — 次回会話材料を渡す
- `Candidate Generator` — 次回候補調整のヒントを渡す
- `Excuse Evidence Store` — フィードバック記録を保存させる

**通信パターン**: 収集 → 抽出 → 次回セッションへ反映

---

### 3.9 Safety Boundary（横断的依存）

Safety Boundaryは依存先を持たない。各コンポーネントから呼び出される横断的サービス。

**依存元**:
- Conversation Orchestrator（発話チェック）
- Interest Signal Detector（シグナルチェック）
- Candidate Generator（候補フィルタリング）
- Reservation / Planning Adapter（結果チェック）

---

## 4. Communication Patterns

| Pattern | Components | Description |
|---|---|---|
| **Orchestration** | Conversation Orchestrator → 全コンポーネント | Conversation Orchestratorが会話フロー全体を制御する |
| **Push** | Push Scheduler → Client App / Client Interaction Gate / Conversation Orchestrator | 外部イベントとしてPushを発火する |
| **Callback** | Interest Signal Detector / Candidate Generator / Reservation / Planning Adapter → Conversation Orchestrator | 処理結果をOrchestratorへ返す |
| **Cross-cutting** | Safety Boundary ← 各コンポーネント | 各フェーズで横断的に安全性チェックを呼び出す |
| **Evidence Write** | Conversation Orchestrator / Reservation / Planning Adapter → Excuse Evidence Store | 各フェーズの完了時に証跡を保存する |
| **Feedback Loop** | Feedback Collector → Conversation Orchestrator / Candidate Generator | 次回セッションへフィードバックを反映する |

---

## 5. Data Flow Diagram

```
[Push Scheduler]
  PushEvent
      ↓
[Client App] ←通知表示
[Client Interaction Gate] ←ゲートオープン
[Conversation Orchestrator] ←セッション開始
      ↓ ユーザー発話
[Interest Signal Detector]
  InterestSignal
      ↓
[Candidate Generator]
  Candidate[]  ←── [Safety Boundary] フィルタリング
      ↓
[Conversation Orchestrator]
  候補提示 → [Client App]
      ↓ ユーザー反応
  PlanningContext
      ↓
[Reservation / Planning Adapter]
  ScheduledLikeResult ←── [Safety Boundary] チェック
      ↓
[Excuse Evidence Store] ←保存
[Client App] ←結果表示
      ↓
[Feedback Collector]
  FeedbackRecord
      ↓
[Candidate Generator] / [Conversation Orchestrator] ←次回反映

[Safety Boundary] ←────────── 各フェーズから横断的に呼ばれる
```

---

## 6. Coupling Assessment

| Coupling | Components | Level | Note |
|---|---|---|---|
| 高 | Conversation Orchestrator ↔ Interest Signal Detector | High | 会話の中核フロー |
| 高 | Conversation Orchestrator ↔ Candidate Generator | High | 会話の中核フロー |
| 高 | Conversation Orchestrator ↔ Reservation / Planning Adapter | High | 会話の中核フロー |
| 中 | Conversation Orchestrator ↔ Excuse Evidence Store | Medium | 各フェーズで保存 |
| 中 | Push Scheduler ↔ Conversation Orchestrator | Medium | セッション開始のみ |
| 低 | Feedback Collector ↔ Candidate Generator | Low | 次回セッション時のみ |
| 横断 | Safety Boundary ↔ 各コンポーネント | Cross-cutting | 直接結合ではなくサービス呼び出し |

---

## 7. Traceability to User Stories

| Dependency | Related User Stories |
|---|---|
| Push Scheduler → Conversation Orchestrator | US-01, US-02, US-03 |
| Conversation Orchestrator → Interest Signal Detector | US-04, US-05, US-06 |
| Interest Signal Detector → Candidate Generator | US-07, US-08, US-09 |
| Conversation Orchestrator → Reservation / Planning Adapter | US-10, US-11, US-12, US-13 |
| Conversation Orchestrator → Excuse Evidence Store | US-17, US-18, US-19 |
| Feedback Collector → Conversation Orchestrator | US-20, US-21, US-22 |
| Safety Boundary ← 各コンポーネント | US-23, US-24, US-25 |
