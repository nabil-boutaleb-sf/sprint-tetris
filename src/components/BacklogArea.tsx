import { useDroppable } from '@dnd-kit/core';
import { DraggableTask } from './DraggableTask';
import { Task } from '@/types';
import clsx from 'clsx';
import { useBoardStore } from '@/store/boardStore';
import { motion, AnimatePresence } from 'framer-motion';

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
        <motion.div
            initial={false}
            animate={{ width: isBacklogOpen ? 320 : 64 }}
            className={clsx(
                "border-r border-white/10 bg-black/20 backdrop-blur-xl flex flex-col h-full shrink-0 z-20 shadow-xl",
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center h-16 shrink-0 z-10 glass bg-opacity-10">
                <AnimatePresence mode='wait'>
                    {isBacklogOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className='overflow-hidden whitespace-nowrap'
                        >
                            <h2 className="font-bold text-white/90 tracking-wide text-lg">Backlog</h2>
                            <span className="text-xs text-white/50 font-mono">{tasks.length} tasks</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggleBacklog}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                >
                    {isBacklogOpen ? '<<' : '>>'}
                </button>
            </div>

            {/* Content */}
            <div
                ref={setNodeRef}
                className={clsx(
                    "p-3 overflow-y-auto overflow-x-hidden flex-1 space-y-2 transition-colors scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                    isOver ? "bg-purple-500/10 ring-inset ring-2 ring-purple-500/30" : "",
                    !isBacklogOpen && "overflow-hidden" // Hide scrollbar when closed
                )}
            >
                <AnimatePresence>
                    {isBacklogOpen && tasks.map(task => (
                        <DraggableTask key={task.id} task={task} onTaskClick={() => onTaskClick(task)} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Vertical text when closed */}
            {!isBacklogOpen && (
                <div className="flex-1 flex items-center justify-center writing-vertical-rl rotate-180 text-white/20 font-bold tracking-[0.3em] py-12 pointer-events-none select-none text-xl">
                    BACKLOG
                </div>
            )}
        </motion.div>
    );
};
