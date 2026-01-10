import { Task } from '@/types';
import { calculateTaskHeight } from '@/lib/uiUtils';
import clsx from 'clsx';

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
    const height = calculateTaskHeight(task.points);

    // Dynamic font size for very small cards
    const isTiny = height < 20;

    return (
        <div
            onClick={onClick}
            style={{ height: `${height}px` }}
            className={clsx(
                'w-full rounded-md mb-1 relative overflow-hidden transition-all duration-200 hover:brightness-110 shadow-sm border border-white/5',
                task.color || 'bg-slate-700',
                'group cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-white/20'
            )}
        >
            <div className={clsx("px-2 py-1 h-full flex flex-col justify-center", isTiny ? "text-[8px] leading-tight" : "text-xs")}>
                {!isTiny && (
                    <div className="flex justify-between items-start">
                        <span className="font-semibold truncate text-white/90 w-full">{task.title}</span>
                    </div>
                )}
                {isTiny && (
                    <span className="truncate text-white/90 w-full block">{task.title}</span>
                )}

                {!isTiny && (
                    <div className="text-white/60 text-[10px] flex justify-between mt-auto">
                        <span>{task.points} pts</span>
                        {task.assignee && <span>{task.assignee}</span>}
                    </div>
                )}
            </div>

            {/* Striped pattern overlay for done tasks? Maybe later. */}
            {task.status === 'Done' && (
                <div className="absolute inset-0 bg-white/10 pointer-events-none" />
            )}
        </div>
    );
};
