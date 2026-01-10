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

                // If target is null, it means Backlog
                if (!targetSprint) {
                    return { ...t, sprint: null, status: 'Backlog' };
                }

                // Move to new sprint
                return {
                    ...t,
                    sprint: targetSprint,
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
