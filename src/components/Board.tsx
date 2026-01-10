'use client';

import { useBoardStore } from '@/store/boardStore';
import { DroppableSprintColumn } from './DroppableSprintColumn';
import { BacklogArea } from './BacklogArea';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '@/types';
import { Moon, Sun } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';
import Link from 'next/link';
import { AssigneeLegend } from './AssigneeLegend';

export default function Board() {
    const { tasks, sprints, moveTask, filterAssignee, setFilterAssignee } = useBoardStore();

    // Drag Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Theme Toggle Logic
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Data Selectors
    const getTasksForSprint = (sprintName: string) => {
        let sprintTasks = tasks.filter(t => t.sprint === sprintName);
        if (filterAssignee) {
            sprintTasks = sprintTasks.filter(t => t.assignee === filterAssignee);
        }
        return sprintTasks;
    };
    const backlogTasks = tasks.filter(t => {
        const isBacklog = !t.sprint;
        if (filterAssignee) return isBacklog && t.assignee === filterAssignee;
        return isBacklog;
    });

    // DnD Handlers
    const handleDragStart = (event: any) => {
        setActiveDragTask(event.active.data.current.task);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const targetType = over.data.current?.type;
        const targetName = over.data.current?.name;

        if (targetType === 'backlog') {
            moveTask(taskId, null);
        } else if (targetType === 'sprint' && targetName) {
            moveTask(taskId, targetName);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-screen w-full overflow-hidden font-sans selection:bg-purple-500/30 text-slate-100">

                {/* Backlog Sidebar */}
                <BacklogArea
                    tasks={backlogTasks}
                    onTaskClick={setSelectedTask}
                />

                {/* Main Board Area */}
                <div className="flex-1 flex flex-col min-w-0 relative z-10">
                    {/* Header */}
                    <header className="px-8 py-5 flex justify-between items-center glass border-b-0 m-4 rounded-2xl shadow-lg shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform rotate-3">
                                <span className="text-2xl">🧩</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 drop-shadow-sm">
                                    Sprint Tetris
                                </h1>
                                <p className="text-white/60 text-xs font-medium tracking-wide uppercase">Capacity Visualization</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">

                            {/* Legend Filter */}
                            <AssigneeLegend />

                            {/* Separator */}
                            <div className="w-px h-6 bg-white/10 mx-1" />

                            {/* Management Link */}
                            <Link
                                href="/manage"
                                className="group relative px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Manage Sprints"
                            >
                                <span className="text-xl">⚙️</span>
                                <span className="absolute top-10 right-0 w-max px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm">
                                    Manage Sprints
                                </span>
                            </Link>

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                    </header>

                    {/* Horizontal Scrollable Area */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4">
                        <div className="flex gap-6 h-full items-start pt-2 px-2">
                            {sprints.map(sprint => (
                                <DroppableSprintColumn
                                    key={sprint.name}
                                    name={sprint.name}
                                    tasks={getTasksForSprint(sprint.name)}
                                    onTaskClick={setSelectedTask}
                                />
                            ))}
                            {/* Spacer for right padding */}
                            <div className="w-2 shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay dropAnimation={{
                    duration: 200,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeDragTask ? (
                        <div className="opacity-90 rotate-2 scale-105 cursor-grabbing w-[280px]">
                            <TaskCard task={activeDragTask} />
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Task Details Modal */}
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            </div>
        </DndContext>
    );
}
