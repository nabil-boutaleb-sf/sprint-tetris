import { render, screen, fireEvent } from '@testing-library/react';
import Board from './Board';
import { useBoardStore } from '@/store/boardStore';
import { useDataSync } from '@/hooks/useDataSync';

// Mock dependencies
jest.mock('@/store/boardStore');
jest.mock('@/hooks/useDataSync');

// Mock child components that are complex or not the focus
jest.mock('./DroppableSprintColumn', () => ({
    DroppableSprintColumn: ({ name, tasks }: any) => (
        <div data-testid={`sprint-${name}`}>
            <h2>{name}</h2>
            {tasks.map((t: any) => <div key={t.id}>{t.title}</div>)}
        </div>
    )
}));

jest.mock('./BacklogArea', () => ({
    BacklogArea: ({ tasks }: any) => (
        <div data-testid="backlog-area">
            {tasks.map((t: any) => <div key={t.id}>{t.title}</div>)}
        </div>
    )
}));

describe('Board Integration', () => {
    const mockRefreshData = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock hooks
        (useDataSync as jest.Mock).mockReturnValue({
            refreshData: mockRefreshData,
            isRefreshing: false
        });

        // Mock store with realistic data
        (useBoardStore as unknown as jest.Mock).mockReturnValue({
            tasks: [
                { id: '1', title: 'Task 1', sprint: 'Sprint 1', assignee: 'Alice', points: 5 },
                { id: '2', title: 'Backlog Task', sprint: null, assignee: 'Bob', points: 3 }
            ],
            sprints: [
                { name: 'Sprint 1', capacity: 20 },
                { name: 'Sprint 2', capacity: 20 }
            ],
            pendingChanges: [],
            isDemoMode: true,
            filterAssignee: null,

            // Mock Actions
            setFilterAssignee: jest.fn(),
            moveTask: jest.fn(),
        });
    });

    it('renders the board with sprints and backlog', () => {
        render(<Board />);

        // Check Header
        expect(screen.getByText('Sprint Tetris')).toBeInTheDocument();

        // Check Sprints (via mocked components)
        expect(screen.getByTestId('sprint-Sprint 1')).toBeInTheDocument();
        expect(screen.getByTestId('sprint-Sprint 2')).toBeInTheDocument();

        // Check Backlog
        expect(screen.getByTestId('backlog-area')).toBeInTheDocument();

        // Check tasks are distributed correctly
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Backlog Task')).toBeInTheDocument();
    });

    it('shows pending changes indicator', () => {
        (useBoardStore as unknown as jest.Mock).mockReturnValue({
            ...useBoardStore(),
            pendingChanges: [{ id: '1', taskId: '1', field: 'status' }]
        });

        render(<Board />);

        // Look for the indicator dot (it's a span with bg-orange-500)
        // Since it's purely visual CSS, we might look for the button containing it
        const historyBtn = screen.getByTitle('View Pending Changes');
        expect(historyBtn.querySelector('.bg-orange-500')).toBeInTheDocument();
    });

    it('calls refreshData when refresh button is clicked', () => {
        render(<Board />);

        const refreshBtn = screen.getByTitle('Refresh Data from Asana');
        fireEvent.click(refreshBtn);

        expect(mockRefreshData).toHaveBeenCalled();
    });
});
