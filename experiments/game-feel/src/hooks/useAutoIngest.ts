'use client';

import { useEffect, useRef, useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { fetchAsanaData } from '@/lib/asana';

export const useAutoIngest = () => {
    const { importData, isDemoMode, setDemoMode } = useBoardStore();
    const hasAttemptedRef = useRef(false);
    const [isIngesting, setIsIngesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (hasAttemptedRef.current || !isDemoMode) return;

        // Check localStorage for credentials
        const token = localStorage.getItem('asana_token');
        const gid = localStorage.getItem('asana_project_gid');

        if (token && gid) {
            hasAttemptedRef.current = true;
            setIsIngesting(true);

            // Optional fields
            const sprintField = localStorage.getItem('asana_sprint_field_id');
            const pointsField = localStorage.getItem('asana_points_field_id');

            fetchAsanaData(token, gid, sprintField || null, pointsField || null)
                .then(data => {
                    importData(data.sprints, data.tasks);
                    // isDemoMode is set to false by importData, but ensuring clarity
                })
                .catch(err => {
                    console.error("Auto-ingest failed:", err);
                    setError(err instanceof Error ? err.message : 'Auto-ingest failed');
                })
                .finally(() => {
                    setIsIngesting(false);
                });
        }
    }, [isDemoMode, importData]); // Dependencies

    return { isIngesting, error };
};
