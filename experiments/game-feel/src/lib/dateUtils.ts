export const parseSprintDates = (name: string): { start: Date, end: Date } | null => {
    const match = name.match(/\[(\d{1,2})\/(\d{1,2})-(\d{1,2})\/(\d{1,2})\]/);
    if (!match) return null;

    const [_, m1, d1, m2, d2] = match;
    const now = new Date();
    const currentYear = now.getFullYear();

    // Construct dates (assume current year first)
    let start = new Date(currentYear, parseInt(m1) - 1, parseInt(d1));
    let end = new Date(currentYear, parseInt(m2) - 1, parseInt(d2));

    // Handle Year Rollover (e.g. Dec -> Jan)
    // If end month is earlier than start month, end date is next year
    if (end < start) {
        end.setFullYear(currentYear + 1);
    }

    // Better Heuristic: Check relative to NOW.
    // If the resulting date is > 180 days in future, subtract 1 year.
    // If the resulting date is < -180 days in past, add 1 year.

    const adjustYear = (d: Date) => {
        const diff = d.getTime() - now.getTime();
        const daysDiff = diff / (1000 * 3600 * 24);
        if (daysDiff > 180) d.setFullYear(d.getFullYear() - 1);
        else if (daysDiff < -180) d.setFullYear(d.getFullYear() + 1);
        return d;
    };

    start = adjustYear(start);
    end = adjustYear(end);

    // Re-check end year rollover after adjustment
    if (end < start) end.setFullYear(start.getFullYear() + 1);

    return { start, end };
};
