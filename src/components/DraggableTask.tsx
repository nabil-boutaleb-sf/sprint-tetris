import { useDraggable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { Task } from '@/types';

interface DraggableTaskProps {
    task: Task;
    onTaskClick?: () => void;
}

export const DraggableTask = ({ task, onTaskClick }: DraggableTaskProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragging ? 0.8 : 1,
        cursor: 'grabbing',
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
            <TaskCard task={task} onClick={onTaskClick} />
        </div>
    );
};
