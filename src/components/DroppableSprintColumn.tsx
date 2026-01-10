import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import { useBoardStore } from '@/store/boardStore';
import { DraggableTask } from './DraggableTask';
import { Task } from '@/types';
import { calculateCapacityHeight } from '@/lib/uiUtils';

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

    let capacityColor = 'bg-slate-800/50 dark:bg-slate-800/50 bg-slate-100';
    let borderColor = 'border-slate-700 dark:border-slate-700 border-slate-300';
    let badgeColor = 'bg-slate-700 text-slate-300 dark:bg-slate-700 dark:text-slate-300 bg-slate-200 text-slate-700';

    if (fillPercentage > 100) {
        borderColor = 'border-red-500/50 dark:border-red-500/50 border-red-500/50';
        badgeColor = 'bg-red-500/20 text-red-700 dark:text-red-200';
    } else if (fillPercentage > 90) {
        borderColor = 'border-yellow-500/50 dark:border-yellow-500/50 border-yellow-500/50';
        badgeColor = 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-200';
    }

    // Highlight on drag over
    if (isOver) {
        borderColor = 'border-purple-500 ring-2 ring-purple-500/20';
    }

    return (
        <div ref={setNodeRef} className="flex flex-col w-[280px] shrink-0">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{name}</h3>
                <div className="flex gap-2 items-center">
                    {/* Editable Capacity Input */}
                    <input
                        type="number"
                        value={capacity}
                        onChange={(e) => updateSprintCapacity(name, Number(e.target.value))}
                        className="w-12 text-xs bg-transparent border border-slate-600 rounded px-1 py-0.5 text-right text-slate-500 focus:text-slate-900 dark:focus:text-white outline-none focus:border-purple-500"
                    />
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full font-mono", badgeColor)}>
                        {totalPoints} pts
                    </span>
                </div>
            </div>

            <div
                className={clsx(
                    "relative rounded-xl border-2 transition-all duration-200 p-1 flex flex-col justify-end backdrop-blur-sm",
                    borderColor,
                    capacityColor
                )}
                style={{ height: `${capacityHeight + 20}px`, minHeight: '100px' }}
            >
                <div className="flex flex-col gap-0.5 z-10 w-full">
                    {tasks.map(task => (
                        <DraggableTask key={task.id} task={task} onTaskClick={() => onTaskClick(task)} />
                    ))}
                </div>

                {fillPercentage > 100 && (
                    <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-red-500/20 to-transparent z-0 pointer-events-none animate-pulse rounded-t-lg" />
                )}
            </div>

            {fillPercentage > 100 && (
                <div className="mt-2 text-xs text-red-500 dark:text-red-400 font-medium text-center flex items-center justify-center gap-1">
                    <span>⚠️</span>
                    Over capacity by {(totalPoints - capacity).toFixed(1)} pts
                </div>
            )}
        </div>
    );
};
