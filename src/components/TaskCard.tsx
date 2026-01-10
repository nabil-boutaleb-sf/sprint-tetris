import { Task } from '@/types';
import { calculateTaskHeight } from '@/lib/uiUtils';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
    const height = calculateTaskHeight(task.points);
    const isTiny = height < 28; // Increased threshold slightly for better readability

    return (
        <motion.div
            onClick={onClick}
            style={{ height: `${height}px` }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01, zIndex: 10 }}
            className={clsx(
                'w-full relative overflow-hidden transition-shadow shadow-sm active:shadow-md group',
                // Glass-like styling for tasks but maintaining color identity
                'backdrop-blur-sm border',
                // Use a subtle gradient overlay on the task color
                'bg-gradient-to-br from-white/10 to-transparent',
                task.color || 'bg-slate-700',
                'border-white/10 hover:border-white/30 hover:ring-2 hover:ring-white/20 hover:shadow-lg hover:shadow-purple-500/10',
                isTiny ? 'rounded-sm' : 'rounded-lg' // Sharper edges for small blocks
            )}
        >
            <div className={clsx(
                "h-full flex flex-col justify-center",
                isTiny ? "px-1 items-center" : "px-3 py-2"
            )}>
                {isTiny ? (
                    <div className="flex items-center gap-1 w-full justify-center">
                        <span className="truncate text-white/90 text-[10px] font-bold leading-tight drop-shadow-sm">
                            {task.title}
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Normal Layout */}
                        <div className="flex justify-between items-start gap-1">
                            <span className="font-semibold truncate text-white text-xs leading-snug drop-shadow-sm">
                                {task.title}
                            </span>
                        </div>

                        {/* Footer Info */}
                        <div className="text-white/70 text-[10px] flex justify-between items-center mt-auto font-medium">
                            <span className="bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                {task.points} pts
                            </span>
                            {task.assignee && (
                                <span className="truncate max-w-[50%] opacity-80 hover:opacity-100 transition-opacity">
                                    {task.assignee}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Shimmer Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

            {/* Done Status Overlay */}
            {task.status === 'Done' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-white font-bold text-xs tracking-widest uppercase border border-white/50 px-2 py-1 rounded rotate-[-10deg]">Done</span>
                </div>
            )}
        </motion.div>
    );
};
