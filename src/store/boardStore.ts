import { create } from 'zustand';
import { Task, SprintName, Sprint } from '@/types';
import { MOCK_TASKS, SPRINTS } from '@/data/mockData';

export interface PendingChange {
    id: string;
    taskId: string;
    taskTitle: string;
    field: string;
    oldValue: any;
    newValue: any;
    timestamp: number;
}

// Simple UUID generator that works in non-secure contexts (http)
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface BoardState {
    tasks: Task[];
    sprints: Sprint[];
    isBacklogOpen: boolean;
    filterAssignee: string | null;
    isDemoMode: boolean;
    pendingChanges: PendingChange[];

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
    clearPendingChanges: () => void;
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

            pendingChanges: [],

            importData: (sprints, tasks) => set({ sprints, tasks, isDemoMode: false, pendingChanges: [] }),
            setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),

            toggleBacklog: () => set((state) => ({ isBacklogOpen: !state.isBacklogOpen })),
            setFilterAssignee: (filterAssignee) => set({ filterAssignee }),

            moveTask: (taskId, targetSprint) => set((state) => {
                // Log for debugging
                console.log(`[BoardStore] Moving task ${taskId} to ${targetSprint}`);

                const task = state.tasks.find(t => t.id === taskId);
                if (!task) {
                    console.error(`[BoardStore] Task ${taskId} not found!`);
                    return state;
                }

                // Log the move
                const change: PendingChange = {
                    id: generateId(),
                    taskId,
                    taskTitle: task.title,
                    field: 'sprint',
                    oldValue: task.sprint,
                    newValue: targetSprint || 'Backlog',
                    timestamp: Date.now()
                };

                return {
                    pendingChanges: [...(state.pendingChanges || []), change],
                    tasks: state.tasks.map((t) => {
                        if (t.id !== taskId) return t;
                        if (!targetSprint) {
                            return { ...t, sprint: null, status: 'Backlog' };
                        }
                        return { ...t, sprint: targetSprint };
                    })
                };
            }),

            updateTask: (taskId, updates) => set((state) => {
                console.log(`[BoardStore] Updating task ${taskId}`, updates);

                const task = state.tasks.find(t => t.id === taskId);
                if (!task) {
                    console.error(`[BoardStore] Task ${taskId} not found!`);
                    return state;
                }

                const newChanges: PendingChange[] = Object.keys(updates).map(key => ({
                    id: generateId(),
                    taskId,
                    taskTitle: task.title,
                    field: key,
                    oldValue: (task as any)[key],
                    newValue: (updates as any)[key],
                    timestamp: Date.now()
                }));

                return {
                    pendingChanges: [...(state.pendingChanges || []), ...newChanges],
                    tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
                };
            }),

            clearPendingChanges: () => set({ pendingChanges: [] }),

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
                filterAssignee: state.filterAssignee,
                pendingChanges: state.pendingChanges
            }),
        }
    )
);
