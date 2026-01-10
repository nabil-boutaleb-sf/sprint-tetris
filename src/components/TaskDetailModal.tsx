'use client';

import { Task } from '@/types';
import { X, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface TaskDetailModalProps {
    task: Task | null;
    onClose: () => void;
}

export const TaskDetailModal = ({ task, onClose }: TaskDetailModalProps) => {
    if (!task) return null;

    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100 opacity-100">

                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${task.color || 'bg-slate-500'}`}>
                                {task.points} Points
                            </span>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                {task.status}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            {task.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <User className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-500">Assignee</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {task.assignee || 'Unassigned'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Calendar className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-500">Sprints</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {task.sprints.length > 0 ? task.sprints.join(', ') : 'Backlog'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description Placeholder */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <Tag size={16} /> Description
                        </h3>
                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            <p>
                                This is a placeholder description for the task. In a real Asana integration, the full HTML description would be rendered here.
                            </p>
                            <p className="mt-2">
                                - Subtask 1 <br />
                                - Subtask 2
                            </p>
                        </div>
                    </div>

                    {/* Warnings/Context */}
                    {task.points > 8 && (
                        <div className="flex gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm">
                            <AlertCircle className="shrink-0" size={20} />
                            <p>This is a large task ({task.points} pts). Consider breaking it down into smaller subtasks for better flow.</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        Close
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
                        Open in Asana
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};
