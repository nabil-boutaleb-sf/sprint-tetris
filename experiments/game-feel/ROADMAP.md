# Sprint Tetris - Roadmap

## 1. Two-Way Asana Sync
**Goal:** Operationalize the board for daily use.
Enable bidirectional synchronization so that changes made in the Sprint Tetris UI (e.g., dragging a task to a different sprint) are immediately reflected in Asana.

### Implementation Checklist
- [ ] Enable the `Sync` button in `Board.tsx`.
- [ ] Implement `pushChanges` using `boardStore.syncChanges`.
- [ ] Add a **Change Summary Modal** that appears before syncing:
    - Lists all pending moves/edits.
    - Allows cherry-picking which changes to push.
    - Provides a final "Confirm" button to prevent accidental mass updates.
- [ ] Handle sync errors gracefully (e.g., retry logic, "partial success" states).

## 2. Smart Capacity & Velocity Analytics
**Goal:** Scientifically prevent burnout by distinguishing between "Performance" (Speed) and "Availability" (Time).

### Core Concept: The Capacity Formula
Currently, we set a manual "Capacity" number. We should move to a calculated model:
> **Target Capacity = (Historical Velocity / Sprint Days) * Available Days**

### Detailed Requirements
- **Historical Velocity:**
    - Calculate the average points completed by an assignee in the last 3 closed sprints.
    - Exclude "abnormal" sprints (e.g., where the assignee was on leave for >50% of the time) to prevent skewing.
- **Availability Management (The "Human" Factor):**
    - **Calendar Integration:** Allow inputting "Out of Office" days (Vacation, Holidays, Sick Leave).
    - **Availability Factor:** If a sprint is 10 days, and Alice is out for 2, her Availability Factor is 0.8.
    - **Visual Indicators:**
        - If Alice is on vacation for 50% of the sprint, visually "block out" 50% of her sprint column height.
        - Show a warning: "⚠️ Capacity set to 20pts, but Alice only has availability for 12pts."

## 3. "What-If" Scenarios (Scenario Mode)
**Goal:** Low-stakes planning and hypothesis testing.
Allow managers to drag tasks around wildly to test hypothetical plans without affecting the "real" board state or logging pending changes.

### Implementation Checklist
- [ ] **Toggle Switch:** "Enter Scenario Mode".
- [ ] **Visual Distinction:** Change the board background/border (e.g., blueprint style) to indicate Sandbox mode.
- [ ] **Sandboxed State:**
    - Fork the current Zustand state into a temporary `scenarioState`.
    - All actions apply to `scenarioState`.
    - "Pending Changes" are hidden or replaced by "Scenario Diff".
- [ ] **Resolution:**
    - **Discard:** Revert to original state.
    - **Commit:** Apply `scenarioState` to the real `boardStore` and generate the resulting Pending Changes.
