'use client';

import clsx from 'clsx';
import { useBoardStore } from '@/store/boardStore';
import { motion } from 'framer-motion';

export const AssigneeLegend = () => {
    const { tasks, filterAssignee, setFilterAssignee } = useBoardStore();

    // Get unique assignees
    const assignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[];

    // Simple map for consistent colors if not provided (fallback) or use task color
    // In our mock data, assignee usually correlates with color but not strictly enforcing it yet.
    // Let's find the most common color for an assignee or just pick the first one found.
    const getAssigneeColor = (name: string) => {
        const task = tasks.find(t => t.assignee === name);
        // Extract the color class like "bg-blue-500" => just return it
        // If we want the actual hex for a little dot, we'd need a map. 
        // For now, let's use the Tailwind class on the badge itself.
        return task?.color || 'bg-slate-500';
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider mr-1">Filter:</span>

            <button
                onClick={() => setFilterAssignee(null)}
                className={clsx(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                    !filterAssignee
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:bg-white/5"
                )}
            >
                All
            </button>

            {assignees.map(assignee => {
                const colorClass = getAssigneeColor(assignee);
                const isActive = filterAssignee === assignee;

                return (
                    <button
                        key={assignee}
                        onClick={() => setFilterAssignee(isActive ? null : assignee)}
                        className={clsx(
                            "group px-3 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-2",
                            isActive
                                ? "bg-white/10 border-white/40 text-white"
                                : "bg-transparent border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5 hover:text-white/80"
                        )}
                    >
                        <span className={clsx("w-2 h-2 rounded-full ring-1 ring-white/20", colorClass)} />
                        {assignee}
                    </button>
                );
            })}
        </div>
    );
};
