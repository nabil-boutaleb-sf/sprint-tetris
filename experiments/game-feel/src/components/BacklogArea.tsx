import { useDroppable } from '@dnd-kit/core';
import { DraggableTask } from './DraggableTask';
import { Task } from '@/types';
import clsx from 'clsx';
import { useBoardStore } from '@/store/boardStore';
import { Plus } from 'lucide-react';

interface BacklogAreaProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export const BacklogArea = ({ tasks, onTaskClick }: BacklogAreaProps) => {
    const { addTask } = useBoardStore();
    const { setNodeRef, isOver } = useDroppable({
        id: 'backlog',
        data: { type: 'backlog' },
    });

    const handleCreateTask = () => {
        const newTask: Task = {
            // Simple ID generator safe for client
            id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            title: 'New Task',
            points: 0,
            status: 'Backlog',
            sprint: null,
            description: ''
        };
        addTask(newTask);
        onTaskClick(newTask);
    };

    return (
        <div
            className={clsx(
                "border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col h-full w-80 shrink-0"
            )}
        >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center h-16">
                <div>
                    <h2 className="font-semibold text-slate-700 dark:text-slate-300">Backlog</h2>
                    <span className="text-xs text-slate-500">{tasks.length} items</span>
                </div>

                <button
                    onClick={handleCreateTask}
                    className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                    title="Create New Task"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div
                ref={setNodeRef}
                className={clsx(
                    "p-4 overflow-y-auto flex-1 space-y-2 transition-colors",
                    isOver && "bg-purple-50 dark:bg-purple-900/20"
                )}
                style={{ minHeight: '200px' }}
            >
                {tasks.map(task => (
                    <div key={task.id} className="relative">
                        <DraggableTask task={task} onTaskClick={() => onTaskClick(task)} />
                    </div>
                ))}
            </div>
        </div>
    );
};
