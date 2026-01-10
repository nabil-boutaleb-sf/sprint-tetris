'use client';

import { useBoardStore } from '@/store/boardStore';
import Link from 'next/link';
import { useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManagePage() {
    const { sprints, tasks, addSprint, deleteSprint, updateSprintCapacity, updateAssigneeCapacity } = useBoardStore();

    // Get all unique assignees to generate rows
    const allAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[];

    // Local state for new sprint form
    const [newSprintName, setNewSprintName] = useState('');
    const [newSprintCapacity, setNewSprintCapacity] = useState(20);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSprintName.trim()) {
            addSprint(newSprintName.trim(), newSprintCapacity);
            setNewSprintName('');
            setNewSprintCapacity(20);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-200 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Sprint Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Configure cadence and team capacity.</p>
                    </div>
                    <Link
                        href="/"
                        className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg text-sm font-bold transition-all border border-slate-200 dark:border-zinc-700 shadow-sm"
                    >
                        ← Back to Board
                    </Link>
                </div>

                {/* Create New Sprint Section */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 mb-12 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 p-2 rounded-lg">✨</span>
                        Create New Sprint
                    </h2>
                    <form onSubmit={handleAdd} className="flex gap-6 items-end">
                        <div className="flex-1">
                            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Sprint Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Sprint 24.4"
                                value={newSprintName}
                                onChange={e => setNewSprintName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-lg font-medium"
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Total Capacity</label>
                            <input
                                type="number"
                                value={newSprintCapacity}
                                onChange={e => setNewSprintCapacity(Number(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-mono text-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newSprintName.trim()}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md active:scale-95 text-lg"
                        >
                            Add Sprint
                        </button>
                    </form>
                </div>

                {/* Sprints List */}
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    Active Sprints <span className="bg-slate-200 dark:bg-zinc-800 text-sm px-3 py-1 rounded-full text-slate-600 dark:text-slate-300">{sprints.length}</span>
                </h2>

                <div className="grid gap-6">
                    <AnimatePresence>
                        {sprints.map(sprint => (
                            <motion.div
                                key={sprint.name}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-start justify-between mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 text-white">
                                            📅
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{sprint.name}</h3>
                                            <p className="text-slate-500 text-sm font-medium">Sprint Capacity Management</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (confirm(`Are you sure you want to delete ${sprint.name}?`)) {
                                                deleteSprint(sprint.name);
                                            }
                                        }}
                                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>

                                {/* Assignee Capacity Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Edit Total Manually */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 flex flex-col">
                                        <label className="text-xs uppercase font-bold text-slate-400 mb-2">Total Team Capacity</label>
                                        <input
                                            type="number"
                                            value={sprint.capacity}
                                            onChange={(e) => updateSprintCapacity(sprint.name, Number(e.target.value))}
                                            className="bg-transparent text-3xl font-mono font-bold text-slate-800 dark:text-slate-200 outline-none w-full"
                                        />
                                    </div>

                                    {/* Per Assignee Interfaces */}
                                    {allAssignees.map(assignee => {
                                        const assigneeCap = sprint.assigneeCapacities?.[assignee] || 0;
                                        return (
                                            <div key={assignee} className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{assignee}</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={assigneeCap}
                                                    onChange={(e) => updateAssigneeCapacity(sprint.name, assignee, Number(e.target.value))}
                                                    className="w-16 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-right font-mono text-sm focus:border-purple-500 outline-none transition-colors"
                                                    placeholder="0"
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
