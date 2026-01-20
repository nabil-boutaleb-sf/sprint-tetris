# Sprint Tetris - Analysis & Design

## Problem Statement
The leadership team often pushes for more work into sprints without a clear visualization of capacity. This leads to:
- Management overhead.
- High context switching.
- Team stress and burnout due to overcommitment.

## Goal
Create a user-friendly visualization tool ("Sprint Tetris") that clearly demonstrates:
- Current sprint capacity vs. workload.
- The "physical" space tasks take up (Task Size = Complexity/Points).
- Clear warning signs when a sprint is overstuffed.

## Solution MVP
### UI Concept
- **Sprint Columns**: Vertical "tubes" representing sprints.
- **Task Blocks**: Cards with height proportional to Story Points (1pt = 20px).
- **Physicality**: When cards exceed the column height, they visually overflow with red warning indicators.
- **Interactive**: Drag & drop tasks between Backlog and Sprints to "fit helps" the schedule.

### Core Features (Implemented)
1.  **Visualization**: Proportional task heights, Capacity "Water Level".
2.  **Drag & Drop**: Move tasks freely between Backlog and Sprints.
3.  **State Management**: Client-side state (Zustand) with editable sprint capacities.
4.  **Filtering**: Filter entire board by Assignee.
5.  **Task Details**: Clickable cards revealing full metadata.
6.  **Theming**: Light/Dark mode.

## Data Model
- **Task**: `{ id, title, points, assignee, sprints[], status }`
- **Sprint**: `{ name, capacity }`
- **Source**: Currently `mockData.ts`. Future: Asana API.

## Future Roadmap
See `ROADMAP.md` for the official feature plan, including:
- Two-Way Asana Sync
- Smart Analytics & Availability Management
- Scenario "Playground" Mode
