import { useDroppable } from '@dnd-kit/core';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useBoardStore } from '@/store/boardStore';
import { DraggableTask } from './DraggableTask';
import { Task } from '@/types';
import { calculateVisualHeight } from '@/lib/uiUtils';
import confetti from 'canvas-confetti';

interface DroppableSprintColumnProps {
    name: string;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export const DroppableSprintColumn = ({ name, tasks, onTaskClick }: DroppableSprintColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: name,
        data: { type: 'sprint', name },
    });

    const { sprints, updateSprintCapacity, updateAssigneeCapacity, filterAssignee, isFunModeEnabled } = useBoardStore();
    const sprint = sprints.find(s => s.name === name);

    // Logic: If filter is on, use specific cap. If specific cap is undefined, fallback to sprint capacity
    const assigneeCapCallback = sprint?.assigneeCapacities?.[filterAssignee || ''];
    const effectiveCapacity = filterAssignee
        ? (assigneeCapCallback !== undefined ? assigneeCapCallback : sprint?.capacity || 50)
        : (sprint?.capacity || 50);

    // Local state for smooth editing
    const [localCapacity, setLocalCapacity] = useState(effectiveCapacity.toString());

    // Sync local state when capacity changes (store update or filter switch)
    useEffect(() => {
        setLocalCapacity(effectiveCapacity.toString());
    }, [effectiveCapacity, filterAssignee]);

    const handleCommit = () => {
        let val = parseFloat(localCapacity);
        if (isNaN(val) || val < 0) val = 0;

        if (filterAssignee) {
            updateAssigneeCapacity(name, filterAssignee, val);
        } else {
            updateSprintCapacity(name, val);
        }
        setLocalCapacity(val.toString());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
    const qaBuffer = tasks.length * 0.5;
    const effectiveLoad = totalPoints + qaBuffer;

    const fillPercentage = (effectiveLoad / effectiveCapacity) * 100;

    // Confetti Effect Ref
    const hasTriggeredConfetti = useRef(false);

    // Sound Refs
    const successAudioRef = useRef<HTMLAudioElement | null>(null);
    const lockAudioRef = useRef<HTMLAudioElement | null>(null);
    const warningAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Audio
    useEffect(() => {
        successAudioRef.current = new Audio('/levelup.mp3');
        successAudioRef.current.volume = 0.4;

        lockAudioRef.current = new Audio('/tetris_lock.wav');
        lockAudioRef.current.volume = 0.3;

        warningAudioRef.current = new Audio('/capacity_warning.wav');
        warningAudioRef.current.volume = 0.3;
    }, []);

    // Effect: Trigger Confetti & Sound on "Perfect Fill" (92-100%)
    useEffect(() => {
        if (fillPercentage >= 92 && fillPercentage <= 100) {
            if (!hasTriggeredConfetti.current) {
                // Find the element position to shoot confetti from
                const element = document.getElementById(`sprint-header-${name}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const x = (rect.left + rect.width / 2) / window.innerWidth;
                    const y = (rect.top + rect.height / 2) / window.innerHeight;

                    // Trigger Confetti & Sound (if Fun Mode Enabled)
                    if (isFunModeEnabled) {
                        confetti({
                            particleCount: 50,
                            spread: 60,
                            origin: { x, y },
                            colors: ['#a855f7', '#a855f7', '#fafafa'], // Purple & White
                            disableForReducedMotion: true
                        });

                        // Play Success Chime + Lock Sound slightly delayed
                        successAudioRef.current?.play().catch(() => { });
                        setTimeout(() => {
                            lockAudioRef.current?.play().catch(() => { });
                        }, 300);
                    }
                }
                hasTriggeredConfetti.current = true;
            }
        } else {
            hasTriggeredConfetti.current = false;
        }
    }, [fillPercentage, name, isFunModeEnabled]);

    // Effect: Trigger Warning Sound on Overage (only once per breach)
    const hasTriggeredWarning = useRef(false);
    useEffect(() => {
        if (fillPercentage > 100) {
            if (!hasTriggeredWarning.current) {
                if (isFunModeEnabled) {
                    warningAudioRef.current?.play().catch(() => { });
                }
                hasTriggeredWarning.current = true;
            }
        } else {
            hasTriggeredWarning.current = false;
        }
    }, [fillPercentage, isFunModeEnabled]);

    // Visual Height scaling based on GLOBAL capacity to keep columns aligned?
    // Or relative to this view? If I filter to "Alice", should the column shrink to her small capacity?
    // Probably yes, "dynamic container".
    const idealMinHeight = (effectiveCapacity / 5) * calculateVisualHeight(5);

    // Dynamic styles
    let borderColor = 'border-slate-300 dark:border-zinc-700';
    let bgColor = 'bg-slate-100 dark:bg-zinc-900';

    if (fillPercentage > 100) {
        borderColor = 'border-red-400 ring-1 ring-red-400/50';
    } else if (fillPercentage > 90) {
        borderColor = 'border-yellow-400';
    }

    if (isOver) {
        borderColor = 'border-purple-500 ring-2 ring-purple-500/20';
        bgColor = 'bg-purple-50 dark:bg-zinc-800';
    }

    const [showCapacityDetails, setShowCapacityDetails] = useState(false);

    // Individual Overages Logic (Only when NOT filtered)
    const renderIndividualOverages = () => {
        if (filterAssignee) return null; // Logic is handled by main bar in filtered view

        // Group by assignee
        const loadsByAssignee: Record<string, number> = {};
        tasks.forEach(t => {
            if (!t.assignee) return;
            if (!loadsByAssignee[t.assignee]) loadsByAssignee[t.assignee] = 0;
            loadsByAssignee[t.assignee] += t.points + 0.5; // Include QA buffer
        });

        const overages = Object.entries(loadsByAssignee).filter(([assignee, load]) => {
            const cap = sprint?.assigneeCapacities?.[assignee];
            return cap !== undefined && load > cap;
        });

        if (overages.length === 0) return null;

        return (
            <div className="flex flex-col gap-1 mt-1">
                {overages.map(([assignee, load]) => {
                    const cap = sprint?.assigneeCapacities?.[assignee] || 0;
                    return (
                        <div key={assignee} className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded border border-red-200 dark:border-red-900/30 flex justify-between items-center">
                            <span>{assignee}</span>
                            <span>{load}/{cap}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div ref={setNodeRef} className="flex flex-col w-[280px] shrink-0 gap-3 relative">
            {/* Header */}
            <div id={`sprint-header-${name}`} className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-gray-100">{name}</h3>
                    {filterAssignee && (
                        <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                            {filterAssignee}
                        </span>
                    )}
                </div>
                <div
                    className={clsx(
                        "flex gap-2 items-center bg-white dark:bg-zinc-800 rounded-lg px-2 py-1 border shadow-sm cursor-pointer relative",
                        fillPercentage > 100 ? "border-red-200" : "border-slate-200 dark:border-zinc-700"
                    )}
                    onClick={() => setShowCapacityDetails(!showCapacityDetails)}
                >
                    <input
                        type="text"
                        inputMode="numeric"
                        value={localCapacity}
                        onChange={(e) => setLocalCapacity(e.target.value)}
                        onBlur={handleCommit}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 text-sm bg-transparent text-right text-slate-700 dark:text-gray-200 focus:text-black dark:focus:text-white outline-none font-mono font-bold"
                    />
                    <span className="text-xs text-slate-400">/</span>
                    <span className={clsx(
                        "text-sm font-mono font-bold",
                        fillPercentage > 100 ? "text-red-500" :
                            fillPercentage >= 98 ? "text-green-600 dark:text-green-400" :
                                "text-slate-500"
                    )}>
                        {effectiveLoad}
                    </span>

                    {/* Capacity Popover */}
                    {showCapacityDetails && (
                        <div className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 w-48 text-sm">
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-500">Raw Points:</span>
                                <span className="font-mono font-bold">{totalPoints}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500">QA Buffer:</span>
                                <span className="font-mono font-bold text-purple-500">+{qaBuffer}</span>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-700 my-2" />
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-700 dark:text-slate-300">Total Load:</span>
                                <span className={clsx("font-mono font-bold", fillPercentage > 100 ? "text-red-500" : "text-slate-900 dark:text-white")}>
                                    {effectiveLoad}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-2 italic text-center">
                                {filterAssignee ? `(Personal Capacity for ${filterAssignee})` : '(Team Capacity)'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* The Dynamic Container */}
            <div
                className={clsx(
                    "relative rounded-xl border-2 transition-all duration-300 p-1 flex flex-col min-h-[150px] shadow-sm",
                    bgColor,
                    borderColor,
                    // Lock-in Pulse Animation for 92-100% (Only in Fun Mode)
                    (isFunModeEnabled && fillPercentage >= 92 && fillPercentage <= 100) && "ring-4 ring-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-[1.02] animate-pulse"
                )}
                style={{ minHeight: `${Math.max(idealMinHeight, 100)}px`, transition: 'min-height 0.3s ease-out' }}
            >
                {/* Lock-in Icon Overlay */}
                {(isFunModeEnabled && fillPercentage >= 92 && fillPercentage <= 100) && (
                    <div className="absolute -top-3 -right-3 bg-purple-600 text-white p-1.5 rounded-full shadow-lg animate-in zoom-in spin-in-12 duration-300 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                )}

                {/* Tasks */}
                <div className="flex flex-col gap-1 w-full pb-1 h-full">
                    {tasks.map(task => (
                        <DraggableTask key={task.id} task={task} onTaskClick={() => onTaskClick(task)} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-zinc-700 text-sm font-medium italic p-4">
                            Drop tasks here
                        </div>
                    )}
                </div>

            </div>

            {/* Warnings */}
            {fillPercentage > 100 && (
                <div className="text-xs text-red-600 dark:text-red-300 font-bold bg-red-50 dark:bg-red-900/20 rounded-md py-1 border border-red-200 text-center animate-in fade-in slide-in-from-top-1 duration-200">
                    ⚠️ {filterAssignee ? 'Personal limit exceeded' : `Over limit by ${(effectiveLoad - effectiveCapacity).toFixed(1)} pts`}
                </div>
            )}

            {/* Individual Overages (Unfiltered View) */}
            {renderIndividualOverages()}
        </div>
    );
};
