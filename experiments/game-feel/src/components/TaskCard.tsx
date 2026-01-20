import { Task } from '@/types';
import { calculateVisualHeight, getAssigneeColorClass } from '@/lib/uiUtils';
import clsx from 'clsx';

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
    const height = calculateVisualHeight(task.points);

    // "Tiny Mode" for anything less than 24px (roughly < 0.6 pts)
    const isTiny = height < 24;

    // Determine color: Manual override > Assignee color > Default slate
    const colorClass = task.color || (task.assignee ? getAssigneeColorClass(task.assignee) : 'bg-slate-700');

    return (
        <div
            onClick={onClick}
            style={{ height: `${height}px` }}
            data-debug-height={height}
            data-points={task.points}
            className={clsx(
                'w-full rounded-md relative overflow-hidden transition-all duration-200 hover:brightness-110 shadow-sm border border-white/5',
                colorClass,
                'group cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-white/20',
                // Remove mb-1, gap handles spacing now.
            )}
        >
            <div className={clsx(
                "h-full flex flex-col justify-center",
                isTiny ? "px-1 py-0 items-center text-center" : "px-2 py-1"
            )}>
                {isTiny ? (
                    // TINY MODE: Just title, centered vertically
                    <span className="truncate text-white/90 w-full block text-[10px] font-medium leading-none">
                        {task.title}
                    </span>
                ) : (
                    // NORMAL MODE
                    <>
                        <div className="flex justify-between items-start">
                            <span className="font-semibold truncate text-white/90 w-full text-xs">{task.title}</span>
                        </div>
                        <div className="text-white/60 text-[10px] flex justify-between mt-auto">
                            <span>{task.points} pts</span>
                            {task.assignee && <span>{task.assignee}</span>}
                        </div>
                    </>
                )}
            </div>

            {/* Striped pattern overlay for done tasks? Maybe later. */}
            {task.status === 'Done' && (
                <div className="absolute inset-0 bg-white/10 pointer-events-none" />
            )}
        </div>
    );
};
