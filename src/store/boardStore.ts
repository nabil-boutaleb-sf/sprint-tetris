import { create } from 'zustand';
import { Task, SprintName, Sprint } from '@/types';
import { MOCK_TASKS, SPRINTS } from '@/data/mockData';

interface BoardState {
    tasks: Task[];
    sprints: Sprint[];
    isBacklogOpen: boolean;
    filterAssignee: string | null;
    isDemoMode: boolean;

    // Actions
    importData: (sprints: Sprint[], tasks: Task[]) => void;
    setDemoMode: (isDemo: boolean) => void;
    toggleBacklog: () => void;
    setFilterAssignee: (assignee: string | null) => void;
    moveTask: (taskId: string, targetSprint: SprintName | null) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    updateSprintCapacity: (sprintName: string, capacity: number) => void;
    updateAssigneeCapacity: (sprintName: string, assignee: string, capacity: number) => void;
    addSprint: (name: string, capacity: number) => void;
    deleteSprint: (name: string) => void;
}

import { persist } from 'zustand/middleware';

export const useBoardStore = create<BoardState>()(
    persist(
        (set) => ({
            tasks: MOCK_TASKS,
            sprints: SPRINTS.map(s => ({ ...s, assigneeCapacities: {} })),
            isBacklogOpen: true,
            filterAssignee: null,
            isDemoMode: true,

            importData: (sprints, tasks) => set({ sprints, tasks, isDemoMode: false }),
            setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),

            toggleBacklog: () => set((state) => ({ isBacklogOpen: !state.isBacklogOpen })),
            setFilterAssignee: (filterAssignee) => set({ filterAssignee }),

            moveTask: (taskId, targetSprint) => set((state) => {
                return {
                    tasks: state.tasks.map((t) => {
                        if (t.id !== taskId) return t;
                        if (!targetSprint) {
                            return { ...t, sprint: null, status: 'Backlog' };
                        }
                        return { ...t, sprint: targetSprint };
                    })
                };
            }),

            updateTask: (taskId, updates) => set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
            })),

            updateSprintCapacity: (sprintName, capacity) => set((state) => ({
                sprints: state.sprints.map(s =>
                    s.name === sprintName ? { ...s, capacity } : s
                )
            })),

            updateAssigneeCapacity: (sprintName, assignee, capacity) => set((state) => ({
                sprints: state.sprints.map(s => {
                    if (s.name !== sprintName) return s;
                    const newCapacities = { ...s.assigneeCapacities, [assignee]: capacity };
                    const newTotal = Object.values(newCapacities).reduce((a, b) => a + b, 0);
                    return {
                        ...s,
                        capacity: newTotal > s.capacity ? newTotal : s.capacity,
                        assigneeCapacities: newCapacities
                    };
                })
            })),

            addSprint: (name, capacity) => set((state) => {
                if (state.sprints.some(s => s.name === name)) return state;
                return { sprints: [...state.sprints, { name, capacity, assigneeCapacities: {} }] };
            }),

            deleteSprint: (name) => set((state) => ({
                sprints: state.sprints.filter(s => s.name !== name),
                tasks: state.tasks.map(t => t.sprint === name ? { ...t, sprint: null, status: 'Backlog' } : t)
            })),
        }),
        {
            name: 'board-storage', // unique name
            partialize: (state) => ({
                tasks: state.tasks,
                sprints: state.sprints,
                isDemoMode: state.isDemoMode,
                filterAssignee: state.filterAssignee
            }),
        }
    )
);
