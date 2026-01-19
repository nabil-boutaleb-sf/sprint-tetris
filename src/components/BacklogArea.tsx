import { useDroppable } from '@dnd-kit/core';
import { DraggableTask } from './DraggableTask';
import { Task } from '@/types';
import clsx from 'clsx';
import { useBoardStore } from '@/store/boardStore';

interface BacklogAreaProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export const BacklogArea = ({ tasks, onTaskClick }: BacklogAreaProps) => {
    const { isBacklogOpen, toggleBacklog } = useBoardStore();
    const { setNodeRef, isOver } = useDroppable({
        id: 'backlog',
        data: { type: 'backlog' },
    });

    return (
        <div
            className={clsx(
                "border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 transition-all duration-300 ease-in-out flex flex-col h-full",
                isBacklogOpen ? "w-80 translate-x-0" : "w-12 translate-x-0" // Minimized state vs Hidden
            )}
        >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center h-16">
                {isBacklogOpen && (
                    <>
                        <div>
                            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Backlog</h2>
                            <span className="text-xs text-slate-500">{tasks.length} items</span>
                        </div>
                    </>
                )}
                <button
                    onClick={toggleBacklog}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                >
                    {isBacklogOpen ? '<<' : '>>'}
                </button>
            </div>

            <div
                ref={setNodeRef}
                className={clsx(
                    "p-4 overflow-y-auto flex-1 space-y-2 transition-colors",
                    isOver && "bg-purple-50 dark:bg-purple-900/20",
                    !isBacklogOpen && "hidden"
                )}
                style={{ minHeight: '200px' }}
            >
                {tasks.map(task => (
                    <div key={task.id} className="relative">
                        <DraggableTask task={task} onTaskClick={() => onTaskClick(task)} />
                    </div>
                ))}
            </div>

            {/* Vertical text when closed */}
            {!isBacklogOpen && (
                <div className="flex-1 flex items-center justify-center writing-vertical-rl rotate-180 text-slate-400 font-bold tracking-widest py-8">
                    BACKLOG
                </div>
            )}
        </div>
    );
};
