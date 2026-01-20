'use client';

import { Task } from '@/types';
import { X, Calendar, User, Tag, AlertCircle, Save, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { getAssigneeColorClass } from '@/lib/uiUtils';

interface TaskDetailModalProps {
    task: Task | null;
    onClose: () => void;
}

export const TaskDetailModal = ({ task, onClose }: TaskDetailModalProps) => {
    const { updateTask, tasks, sprints } = useBoardStore();

    // Derived state for dropdowns
    const allAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[];
    const allSprints = sprints.map(s => s.name);

    // Local form state
    const [title, setTitle] = useState('');
    const [points, setPoints] = useState(0);
    const [status, setStatus] = useState<Task['status']>('To Do');
    const [sprint, setSprint] = useState<string | null>(null);
    const [assignee, setAssignee] = useState<string>('');
    const [description, setDescription] = useState('');

    // Initialize state when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setPoints(task.points);
            setStatus(task.status);
            setSprint(task.sprint);
            setAssignee(task.assignee || '');
            // Strip HTML for now since we use a simple textarea. 
            // In a real app we might want a rich text editor or html-to-markdown.
            // For now, we just edit the raw html or text.
            // Actually, let's keep it simple: if it has HTML tags, we show them.
            // Or better: strip tags for display? No, that destroys data.
            // Let's just load it as is.
            setDescription(task.description || '');
        }
    }, [task]);

    if (!task) return null;
    if (typeof window === 'undefined') return null;

    const handleSave = () => {
        updateTask(task.id, {
            title,
            points,
            description,
            status,
            sprint: sprint || null,
            assignee: assignee || undefined,
            // Update color based on new assignee
            color: assignee ? getAssigneeColorClass(assignee) : undefined
        });
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                <span className="text-xs font-bold text-slate-500 uppercase px-2">Points</span>
                                <input
                                    type="number"
                                    value={points}
                                    onChange={e => setPoints(Number(e.target.value))}
                                    className="w-16 bg-white dark:bg-slate-700 rounded px-2 py-0.5 text-sm font-bold text-center outline-none focus:ring-1 focus:ring-purple-500"
                                    min="0"
                                    step="0.5"
                                />
                            </div>

                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as Task['status'])}
                                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-purple-500 border-none cursor-pointer"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                                <option value="Backlog">Backlog</option>
                            </select>

                        </div>

                        <div className="flex items-center gap-2">
                            <textarea
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full text-2xl font-bold text-slate-800 dark:text-slate-100 bg-transparent outline-none focus:border-b-2 focus:border-purple-500 resize-none overflow-hidden"
                                rows={2}
                            />
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto">

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <User className="text-slate-400" size={20} />
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Assignee</p>
                                <select
                                    value={assignee}
                                    onChange={e => setAssignee(e.target.value)}
                                    className="w-full bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none border-b border-transparent focus:border-purple-500 pb-0.5"
                                >
                                    <option value="">Unassigned</option>
                                    {allAssignees.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Calendar className="text-slate-400" size={20} />
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Sprint</p>
                                <select
                                    value={sprint || ''}
                                    onChange={e => setSprint(e.target.value || null)}
                                    className="w-full bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none border-b border-transparent focus:border-purple-500 pb-0.5"
                                >
                                    <option value="">Backlog</option>
                                    {allSprints.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Description Placeholder */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <Tag size={16} /> Description
                        </h3>
                        <div className="p-1">
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full min-h-[150px] p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-purple-500 resize-y"
                                placeholder="Add a description..."
                            />
                        </div>
                    </div>

                    {/* Warnings/Context */}
                    {points > 8 && (
                        <div className="flex gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm">
                            <AlertCircle className="shrink-0" size={20} />
                            <p>This is a large task ({points} pts). Consider breaking it down into smaller subtasks for better flow.</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div>
                        {task.permalink_url && (
                            <a
                                href={task.permalink_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                                <ExternalLink size={16} />
                                <span>Open in Asana</span>
                            </a>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};
