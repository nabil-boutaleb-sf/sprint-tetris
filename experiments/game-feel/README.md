# Sprint Tetris

A "Sprint Tetris" style visualization tool for leadership teams to understand sprint capacity, workload, and constraints at a glance.

![Sprint Viz Mockup](assets/mockup.png)

## Overview
This tool visualizes Asana tasks as "cards" where the **height is proportional to the Story Points**. This makes "over-capacity" immediately visible as the column visually overflows.

## Phases Implemented

### Phase 1: Core Visualization
- **Sprint Columns**: Vertical containers representing sprints.
- **Proportional Height**: 1 Story Point = 20px (configurable).
- **Capacity Warnings**: Columns turn yellow (90%) or red (100%+) based on total points.

### Phase 2: Interactivity
- **Drag & Drop**: Powered by `@dnd-kit`. Move tasks between Sprints and Backlog.
- **Editable Capacity**: Adjust sprint capacity on the fly (input in header) to see immediate visual feedback.
- **State Management**: Using `Zustand` for a fluid, client-side experience.
- **Theming**: Full Light/Dark mode support.

### Phase 3: Advanced Features
- **Assignee Filtering**: Filter the entire board (Sprints + Backlog) by assignee.
- **Backlog Sidebar**: Collapsible, left-aligned sidebar with overflow protection.

### Phase 4: Polish & Details
- **Task Details Modal**: Click any card to view full details (Assignee, Sprints, Description placeholder).
- **Visual Polish**: Glassmorphism effects, smooth transitions, and stable layout during drag operations.

### Phase 5: Production Readiness
- **Asana Integration**: Implemented (One-way ingest + Token management).
- **Persistence**: LocalStorage support for state and credentials.
- **Testing**: Unit tests for Hooks and Components.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS 4
- **State**: Zustand
- **DnD**: @dnd-kit/core
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000).

## Tests
Run the test suite:
```bash
npm test
```

## Next Steps / Roadmap
See `ROADMAP.md` for details.
- [ ] **Two-Way Sync**: Push changes back to Asana.
- [ ] **Smart Analytics**: Velocity-based capacity planning.
- [ ] **Scenario Mode**: "What-if" planning sandbox.
