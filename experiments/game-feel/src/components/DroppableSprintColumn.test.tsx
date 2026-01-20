import { render, screen, fireEvent } from '@testing-library/react';
import { DroppableSprintColumn } from './DroppableSprintColumn';
import { useBoardStore } from '@/store/boardStore';
import { Task } from '@/types';

// Mock dependencies
jest.mock('@/store/boardStore');
jest.mock('@dnd-kit/core', () => ({
    useDroppable: () => ({
        setNodeRef: jest.fn(),
        isOver: false,
    }),
}));

// Mock minimal UiUtils
jest.mock('@/lib/uiUtils', () => ({
    calculateVisualHeight: jest.fn(() => 56),
}));

// Mock sub-components to reduce noise
jest.mock('./DraggableTask', () => ({
    DraggableTask: ({ task }: { task: Task }) => <div data-testid={`task-${task.id}`}>{task.title} ({task.points}pts)</div>,
}));

describe('DroppableSprintColumn', () => {
    const mockUpdateSprintCapacity = jest.fn();
    const mockUpdateAssigneeCapacity = jest.fn();

    // Default mock return
    const mockUseBoardStore = useBoardStore as unknown as jest.Mock;

    const mockTasks: Task[] = [
        { id: '1', title: 'Task 1', assignee: 'Alice', points: 5, status: 'To Do', sprint: 'Sprint 1' },
        { id: '2', title: 'Task 2', assignee: 'Bob', points: 3, status: 'To Do', sprint: 'Sprint 1' },
    ];

    const mockSprint = {
        name: 'Sprint 1',
        capacity: 20, // Global
        assigneeCapacities: {
            'Alice': 10,
            'Bob': 5
        }
    };

    beforeEach(() => {
        mockUseBoardStore.mockReturnValue({
            sprints: [mockSprint],
            updateSprintCapacity: mockUpdateSprintCapacity,
            updateAssigneeCapacity: mockUpdateAssigneeCapacity,
            filterAssignee: null, // Unfiltered by default
        });
        mockUpdateSprintCapacity.mockClear();
        mockUpdateAssigneeCapacity.mockClear();
    });

    it('renders global capacity when unfiltered', () => {
        render(<DroppableSprintColumn name="Sprint 1" tasks={mockTasks} onTaskClick={jest.fn()} />);

        // Total points = 5 + 3 = 8
        // QA Buffer = 2 * 0.5 = 1.0
        // Effective Load = 9.0

        // Check for Effective Load Display (9)
        expect(screen.getByText('9')).toBeInTheDocument();

        // Check for Capacity Input (Initial value matches global capacity 20)
        expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    });

    it('renders assignee capacity when filtered', () => {
        // Filter by Alice
        mockUseBoardStore.mockReturnValue({
            sprints: [mockSprint],
            updateSprintCapacity: mockUpdateSprintCapacity,
            updateAssigneeCapacity: mockUpdateAssigneeCapacity,
            filterAssignee: 'Alice',
        });

        // In filtered view, 'tasks' prop would usually only contain Alice's tasks, 
        // but for this unit test of the DISPLAY logic, we can pass whatever.
        // Let's pass only Alice's task to simulate real usage.
        const aliceTasks = [mockTasks[0]];

        render(<DroppableSprintColumn name="Sprint 1" tasks={aliceTasks} onTaskClick={jest.fn()} />);

        // Alice Load: 5 pts + 0.5 buffer = 5.5
        expect(screen.getByText('5.5')).toBeInTheDocument();

        // Alice Capacity: 10
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument(); // Tag verification
    });

    it('updates global capacity when unfiltered', () => {
        render(<DroppableSprintColumn name="Sprint 1" tasks={mockTasks} onTaskClick={jest.fn()} />);

        const input = screen.getByDisplayValue('20');
        fireEvent.change(input, { target: { value: '25' } });
        fireEvent.blur(input);

        expect(mockUpdateSprintCapacity).toHaveBeenCalledWith('Sprint 1', 25);
        expect(mockUpdateAssigneeCapacity).not.toHaveBeenCalled();
    });

    it('updates assignee capacity when filtered', () => {
        mockUseBoardStore.mockReturnValue({
            sprints: [mockSprint],
            updateSprintCapacity: mockUpdateSprintCapacity,
            updateAssigneeCapacity: mockUpdateAssigneeCapacity,
            filterAssignee: 'Alice',
        });

        render(<DroppableSprintColumn name="Sprint 1" tasks={[mockTasks[0]]} onTaskClick={jest.fn()} />);

        const input = screen.getByDisplayValue('10'); // Alice's current cap
        fireEvent.change(input, { target: { value: '12' } });
        fireEvent.blur(input);

        expect(mockUpdateAssigneeCapacity).toHaveBeenCalledWith('Sprint 1', 'Alice', 12);
        expect(mockUpdateSprintCapacity).not.toHaveBeenCalled();
    });

    it('displays individual overage warnings in unfiltered view', () => {
        // Alice: 5.5 load / 10 cap (OK)
        // Bob: 3 pts + 0.5 = 3.5 load / 5 cap (OK)
        // Let's overload Bob. 
        // 3 tasks for Bob: (3+3+3) + (0.5*3) = 10.5 load. Cap is 5.
        const overloadedTasks = [
            { id: '1', title: 'Task 1', assignee: 'Alice', points: 5, status: 'To Do', sprint: 'Sprint 1' },
            { id: '2', title: 'Task 2', assignee: 'Bob', points: 3, status: 'To Do', sprint: 'Sprint 1' },
            { id: '3', title: 'Task 3', assignee: 'Bob', points: 3, status: 'To Do', sprint: 'Sprint 1' },
            { id: '4', title: 'Task 4', assignee: 'Bob', points: 3, status: 'To Do', sprint: 'Sprint 1' },
        ];

        render(<DroppableSprintColumn name="Sprint 1" tasks={overloadedTasks} onTaskClick={jest.fn()} />);

        // Should see warning for Bob
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('10.5/5')).toBeInTheDocument(); // Load/Cap
    });
});
