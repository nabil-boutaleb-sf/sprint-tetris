import { renderHook, act } from '@testing-library/react';
import { useDataSync } from './useDataSync';
import { useBoardStore } from '@/store/boardStore';
import { fetchAsanaData } from '@/lib/asana';

// Mock dependencies
jest.mock('@/store/boardStore');
jest.mock('@/lib/asana');

describe('useDataSync', () => {
    const mockImportData = jest.fn();
    const mockSyncChanges = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useBoardStore as unknown as jest.Mock).mockReturnValue({
            importData: mockImportData,
            syncChanges: mockSyncChanges,
        });

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(),
            },
            writable: true
        });
    });

    describe('refreshData', () => {
        it('should fetch and import data when credentials exist', async () => {
            (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
                if (key === 'asana_token') return 'mock-token';
                if (key === 'asana_project_gid') return 'mock-gid';
                return null;
            });

            const mockData = { sprints: [], tasks: [] };
            (fetchAsanaData as jest.Mock).mockResolvedValue(mockData);

            const { result } = renderHook(() => useDataSync());

            await act(async () => {
                await result.current.refreshData();
            });

            expect(result.current.isRefreshing).toBe(false);
            expect(fetchAsanaData).toHaveBeenCalledWith('mock-token', 'mock-gid', null, null);
            expect(mockImportData).toHaveBeenCalledWith(mockData.sprints, mockData.tasks);
            expect(result.current.error).toBeNull();
        });

        it('should do nothing if no credentials', async () => {
            (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

            const { result } = renderHook(() => useDataSync());

            await act(async () => {
                await result.current.refreshData();
            });

            expect(fetchAsanaData).not.toHaveBeenCalled();
            expect(mockImportData).not.toHaveBeenCalled();
        });

        it('should handle errors during refresh', async () => {
            (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-value');
            (fetchAsanaData as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

            const { result } = renderHook(() => useDataSync());

            await act(async () => {
                await result.current.refreshData();
            });

            expect(result.current.isRefreshing).toBe(false);
            expect(result.current.error).toBe('Fetch failed');
            expect(mockImportData).not.toHaveBeenCalled();
        });
    });

    describe('pushChanges', () => {
        it('should sync changes and then refresh data', async () => {
            (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
                if (key === 'asana_token') return 'mock-token';
                if (key === 'asana_project_gid') return 'mock-gid';
                return null;
            });

            (fetchAsanaData as jest.Mock).mockResolvedValue({ sprints: [], tasks: [] });
            mockSyncChanges.mockResolvedValue(undefined); // Success

            const { result } = renderHook(() => useDataSync());

            await act(async () => {
                await result.current.pushChanges();
            });

            expect(mockSyncChanges).toHaveBeenCalledWith('mock-token', 'mock-gid');
            // Should verify that refreshData was called (which calls fetchAsanaData)
            expect(fetchAsanaData).toHaveBeenCalled();
            expect(result.current.error).toBeNull();
        });

        it('should throw error if no credentials', async () => {
            (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

            const { result } = renderHook(() => useDataSync());

            await act(async () => {
                await expect(result.current.pushChanges())
                    .rejects
                    .toThrow('Missing credentials');
            });

            expect(mockSyncChanges).not.toHaveBeenCalled();
        });

        it('should handle errors during sync', async () => {
            (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-value');
            mockSyncChanges.mockRejectedValue(new Error('Sync failed'));

            const { result } = renderHook(() => useDataSync());

            await act(async () => {
                await expect(result.current.pushChanges())
                    .rejects
                    .toThrow('Sync failed');
            });

            expect(result.current.error).toBe('Sync failed');
        });
    });
});
