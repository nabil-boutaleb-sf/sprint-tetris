export const POINTS_TO_PIXELS = 40; // 1 point = 40px (Strict Mode)

export const calculateTaskHeight = (points: number) => {
    return Math.max((points * POINTS_TO_PIXELS) - 1, 10); // Subtract 1px for gap
};

export const calculateCapacityHeight = (capacity: number) => {
    return capacity * POINTS_TO_PIXELS;
}

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
