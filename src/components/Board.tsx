'use client';

import { useBoardStore } from '@/store/boardStore';
import { DroppableSprintColumn } from './DroppableSprintColumn';
import { BacklogArea } from './BacklogArea';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '@/types';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';
import Link from 'next/link';
import { AssigneeLegend } from './AssigneeLegend';
import { useDataSync } from '@/hooks/useDataSync';

export default function Board() {
    const { tasks, sprints, moveTask, filterAssignee, setFilterAssignee, isDemoMode } = useBoardStore();
    const { refreshData, isSyncing } = useDataSync();

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

    // Sync state with DOM on mount (to respect layout.tsx script)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        }
    }, []);

    // Theme Toggle Logic
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
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
        const isBacklog = !t.sprint; // null or undefined or empty string
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
                    {/* Header */}
                    <header className="px-8 py-5 flex justify-between items-center bg-white dark:bg-zinc-900 border-b-2 border-slate-100 dark:border-zinc-800 m-4 rounded-2xl shadow-sm shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                                <img src="/logo.png" alt="Sprint Tetris Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                        Sprint Tetris
                                    </h1>
                                    {isDemoMode && (
                                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-amber-200 dark:border-amber-800 self-center">
                                            Demo
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">

                            <AssigneeLegend />

                            <div className="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-2" />

                            <Link
                                href="/manage"
                                className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-purple-600 px-3 py-2 transition-colors"
                            >
                                Manage Sprints
                            </Link>

                            <button
                                onClick={refreshData}
                                disabled={isSyncing}
                                className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-500 ${isSyncing ? 'animate-spin' : ''}`}
                                title="Refresh Data from Asana"
                            >
                                <RefreshCw size={20} />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-500"
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
                            <div className="w-2 shrink-0" />
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
