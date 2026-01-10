import { create } from 'zustand';
import { Task, SprintName } from '@/types';
import { MOCK_TASKS, SPRINTS } from '@/data/mockData';

interface Sprint {
    name: string;
    capacity: number;
    assigneeCapacities: Record<string, number>;
}

// ... in mockData or store init (updating store logic first)
// Moving on to actions ...


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
    updateAssigneeCapacity: (sprintName: string, assignee: string, capacity: number) => void;
    addSprint: (name: string, capacity: number) => void;
    deleteSprint: (name: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
    // ... initial state needs to be mapped correctly with new interface
    // See separate step for data update

    // ...

    updateAssigneeCapacity: (sprintName, assignee, capacity) => set((state) => ({
        sprints: state.sprints.map(s => {
            if (s.name !== sprintName) return s;
            const newCapacities = { ...s.assigneeCapacities, [assignee]: capacity };
            // Optional: Auto-update total capacity? 
            // The user said "sum should add up to sprint's capacity" -> implies validation or auto-sum.
            // Let's simple sum it for now to keep them in sync.
            const newTotal = Object.values(newCapacities).reduce((a, b) => a + b, 0);
            return {
                ...s,
                capacity: newTotal > s.capacity ? newTotal : s.capacity, // Auto-expand if individual sums exceed total
                assigneeCapacities: newCapacities
            };
        })
    })),

    tasks: MOCK_TASKS,
    sprints: SPRINTS.map(s => ({ ...s, assigneeCapacities: {} })), // Initialize empty map for existing mock data
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

    // New Sprint Management Actions
    addSprint: (name, capacity) => set((state) => {
        if (state.sprints.some(s => s.name === name)) return state; // Prevent duplicates
        return { sprints: [...state.sprints, { name, capacity, assigneeCapacities: {} }] };
    }),

    deleteSprint: (name) => set((state) => ({
        sprints: state.sprints.filter(s => s.name !== name),
        // Optional: Move tasks from deleted sprint to Backlog?
        tasks: state.tasks.map(t => t.sprint === name ? { ...t, sprint: null, status: 'Backlog' } : t)
    })),
}));
