import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { calculateCapacityHeight } from '@/lib/uiUtils';
import clsx from 'clsx';

interface SprintColumnProps {
    name: string;
    capacity: number;
    tasks: Task[];
}

export const SprintColumn = ({ name, capacity, tasks }: SprintColumnProps) => {
    const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
    const capacityHeight = calculateCapacityHeight(capacity);
    const usedHeight = calculateCapacityHeight(totalPoints);

    // Calculate percentage for color coding
    const fillPercentage = (totalPoints / capacity) * 100;

    let capacityColor = 'bg-slate-800/50'; // Default container
    let borderColor = 'border-slate-700';
    let badgeColor = 'bg-slate-700 text-slate-300';

    // Warnings
    if (fillPercentage > 100) {
        borderColor = 'border-red-500/50';
        badgeColor = 'bg-red-500/20 text-red-200';
    } else if (fillPercentage > 90) {
        borderColor = 'border-yellow-500/50';
        badgeColor = 'bg-yellow-500/20 text-yellow-200';
    }

    return (
        <div className="flex flex-col w-[280px] shrink-0">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-sm font-bold text-slate-200">{name}</h3>
                <span className={clsx("text-xs px-2 py-0.5 rounded-full font-mono", badgeColor)}>
                    {totalPoints} / {capacity}
                </span>
            </div>

            <div
                className={clsx(
                    "relative rounded-xl border-2 transition-colors duration-300 p-1 flex flex-col justify-end backdrop-blur-sm",
                    borderColor,
                    capacityColor
                )}
                style={{ height: `${capacityHeight + 20}px` }} // +20 padding
            >
                {/* The tasks container - stacked from bottom? or top? 
            Sprint visualizers usually fill from bottom up like a jar, or top down.
            Tweek fills top down. Let's do top down for now as it's more standard for lists.
        */}
                <div className="flex flex-col w-full h-full overflow-hidden relative">
                    {/* Capacity "Water Level" Background - Optional Polish
                 If we want to show exactly where the limit is relative to the cards.
             */}

                    <div className="flex flex-col gap-0.5 z-10">
                        {tasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>

                    {/* Overflow Indicator Visual */}
                    {fillPercentage > 100 && (
                        <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-red-500/20 to-transparent z-0 pointer-events-none animate-pulse" />
                    )}
                </div>
            </div>

            {fillPercentage > 100 && (
                <div className="mt-2 text-xs text-red-400 font-medium text-center flex items-center justify-center gap-1">
                    <span>⚠️</span>
                    Over capacity by {(totalPoints - capacity).toFixed(1)} pts
                </div>
            )}
        </div>
    );
};
