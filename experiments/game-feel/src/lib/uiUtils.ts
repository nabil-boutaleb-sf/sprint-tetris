// Non-linear scaling: Base size + incremental size
// This ensures small tasks are readable, and large tasks don't take up the whole screen.
export const calculateVisualHeight = (points: number) => {
    // New Scaling:
    // 0 pts -> 12px (Tiny)
    // 0.5 pts -> 16px (Tiny)
    // 1 pts -> 20px (Tiny)
    // 2 pts -> 28px
    // 3 pts -> 36px
    // 5 pts -> 52px
    const base = 12;
    const scale = 8;
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
