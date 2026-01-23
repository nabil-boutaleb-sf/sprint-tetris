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

## 4. Game Feel & Polish
**Goal:** Make the tool feel "premium" and satisfying to use.

### Features
- [ ] **Sensory Feedback:**
    - **Confetti:** Visual celebration when a sprint is perfectly filled (92-100%).
    - **Sound:** Subtle "Success Chime" (e.g., Glass/Tink) on perfect fill.
    - **Haptic/Visual Lock-in:** Pulse animation and "Lock" icon overlay when capacity is optimized.
- [ ] **Visual Enhancements:**
    - **Glassmorphism:** Frosting effects on modals and cards.
    - **Snap Animations:** Smoother transitions when dropping cards.
    - **Tooltips:** Improved hovering for assignee breakdowns.

## 5. Testing Strategy (Playwright)
**Goal:** Ensure reliability of complex interactions (Drag & Drop) without slowing down development.

### Approach
- **Core Logic:** Continue using Jest/RTL for Hooks and State logic (fast, isolated).
- **Interactions:** Adopt **Playwright** for end-to-end tests of the Board.
    - **Why:** Jest (jsdom) mocks browser constraints and often fakes DnD. Playwright uses real browser engines (Chromium/Webkit) to verify that a user can *actually* drag a card to a column.
    - **Scope:** "Critical Paths" only (Create Task -> Drag to Sprint -> Verify Capacity Update).
    - **Visual Regression:** Use Playwright to screenshot the board and catch unwanted layout shifts (e.g., "Did the Red warning column break?").
