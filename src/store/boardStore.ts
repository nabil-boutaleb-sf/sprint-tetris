import { create } from 'zustand';
import { Task, SprintName } from '@/types';
import { MOCK_TASKS, SPRINTS } from '@/data/mockData';

interface Sprint {
    name: string;
    capacity: number;
}

interface BoardState {
    tasks: Task[];
    sprints: Sprint[];
    isBacklogOpen: boolean;
    filterAssignee: string | null;

    // Actions
    toggleBacklog: () => void;
    setFilterAssignee: (assignee: string | null) => void;
    moveTask: (taskId: string, targetSprint: SprintName | null) => void;
    updateSprintCapacity: (sprintName: string, capacity: number) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
    tasks: MOCK_TASKS,
    sprints: SPRINTS,
    isBacklogOpen: true,
    filterAssignee: null,

    toggleBacklog: () => set((state) => ({ isBacklogOpen: !state.isBacklogOpen })),
    setFilterAssignee: (filterAssignee) => set({ filterAssignee }),

    moveTask: (taskId, targetSprint) => set((state) => {
        return {
            tasks: state.tasks.map((t) => {
                if (t.id !== taskId) return t;

                // If target is null, it means Backlog -> Clear sprints array
                if (!targetSprint) {
                    return { ...t, sprints: [], status: 'Backlog' };
                }

                // If moving to a sprint, Replace the sprint list? 
                // For "Sprint Tetris" prototype, dragging usually implies "It is NOW in this sprint".
                // Multi-select is tricky with simple DnD. Let's assume DnD = "Move to this sprint exclusive".
                // If user wants multi-select, they might need a different UI interaction later.
                return {
                    ...t,
                    sprints: [targetSprint],
                    status: 'To Do' // Reset status when moving to plain sprint? Or keep it? Let's keep status if possible, or default to To Do.
                };
            })
        };
    }),

    updateSprintCapacity: (sprintName, capacity) => set((state) => ({
        sprints: state.sprints.map(s =>
            s.name === sprintName ? { ...s, capacity } : s
        )
    })),
}));
