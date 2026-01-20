import { act, renderHook } from '@testing-library/react';
import { useBoardStore } from './boardStore';

describe('boardStore', () => {
    beforeEach(() => {
        // Reset store before each test
        const { result } = renderHook(() => useBoardStore());
        act(() => {
            useBoardStore.setState({
                tasks: [
                    { id: '1', title: 'Task 1', assignee: 'Alice', points: 5, status: 'To Do', sprint: 'Sprint 1', color: 'bg-red-500' }
                ],
                sprints: [
                    { name: 'Sprint 1', capacity: 20, assigneeCapacities: {} },
                    { name: 'Sprint 2', capacity: 20, assigneeCapacities: {} }
                ],
                pendingChanges: []
            });
        });
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useBoardStore());
        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.sprints).toHaveLength(2);
        expect(result.current.pendingChanges).toHaveLength(0);
    });

    it('should update task and log changes', () => {
        const { result } = renderHook(() => useBoardStore());

        act(() => {
            result.current.updateTask('1', { status: 'Done', points: 8 });
        });

        // Check task update
        expect(result.current.tasks[0].status).toBe('Done');
        expect(result.current.tasks[0].points).toBe(8);

        // Check pending changes log
        expect(result.current.pendingChanges).toHaveLength(2);

        const statusChange = result.current.pendingChanges.find(c => c.field === 'status');
        expect(statusChange).toBeDefined();
        expect(statusChange?.oldValue).toBe('To Do');
        expect(statusChange?.newValue).toBe('Done');

        const pointsChange = result.current.pendingChanges.find(c => c.field === 'points');
        expect(pointsChange).toBeDefined();
        expect(pointsChange?.oldValue).toBe(5);
        expect(pointsChange?.newValue).toBe(8);
    });

    it('should move task and log changes', () => {
        const { result } = renderHook(() => useBoardStore());

        act(() => {
            result.current.moveTask('1', 'Sprint 2');
        });

        // Check task move
        expect(result.current.tasks[0].sprint).toBe('Sprint 2');

        // Check pending changes log
        expect(result.current.pendingChanges).toHaveLength(1);
        expect(result.current.pendingChanges[0].field).toBe('sprint');
        expect(result.current.pendingChanges[0].oldValue).toBe('Sprint 1');
        expect(result.current.pendingChanges[0].newValue).toBe('Sprint 2');
    });

    it('should handle missing pendingChanges in state (hydration fix)', () => {
        const { result } = renderHook(() => useBoardStore());

        // Simulate broken state (e.g. from hydration)
        act(() => {
            useBoardStore.setState({ pendingChanges: undefined } as any);
        });

        act(() => {
            result.current.updateTask('1', { title: 'New Title' });
        });

        // Should not crash and should initialize array
        expect(result.current.tasks[0].title).toBe('New Title');
        expect(result.current.pendingChanges).toHaveLength(1);
        expect(result.current.pendingChanges[0].newValue).toBe('New Title');
    });

    it('should NOT log changes if values are identical', () => {
        const { result } = renderHook(() => useBoardStore());

        act(() => {
            // "Task 1" is already 5 points and status "To Do"
            result.current.updateTask('1', { points: 5, status: 'To Do' });
        });

        expect(result.current.pendingChanges).toHaveLength(0);
    });

    it('should NOT log changes to "color" field', () => {
        const { result } = renderHook(() => useBoardStore());

        act(() => {
            result.current.updateTask('1', { color: 'bg-blue-500' });
        });

        // Should change state but NOT log it
        expect(result.current.tasks[0].color).toBe('bg-blue-500');
        expect(result.current.pendingChanges).toHaveLength(0);
    });

    it('should undo a change', () => {
        const { result } = renderHook(() => useBoardStore());

        // Make a change
        act(() => {
            result.current.updateTask('1', { points: 8 });
        });

        expect(result.current.tasks[0].points).toBe(8);
        expect(result.current.pendingChanges).toHaveLength(1);
        const changeId = result.current.pendingChanges[0].id;

        // Undo it
        act(() => {
            result.current.undoChange(changeId);
        });

        // Checks
        expect(result.current.tasks[0].points).toBe(5); // Back to original
        expect(result.current.pendingChanges).toHaveLength(0); // Log cleared
    });

    it('should clear pending changes', () => {
        const { result } = renderHook(() => useBoardStore());

        act(() => {
            result.current.updateTask('1', { status: 'Done' });
        });

        expect(result.current.pendingChanges).toHaveLength(1);

        act(() => {
            result.current.clearPendingChanges();
        });

        expect(result.current.pendingChanges).toHaveLength(0);
    });
});
