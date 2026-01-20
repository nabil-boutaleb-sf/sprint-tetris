import { batchUpdateTasks } from './asana';
import { PendingChange } from '@/types';

// Mock fetch
global.fetch = jest.fn();

describe('batchUpdateTasks', () => {
    const mockToken = 'test-token';
    const mockProjectGid = 'project-1';

    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('does nothing if no changes', async () => {
        await batchUpdateTasks(mockToken, [], mockProjectGid);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('fetches metadata and creates a task', async () => {
        // Mock Metadata Response
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [{ name: 'Backlog', gid: 'section-backlog' }] })
            }) // Sections
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: [
                        { custom_field: { name: 'Sprints', gid: 'cf-sprints', enum_options: [{ name: 'Sprint 1', gid: 'enum-s1' }] } },
                        { custom_field: { name: 'Datapoints', gid: 'cf-points' } }
                    ]
                })
            }) // Custom Fields
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { gid: 'new-task-gid' } })
            }) // Create Task
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: {} })
            }); // Move to Section

        const changes: PendingChange[] = [
            { id: '1', taskId: 'temp-1', taskTitle: 'New Task', field: 'created', oldValue: null, newValue: 'created', timestamp: 1 },
            { id: '2', taskId: 'temp-1', taskTitle: 'New Task', field: 'points', oldValue: 0, newValue: 3, timestamp: 2 }
        ];

        await batchUpdateTasks(mockToken, changes, mockProjectGid);

        expect(global.fetch).toHaveBeenCalledTimes(4);

        // precise verification of fetch calls
        const createCall = (global.fetch as jest.Mock).mock.calls[2];
        expect(createCall[0]).toContain('/tasks');
        expect(createCall[1].method).toBe('POST');
        const body = JSON.parse(createCall[1].body);
        expect(body.data.name).toBe('New Task');
        expect(body.data.custom_fields['cf-points']).toBe(3);
    });

    it('updates existing task', async () => {
        // Mock Metadata Response
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ custom_field: { name: 'Datapoints', gid: 'cf-points' } }] }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: {} }) }); // Update Task

        const changes: PendingChange[] = [
            { id: '1', taskId: 'task-1', taskTitle: 'Task 1', field: 'points', oldValue: 1, newValue: 5, timestamp: 1 }
        ];

        await batchUpdateTasks(mockToken, changes, mockProjectGid);

        expect(global.fetch).toHaveBeenCalledTimes(3);
        const updateCall = (global.fetch as jest.Mock).mock.calls[2];
        expect(updateCall[0]).toContain('/tasks/task-1');
        expect(updateCall[1].method).toBe('PUT');
        const body = JSON.parse(updateCall[1].body);
        expect(body.data.custom_fields['cf-points']).toBe(5);
    });
});
