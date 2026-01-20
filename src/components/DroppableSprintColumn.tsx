import { useDroppable } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useBoardStore } from '@/store/boardStore';
import { DraggableTask } from './DraggableTask';
import { Task } from '@/types';
import { calculateVisualHeight } from '@/lib/uiUtils';

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

    const { sprints, updateSprintCapacity } = useBoardStore();
    const sprint = sprints.find(s => s.name === name);
    const capacity = sprint?.capacity || 50;

    // Local state for smooth editing
    const [localCapacity, setLocalCapacity] = useState(capacity.toString());

    useEffect(() => {
        setLocalCapacity(capacity.toString());
    }, [capacity]);

    const handleCommit = () => {
        let val = parseInt(localCapacity, 10);
        if (isNaN(val) || val < 0) val = 0;
        updateSprintCapacity(name, val);
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

    // We use effectiveLoad for the capacity bar
    const fillPercentage = (effectiveLoad / capacity) * 100;

    // Heuristic: Set min-height assuming standard 5-point tasks
    // If capacity is 20, we expect 4 tasks of 5 points.
    // Height = (20 / 5) * HeightOf(5)
    // 5 points height = 16 + 5*8 = 56px
    const idealMinHeight = (capacity / 5) * calculateVisualHeight(5);

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

    return (
        <div ref={setNodeRef} className="flex flex-col w-[280px] shrink-0 gap-3 relative">
            {/* Header */}
            <div className="flex justify-between items-center px-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-gray-100">{name}</h3>
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
                        onClick={(e) => e.stopPropagation()} // Don't trigger modal when editing capacity
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
                                (0.5 pts buffer per task)
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* The Dynamic Container */}
            <div
                className={clsx(
                    "relative rounded-xl border-2 transition-colors duration-200 p-1 flex flex-col min-h-[150px] shadow-sm",
                    bgColor,
                    borderColor
                )}
                style={{ minHeight: `${Math.max(idealMinHeight, 100)}px`, transition: 'min-height 0.3s ease-out' }}
            >
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

            {/* Over Limit Warning */}
            {fillPercentage > 100 && (
                <div className="text-xs text-red-600 dark:text-red-300 font-bold bg-red-50 dark:bg-red-900/20 rounded-md py-1 border border-red-200 text-center animate-in fade-in slide-in-from-top-1 duration-200">
                    ⚠️ Over limit by {(effectiveLoad - capacity).toFixed(1)} pts
                </div>
            )}
        </div>
    );
};
