'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { fetchAsanaData } from '@/lib/asana';

export const useDataSync = () => {
    const { importData } = useBoardStore();
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshData = async () => {
        setIsSyncing(true);
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
            console.error("Manual sync failed:", err);
            setError(err instanceof Error ? err.message : 'Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    return { refreshData, isSyncing, error };
};
