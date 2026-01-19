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
    const fillPercentage = (totalPoints / capacity) * 100;

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

    return (
        <div ref={setNodeRef} className="flex flex-col w-[280px] shrink-0 gap-3">
            {/* Header */}
            <div className="flex justify-between items-center px-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-gray-100">{name}</h3>
                <div className="flex gap-2 items-center bg-white dark:bg-zinc-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-zinc-700 shadow-sm">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={localCapacity}
                        onChange={(e) => setLocalCapacity(e.target.value)}
                        onBlur={handleCommit}
                        onKeyDown={handleKeyDown}
                        className="w-10 text-sm bg-transparent text-right text-slate-700 dark:text-gray-200 focus:text-black dark:focus:text-white outline-none font-mono font-bold"
                    />
                    <span className="text-xs text-slate-400">/</span>
                    <span className={clsx(
                        "text-sm font-mono font-bold",
                        fillPercentage > 100 ? "text-red-500" :
                            fillPercentage >= 98 ? "text-green-600 dark:text-green-400" :
                                "text-slate-500"
                    )}>
                        {totalPoints}
                    </span>
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
                    ⚠️ Over limit by {(totalPoints - capacity).toFixed(1)} pts
                </div>
            )}
        </div>
    );
};
