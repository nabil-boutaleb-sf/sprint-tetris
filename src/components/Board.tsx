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
    const [selectedTask, setSelectedTask] = useState<Task | null>(null); // For Modal

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
        let sprintTasks = tasks.filter(t => t.sprints.includes(sprintName));
        if (filterAssignee) {
            sprintTasks = sprintTasks.filter(t => t.assignee === filterAssignee);
        }
        return sprintTasks;
    };
    const backlogTasks = tasks.filter(t => {
        const isBacklog = t.sprints.length === 0;
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
        const targetName = over.data.current?.name; // Sprint Name 

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
            <div className="flex h-screen w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-sans selection:bg-purple-500/30 transition-colors duration-300">

                {/* Backlog Sidebar - Left Side */}
                <BacklogArea
                    tasks={backlogTasks}
                    onTaskClick={setSelectedTask}
                />

                {/* Main Board Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="px-8 py-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Sprint Tetris Logo" className="w-10 h-10 rounded-lg shadow-sm" />
                            <div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                                    Sprint Tetris
                                </h1>
                                <p className="text-slate-500 text-sm">Capacity Visualization</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <select
                                className="bg-slate-100 dark:bg-slate-800 border-none text-sm rounded-md px-3 py-2 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                value={filterAssignee || ''}
                                onChange={(e) => setFilterAssignee(e.target.value || null)}
                            >
                                <option value="">All Assignees</option>
                                {/* Unique assignees */}
                                {Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))).map(assignee => (
                                    <option key={assignee} value={assignee as string}>{assignee}</option>
                                ))}
                            </select>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
                        <div className="flex gap-6 h-full pb-20">
                            {sprints.map(sprint => (
                                <DroppableSprintColumn
                                    key={sprint.name}
                                    name={sprint.name}
                                    tasks={getTasksForSprint(sprint.name)}
                                    onTaskClick={setSelectedTask}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Drag Overlay for smooth visuals */}
                <DragOverlay>
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
