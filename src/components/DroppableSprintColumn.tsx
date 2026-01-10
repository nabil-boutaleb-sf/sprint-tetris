import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import { useBoardStore } from '@/store/boardStore';
import { DraggableTask } from './DraggableTask';
import { Task } from '@/types';
import { calculateCapacityHeight } from '@/lib/uiUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
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

    const { sprints, updateSprintCapacity } = useBoardStore();
    const sprint = sprints.find(s => s.name === name);
    const capacity = sprint?.capacity || 20;

    const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
    const capacityHeight = calculateCapacityHeight(capacity);
    const fillPercentage = (totalPoints / capacity) * 100;

    // Confetti Logic
    const prevPointsRef = useRef(totalPoints);
    useEffect(() => {
        const isPerfect = Math.abs(totalPoints - capacity) < 0.1 && totalPoints > 0;
        const wasNotPerfect = Math.abs(prevPointsRef.current - capacity) >= 0.1;

        if (isPerfect && wasNotPerfect) {
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#a855f7', '#ec4899', '#ffffff']
            });
        }
        prevPointsRef.current = totalPoints;
    }, [totalPoints, capacity]);


    // Dynamic styles based on state (Fizzy: Solid borders)
    let borderColor = 'border-slate-300 dark:border-zinc-700';
    let headerColor = 'text-slate-900 dark:text-gray-100';
    let bgColor = 'bg-slate-100 dark:bg-zinc-900';

    // Fizzy logic - capacity fills up the tube, but maybe less "liquid" and more "progress bar"
    // Actually, user liked the visual, just wanted it faster. Removing glass/blur is key.

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
            {/* Header Area */}
            <div className="flex justify-between items-center px-1">
                <h3 className={clsx("text-base font-bold tracking-tight", headerColor)}>{name}</h3>
                <div className="flex gap-2 items-center bg-white dark:bg-zinc-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-zinc-700 shadow-sm">
                    <input
                        type="number"
                        value={capacity}
                        onChange={(e) => updateSprintCapacity(name, Number(e.target.value))}
                        className="w-10 text-sm bg-transparent text-right text-slate-700 dark:text-gray-200 focus:text-black dark:focus:text-white outline-none font-mono font-bold"
                    />
                    <span className="text-xs text-slate-400 dark:text-gray-500">/</span>
                    <span className={clsx(
                        "text-sm font-mono font-bold",
                        fillPercentage > 100 ? "text-red-500" :
                            fillPercentage >= 98 && fillPercentage <= 100 ? "text-green-600 dark:text-green-400" :
                                "text-slate-500 dark:text-gray-500"
                    )}>
                        {totalPoints}
                    </span>
                </div>
            </div>

            {/* The Solid Tube (Fizzy Style) */}
            <motion.div
                initial={false}
                animate={{ height: capacityHeight + 20, borderColor, backgroundColor: isOver ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#27272a' : '#f3e8ff') : '' }} // Simple animate
                transition={{ type: "spring", stiffness: 400, damping: 40 }} // Snappy
                className={clsx(
                    "relative rounded-xl border-2 transition-colors duration-200 p-1 flex flex-col justify-end overflow-hidden shadow-sm",
                    bgColor,
                    borderColor
                )}
            >
                {/* Progress Background - Solid Color Block instead of gradient/blur */}
                <motion.div
                    className={clsx(
                        "absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none z-0",
                        fillPercentage > 100 ? "bg-red-500" :
                            fillPercentage >= 100 ? "bg-green-500" :
                                "bg-slate-400 dark:bg-slate-500"
                    )}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(fillPercentage, 100)}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />

                {/* Tasks Container */}
                <div className="flex flex-col gap-1 z-10 w-full overflow-y-auto overflow-x-hidden scrollbar-none max-h-full pb-1">
                    <AnimatePresence>
                        {tasks.map(task => (
                            <DraggableTask key={task.id} task={task} onTaskClick={() => onTaskClick(task)} />
                        ))}
                    </AnimatePresence>

                    {/* Interaction Zone Spacer */}
                    <div className="min-h-[10px] shrink-0" />
                </div>

            </motion.div>

            {/* Overflow Text Warning */}
            <AnimatePresence>
                {fillPercentage > 100 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-xs text-red-600 dark:text-red-300 font-bold tracking-wide text-center flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/20 rounded-md py-1 border border-red-200 dark:border-red-800"
                    >
                        <span>⚠️</span>
                        <span>Over limit by {(totalPoints - capacity).toFixed(1)} pts</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
