// Non-linear scaling: Base size + incremental size
// This ensures small tasks are readable, and large tasks don't take up the whole screen.
export const calculateVisualHeight = (points: number) => {
    const base = 16; // Smaller base size (0.5pts -> 20px)
    const scale = 8; // Pixels per point
    return base + (points * scale);
};

const ASSIGNEE_COLORS = [
    'bg-blue-500',    // 1. Classic Blue
    'bg-emerald-500', // 2. Nice Green
    'bg-violet-500',  // 3. Deep Purple
    'bg-rose-500',    // 4. Soft Red
    'bg-amber-500',   // 5. Warm Orange/Yellow
    'bg-cyan-500',    // 6. Bright Teal-ish
    'bg-fuchsia-500', // 7. Pinkish Purple
    'bg-lime-600',    // 8. Distinct Green-Yellow (600 for better contrast)
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
