'use client';

import { createPortal } from 'react-dom';
import { X, Clock, ArrowRight } from 'lucide-react';
import { useBoardStore } from '@/store/boardStore';
import { useEffect, useState } from 'react';

interface ChangeLogModalProps {
    onClose: () => void;
}

export const ChangeLogModal = ({ onClose }: ChangeLogModalProps) => {
    const { pendingChanges } = useBoardStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                Pending Changes
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {pendingChanges.length} unsynced updates
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-0">
                    {pendingChanges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Clock size={48} className="mb-4 opacity-20" />
                            <p>No pending changes</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {pendingChanges.slice().reverse().map((change) => (
                                <div key={change.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                            {change.taskTitle || 'Unknown Task'}
                                        </h3>
                                        <span className="text-xs text-slate-400 font-mono">
                                            {new Date(change.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="uppercase text-[10px] font-bold tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                                            {change.field}
                                        </span>
                                        <span className="line-through opacity-70">
                                            {String(change.oldValue || 'None')}
                                        </span>
                                        <ArrowRight size={14} className="text-slate-300" />
                                        <span className="font-medium text-purple-600 dark:text-purple-400">
                                            {String(change.newValue || 'None')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
