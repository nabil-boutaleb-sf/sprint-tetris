'use client';

import clsx from 'clsx';
import { useBoardStore } from '@/store/boardStore';
import { getAssigneeColorClass } from '@/lib/uiUtils';

export const AssigneeLegend = () => {
    const { tasks, filterAssignee, setFilterAssignee } = useBoardStore();

    // Get unique assignees
    const assignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[];

    return (
        <div className="flex items-center gap-2 flex-wrap py-1">

            <button
                onClick={() => setFilterAssignee(null)}
                className={clsx(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all border",
                    !filterAssignee
                        ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                )}
            >
                All
            </button>

            {assignees.map(assignee => {
                const colorClass = getAssigneeColorClass(assignee);
                const isActive = filterAssignee === assignee;

                return (
                    <button
                        key={assignee}
                        onClick={() => setFilterAssignee(isActive ? null : assignee)}
                        className={clsx(
                            "group px-3 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-2",
                            isActive
                                ? "bg-white border-slate-300 text-slate-900 shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <span className={clsx("w-2 h-2 rounded-full", colorClass)} />
                        {assignee}
                    </button>
                );
            })}
        </div>
    );
};
