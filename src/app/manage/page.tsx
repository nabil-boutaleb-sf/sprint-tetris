'use client';

import { useBoardStore } from '@/store/boardStore';
import { fetchAsanaData } from '@/lib/asana';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import ThemeToggle from '@/components/ThemeToggle';

export default function ManagePage() {
    const { sprints, tasks, addSprint, deleteSprint, updateSprintCapacity, updateAssigneeCapacity, importData, isDemoMode } = useBoardStore();

    const allAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[];

    const [newSprintName, setNewSprintName] = useState('');
    const [newSprintCapacity, setNewSprintCapacity] = useState(20);

    // Asana Ingestion State
    const [asanaToken, setAsanaToken] = useState('');
    const [projectGid, setProjectGid] = useState('');
    const [sprintFieldId, setSprintFieldId] = useState('');
    const [pointsFieldId, setPointsFieldId] = useState('');

    // Load from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('asana_token');
        const storedGid = localStorage.getItem('asana_project_gid');
        const storedSprintField = localStorage.getItem('asana_sprint_field_id');
        const storedPointsField = localStorage.getItem('asana_points_field_id');

        if (storedToken) setAsanaToken(storedToken);
        if (storedGid) setProjectGid(storedGid);
        if (storedSprintField) setSprintFieldId(storedSprintField);
        if (storedPointsField) setPointsFieldId(storedPointsField);
    }, []);

    // Save to localStorage on change
    useEffect(() => { localStorage.setItem('asana_token', asanaToken); }, [asanaToken]);
    useEffect(() => { localStorage.setItem('asana_project_gid', projectGid); }, [projectGid]);
    useEffect(() => { localStorage.setItem('asana_sprint_field_id', sprintFieldId); }, [sprintFieldId]);
    useEffect(() => { localStorage.setItem('asana_points_field_id', pointsFieldId); }, [pointsFieldId]);
    const [sprintCount, setSprintCount] = useState(3);
    const [isIngesting, setIsIngesting] = useState(false);
    const [ingestionError, setIngestionError] = useState<string | null>(null);
    const [ingestionSuccess, setIngestionSuccess] = useState(false);

    const handleIngest = async () => {
        setIsIngesting(true);
        setIngestionError(null);
        setIngestionSuccess(false);
        try {
            const data = await fetchAsanaData(
                asanaToken,
                projectGid,
                sprintFieldId || null,
                pointsFieldId || null,
                sprintCount
            );
            importData(data.sprints, data.tasks);
            setIngestionSuccess(true);
        } catch (err) {
            setIngestionError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsIngesting(false);
        }
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSprintName.trim()) {
            addSprint(newSprintName.trim(), newSprintCapacity);
            setNewSprintName('');
            setNewSprintCapacity(20);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tight">Sprint Management</h1>
                            {isDemoMode && (
                                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                                    Demo Mode
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 mt-2 text-lg">Configure cadence and team capacity.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            href="/"
                            className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-100 rounded-lg text-sm font-bold border border-slate-200 dark:border-zinc-700 shadow-sm transition-colors"
                        >
                            ← Back to Board
                        </Link>
                    </div>
                </div>


                {/* Asana Ingestion */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 mb-12 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">Import from Asana</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Personal Access Token</label>
                            <input
                                type="password"
                                placeholder="1/1234..."
                                value={asanaToken}
                                onChange={e => setAsanaToken(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Project GID</label>
                            <input
                                type="text"
                                placeholder="123456789"
                                value={projectGid}
                                onChange={e => setProjectGid(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Sprint Custom Field ID (Optional)</label>
                            <input
                                type="text"
                                placeholder="Defaults to searching 'Sprints'"
                                value={sprintFieldId}
                                onChange={e => setSprintFieldId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">DataPoints Custom Field ID (Optional)</label>
                            <input
                                type="text"
                                placeholder="Defaults to searching 'datapoints'"
                                value={pointsFieldId}
                                onChange={e => setPointsFieldId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleIngest}
                            disabled={!asanaToken || !projectGid || isIngesting}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                        >
                            {isIngesting ? 'Loading...' : 'Ingest Data'}
                        </button>

                        {ingestionSuccess && (
                            <span className="text-green-500 font-bold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Success!
                            </span>
                        )}

                        {ingestionError && (
                            <span className="text-red-500 font-bold text-sm">
                                Error: {ingestionError}
                            </span>
                        )}
                    </div>
                </div>

                {/* Add Sprint */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 mb-12 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">Create New Sprint</h2>
                    <form onSubmit={handleAdd} className="flex gap-6 items-end">
                        <div className="flex-1">
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Sprint 24.4"
                                value={newSprintName}
                                onChange={e => setNewSprintName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-3 font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Capacity</label>
                            <input
                                type="number"
                                value={newSprintCapacity}
                                onChange={e => setNewSprintCapacity(Number(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-3 font-mono outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newSprintName.trim()}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </form>
                </div>

                {/* Sprints */}
                <div className="space-y-6">
                    {sprints.map(sprint => (
                        <div key={sprint.name} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
                                <h3 className="text-xl font-bold">{sprint.name}</h3>
                                <button
                                    onClick={() => deleteSprint(sprint.name)}
                                    className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Total */}
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                                    <label className="text-xs uppercase font-bold text-slate-400 mb-2 block">Total Capacity</label>
                                    <input
                                        type="number"
                                        value={sprint.capacity}
                                        onChange={(e) => updateSprintCapacity(sprint.name, Number(e.target.value))}
                                        className="bg-transparent text-3xl font-mono font-bold w-full outline-none"
                                    />
                                </div>

                                {/* Assignees */}
                                {allAssignees.map(assignee => (
                                    <div key={assignee} className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                        <div className="font-bold text-sm">{assignee}</div>
                                        <input
                                            type="number"
                                            value={sprint.assigneeCapacities?.[assignee] || 0}
                                            onChange={(e) => updateAssigneeCapacity(sprint.name, assignee, Number(e.target.value))}
                                            className="w-16 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1 text-right font-mono text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {sprints.length === 0 && (
                        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                            No active sprints.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
