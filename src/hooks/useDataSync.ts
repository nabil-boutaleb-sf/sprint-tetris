'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { fetchAsanaData } from '@/lib/asana';

export const useDataSync = () => {
    const { importData, syncChanges } = useBoardStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshData = async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            // Check localStorage for credentials
            const token = localStorage.getItem('asana_token');
            const gid = localStorage.getItem('asana_project_gid');

            if (!token || !gid) {
                // If no credentials, we can't sync. 
                // Currently silent, or we could throw an error if this was user-initiated.
                return;
            }

            // Optional fields
            const sprintField = localStorage.getItem('asana_sprint_field_id');
            const pointsField = localStorage.getItem('asana_points_field_id');

            const data = await fetchAsanaData(token, gid, sprintField || null, pointsField || null);
            importData(data.sprints, data.tasks);

        } catch (err) {
            console.error("Manual refresh failed:", err);
            setError(err instanceof Error ? err.message : 'Refresh failed');
        } finally {
            setIsRefreshing(false);
        }
    };

    const pushChanges = async () => {
        setError(null);
        try {
            const token = localStorage.getItem('asana_token');
            const gid = localStorage.getItem('asana_project_gid');
            if (!token || !gid) throw new Error("Missing credentials");

            await syncChanges(token, gid);

            // Auto-refresh after sync to get latest state (e.g. correct IDs for new tasks)
            await refreshData();
        } catch (err) {
            console.error("Push failed:", err);
            setError(err instanceof Error ? err.message : 'Sync failed');
            throw err;
        }
    };

    return { refreshData, pushChanges, isRefreshing, error };
};
