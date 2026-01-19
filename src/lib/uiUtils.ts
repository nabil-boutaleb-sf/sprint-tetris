// Non-linear scaling: Base size + incremental size
// This ensures small tasks are readable, and large tasks don't take up the whole screen.
export const calculateVisualHeight = (points: number) => {
    const base = 28; // Minimum usable height for title
    const scale = 8; // Pixels per point
    return base + (points * scale);
};

const ASSIGNEE_COLORS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

export const getAssigneeColorClass = (name: string): string => {
    if (!name) return 'bg-slate-500';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % ASSIGNEE_COLORS.length;
    return ASSIGNEE_COLORS[index];
};
