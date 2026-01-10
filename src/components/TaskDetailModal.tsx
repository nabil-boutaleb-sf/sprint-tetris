'use client';

import { Task } from '@/types';
import { X, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskDetailModalProps {
    task: Task | null;
    onClose: () => void;
}

export const TaskDetailModal = ({ task, onClose }: TaskDetailModalProps) => {
    if (!task) return null;
    if (typeof window === 'undefined') return null;

    // Status Colors Map (Fizzy Style)
    const getStatusStyle = (status: Task['status']) => {
        switch (status) {
            case 'Done': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'Backlog': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
            default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'; // To Do
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >

                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold border", getStatusStyle(task.status))}>
                                {task.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${task.color || 'bg-slate-500'}`}>
                                {task.points} pts
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                            {task.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                            <User className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs uppercase font-bold text-slate-400">Assignee</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {task.assignee || 'Unassigned'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                            <Calendar className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs uppercase font-bold text-slate-400">Sprint</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {task.sprint ? task.sprint : 'Backlog'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description Placeholder */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <Tag size={16} className="text-slate-400" /> Context
                        </h3>
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            <p>
                                This is a placeholder description for the task. In a real Asana integration, the full HTML description would be rendered here.
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 ml-1 marker:text-purple-500">
                                <li>Subtask requirement 1</li>
                                <li>Validation step 2</li>
                            </ul>
                        </div>
                    </div>

                    {/* Warnings/Context */}
                    {task.points >= 8 && (
                        <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 text-sm font-medium">
                            <AlertCircle className="shrink-0 text-amber-500" size={20} />
                            <p>This is a heavy task ({task.points} pts). Consider breaking it down for better flow.</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                        Close
                    </button>
                    <button className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-all shadow-lg shadow-purple-900/20">
                        Open in Asana
                    </button>
                </div>

            </motion.div>
        </div>,
        document.body
    );
};
