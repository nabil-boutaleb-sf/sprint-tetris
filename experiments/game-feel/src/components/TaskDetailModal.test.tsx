import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDetailModal } from './TaskDetailModal';
import { useBoardStore } from '@/store/boardStore';
import { Task } from '@/types';

// Mock dependencies
jest.mock('@/store/boardStore');
jest.mock('@/lib/uiUtils', () => ({
    getAssigneeColorClass: jest.fn(() => 'bg-mock-color'),
}));

const mockUpdateTask = jest.fn();
const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', assignee: 'Alice', points: 5, status: 'To Do', sprint: 'Sprint 1', color: 'bg-red-500' },
    { id: '2', title: 'Task 2', assignee: 'Bob', points: 3, status: 'In Progress', sprint: 'Sprint 1', color: 'bg-blue-500' },
];
const mockSprints = [{ name: 'Sprint 1', capacity: 20, assigneeCapacities: {} }, { name: 'Sprint 2', capacity: 20, assigneeCapacities: {} }];

describe('TaskDetailModal', () => {
    beforeEach(() => {
        (useBoardStore as unknown as jest.Mock).mockReturnValue({
            updateTask: mockUpdateTask,
            tasks: mockTasks,
            sprints: mockSprints,
        });
        mockUpdateTask.mockClear();
    });

    const mockTask: Task = {
        id: '1',
        title: 'Test Task',
        points: 5,
        status: 'To Do',
        assignee: 'Alice',
        sprint: 'Sprint 1',
        color: 'bg-red-500',
        description: '<p>Test Description</p>',
        permalink_url: 'https://app.asana.com/0/123/456'
    };

    it('renders task details correctly', () => {
        render(<TaskDetailModal task={mockTask} onClose={jest.fn()} />);

        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
        expect(screen.getByDisplayValue('5')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Sprint 1')).toBeInTheDocument();
        // Check for textarea value (raw HTML string since we just load it)
        expect(screen.getByDisplayValue('<p>Test Description</p>')).toBeInTheDocument();

        const link = screen.getByText('Open in Asana').closest('a');
        expect(link).toHaveAttribute('href', 'https://app.asana.com/0/123/456');
    });

    it('does not render Asana link when permalink_url is missing', () => {
        const taskWithoutLink = { ...mockTask, permalink_url: undefined };
        render(<TaskDetailModal task={taskWithoutLink} onClose={jest.fn()} />);

        const link = screen.queryByText('Open in Asana');
        expect(link).toBeNull();
    });

    it('renders empty textarea when description is missing', () => {
        const taskWithoutDesc = { ...mockTask, description: undefined };
        render(<TaskDetailModal task={taskWithoutDesc} onClose={jest.fn()} />);

        const textarea = screen.getByPlaceholderText('Add a description...');
        expect(textarea).toHaveValue('');
    });

    it('calls updateTask with changes when saved', () => {
        const onClose = jest.fn();
        render(<TaskDetailModal task={mockTask} onClose={onClose} />);

        // Change Title
        fireEvent.change(screen.getByDisplayValue('Test Task'), { target: { value: 'Updated Title' } });

        // Change Points
        fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '8' } });

        // Change Description
        fireEvent.change(screen.getByDisplayValue('<p>Test Description</p>'), { target: { value: 'Updated Description' } });

        // Save
        fireEvent.click(screen.getByText('Save Changes'));

        expect(mockUpdateTask).toHaveBeenCalledWith('1', expect.objectContaining({
            title: 'Updated Title',
            points: 8,
            description: 'Updated Description'
        }));
        expect(onClose).toHaveBeenCalled();
    });

    it('does not render when task is null', () => {
        const { container } = render(<TaskDetailModal task={null} onClose={jest.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });
});
