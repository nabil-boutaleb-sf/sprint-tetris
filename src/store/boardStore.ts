import { create } from 'zustand';
import { batchUpdateTasks } from '@/lib/asana';
import { Task, SprintName, Sprint, PendingChange } from '@/types';
import { MOCK_TASKS, SPRINTS } from '@/data/mockData';

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
    isFunModeEnabled: boolean;
    pendingChanges: PendingChange[];
    isSyncing: boolean;

    // Actions
    importData: (sprints: Sprint[], tasks: Task[]) => void;
    setDemoMode: (isDemo: boolean) => void;
    toggleFunMode: () => void;
    toggleBacklog: () => void;
    setFilterAssignee: (assignee: string | null) => void;
    moveTask: (taskId: string, targetSprint: SprintName | null) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    updateSprintCapacity: (sprintName: string, capacity: number) => void;
    updateAssigneeCapacity: (sprintName: string, assignee: string, capacity: number) => void;
    addSprint: (name: string, capacity: number) => void;
    deleteSprint: (name: string) => void;
    addTask: (task: Task) => void;
    undoChange: (changeId: string) => void;
    clearPendingChanges: () => void;
    syncChanges: (token: string, projectGid: string) => Promise<void>;
}

import { persist } from 'zustand/middleware';

export const useBoardStore = create<BoardState>()(
    persist(
        (set, get) => ({
            tasks: MOCK_TASKS,
            sprints: SPRINTS.map(s => ({ ...s, assigneeCapacities: {} })),
            isBacklogOpen: true,
            filterAssignee: null,
            isDemoMode: true,
            isFunModeEnabled: false,
            pendingChanges: [],
            isSyncing: false,

            importData: (sprints, tasks) => set({ sprints, tasks, isDemoMode: false, pendingChanges: [] }),
            setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
            toggleFunMode: () => set((state) => ({ isFunModeEnabled: !state.isFunModeEnabled })),
            toggleBacklog: () => set((state) => ({ isBacklogOpen: !state.isBacklogOpen })),
            setFilterAssignee: (filterAssignee) => set({ filterAssignee }),

            moveTask: (taskId, targetSprint) => set((state) => {
                const task = state.tasks.find(t => t.id === taskId);
                if (!task) return state;

                // Ignore if no change
                const target = targetSprint || 'Backlog';
                const current = task.sprint || 'Backlog';
                if (target === current) return state;

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
                const task = state.tasks.find(t => t.id === taskId);
                if (!task) return state;

                const newChanges: PendingChange[] = [];

                Object.keys(updates).forEach(key => {
                    // Ignore color changes (ui only)
                    if (key === 'color') return;

                    const k = key as keyof Task;
                    const oldValue = task[k];
                    const newValue = updates[k];

                    // Strict equality check
                    if (oldValue === newValue) return;

                    newChanges.push({
                        id: generateId(),
                        taskId,
                        taskTitle: task.title,
                        field: key,
                        oldValue: oldValue,
                        newValue: newValue,
                        timestamp: Date.now()
                    });
                });

                if (newChanges.length === 0) {
                    return {
                        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
                    };
                }

                return {
                    pendingChanges: [...(state.pendingChanges || []), ...newChanges],
                    tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
                };
            }),

            addTask: (task) => set((state) => {
                // Ensure new tasks are in Backlog by default if not specified
                const newTask = { ...task, status: task.status || 'Backlog', sprint: task.sprint || null };

                // Log creation as a pending change (optional, but good for consistency)
                const change: PendingChange = {
                    id: generateId(),
                    taskId: newTask.id,
                    taskTitle: newTask.title,
                    field: 'created',
                    oldValue: null,
                    newValue: 'created',
                    timestamp: Date.now()
                };

                return {
                    tasks: [...state.tasks, newTask],
                    pendingChanges: [...(state.pendingChanges || []), change]
                };
            }),

            undoChange: (changeId) => set((state) => {
                const change = state.pendingChanges.find(c => c.id === changeId);
                if (!change) return state;

                // Revert the change on the task
                const revertedTasks = state.tasks.map(t => {
                    if (t.id !== change.taskId) return t;
                    // For sprint changes, we need to handle the backlog status logic if verified
                    let update = { [change.field]: change.oldValue };

                    // Special handling if reverting a sprint move
                    if (change.field === 'sprint') {
                        if (!change.oldValue) {
                            update = { sprint: null, status: 'Backlog' };
                        } else {
                            update = { sprint: change.oldValue };
                        }
                    }

                    return { ...t, ...update };
                });

                // Remove from pending changes
                return {
                    tasks: revertedTasks,
                    pendingChanges: state.pendingChanges.filter(c => c.id !== changeId)
                };
            }),

            clearPendingChanges: () => set({ pendingChanges: [] }),

            syncChanges: async (token, projectGid) => {
                const { pendingChanges } = get();
                if (pendingChanges.length === 0) return;

                set({ isSyncing: true });
                try {
                    await batchUpdateTasks(token, pendingChanges, projectGid);
                    set({ pendingChanges: [], isSyncing: false });
                } catch (error) {
                    console.error("Sync failed:", error);
                    set({ isSyncing: false });
                    throw error; // Re-throw to let UI handle toast
                }
            },

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
                isFunModeEnabled: state.isFunModeEnabled,
                filterAssignee: state.filterAssignee,
                pendingChanges: state.pendingChanges
            }),
        }
    )
);
