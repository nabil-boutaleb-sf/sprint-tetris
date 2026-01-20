import { renderHook, waitFor } from '@testing-library/react';
import { useAutoIngest } from './useAutoIngest';
import { useBoardStore } from '@/store/boardStore';
import { fetchAsanaData } from '@/lib/asana';

// Mock dependencies
jest.mock('@/store/boardStore');
jest.mock('@/lib/asana');

describe('useAutoIngest', () => {
    const mockImportData = jest.fn();
    const mockSetDemoMode = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock store implementation
        (useBoardStore as unknown as jest.Mock).mockReturnValue({
            importData: mockImportData,
            setDemoMode: mockSetDemoMode,
            isDemoMode: true, // Default to true for testing ingest trigger
        });

        // Mock fetchAsanaData
        (fetchAsanaData as jest.Mock).mockResolvedValue({
            sprints: [],
            tasks: []
        });

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
            },
            writable: true
        });
    });

    it('should NOT ingest if isDemoMode is false', () => {
        (useBoardStore as unknown as jest.Mock).mockReturnValue({
            importData: mockImportData,
            setDemoMode: mockSetDemoMode,
            isDemoMode: false,
        });

        renderHook(() => useAutoIngest());

        expect(fetchAsanaData).not.toHaveBeenCalled();
    });

    it('should NOT ingest if no token/gid in localStorage', () => {
        (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

        renderHook(() => useAutoIngest());

        expect(fetchAsanaData).not.toHaveBeenCalled();
    });

    it('should ingest data if isDemoMode is true and credentials exist', async () => {
        // Setup local storage mocks
        (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === 'asana_token') return 'mock-token';
            if (key === 'asana_project_gid') return 'mock-gid';
            return null;
        });

        const mockData = {
            sprints: [{ name: 'Sprint 1', capacity: 10 }],
            tasks: [{ id: '1', title: 'Task 1' }]
        };
        (fetchAsanaData as jest.Mock).mockResolvedValue(mockData);

        const { result } = renderHook(() => useAutoIngest());

        // Check loading state
        expect(result.current.isIngesting).toBe(true);

        // Wait for async operation
        await waitFor(() => {
            expect(result.current.isIngesting).toBe(false);
        });

        expect(fetchAsanaData).toHaveBeenCalledWith('mock-token', 'mock-gid', null, null);
        expect(mockImportData).toHaveBeenCalledWith(mockData.sprints, mockData.tasks);
        expect(result.current.error).toBeNull();
    });

    it('should pass optional field IDs if present in localStorage', async () => {
        (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === 'asana_token') return 'mock-token';
            if (key === 'asana_project_gid') return 'mock-gid';
            if (key === 'asana_sprint_field_id') return 'sprint-field';
            if (key === 'asana_points_field_id') return 'points-field';
            return null;
        });

        renderHook(() => useAutoIngest());

        await waitFor(() => {
            expect(fetchAsanaData).toHaveBeenCalledWith('mock-token', 'mock-gid', 'sprint-field', 'points-field');
        });
    });

    it('should handle fetch errors', async () => {
        (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-value');
        const error = new Error('Network error');
        (fetchAsanaData as jest.Mock).mockRejectedValue(error);

        const { result } = renderHook(() => useAutoIngest());

        await waitFor(() => {
            expect(result.current.isIngesting).toBe(false);
        });

        expect(mockImportData).not.toHaveBeenCalled();
        expect(result.current.error).toBe('Network error');
    });
});
