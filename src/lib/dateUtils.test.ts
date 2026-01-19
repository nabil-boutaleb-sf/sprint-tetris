import { parseSprintDates } from './dateUtils';

describe('dateUtils', () => {

    // Mock Date to ensure deterministic tests
    const mockDate = new Date(2025, 0, 15); // Jan 15, 2025

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('parses standard date range format correctly within current year', () => {
        // [1/20-1/30] -> Jan 20, 2025 to Jan 30, 2025
        const result = parseSprintDates('Sprint 1 [1/20-1/30]');
        expect(result).not.toBeNull();
        expect(result?.start).toEqual(new Date(2025, 0, 20)); // Months are 0-indexed
        expect(result?.end).toEqual(new Date(2025, 0, 30));
    });

    it('handles year rollover (Dec -> Jan)', () => {
        // [12/22-1/2] -> Dec 22, 2024 to Jan 2, 2025
        // Relative to Jan 15, 2025:
        // Dec 22 is ~25 days ago (should be 2024)
        // Jan 2 is ~13 days ago (should be 2025)

        // Wait, logic says: "Assume current year first" -> 2025.
        // Start: Dec 22, 2025. End: Jan 2, 2025.
        // End < Start -> End gets 2026.
        // Then adjustYear:
        // Start (Dec 22, 2025) vs Now (Jan 15, 2025) -> +11 months -> > 180 days -> Start becomes 2024.
        // End (Jan 2, 2026) vs Now -> +12 months -> > 180 days -> End becomes 2025.
        // Recheck: End (Jan 2, 2025) < Start (Dec 22, 2024)? No.
        // Result: Dec 22, 2024 - Jan 2, 2025. Correct.

        const result = parseSprintDates('Sprint X [12/22-1/2]');
        expect(result).not.toBeNull();
        expect(result?.start.getFullYear()).toBe(2024);
        expect(result?.start.getMonth()).toBe(11); // Dec
        expect(result?.start.getDate()).toBe(22);

        expect(result?.end.getFullYear()).toBe(2025);
        expect(result?.end.getMonth()).toBe(0); // Jan
        expect(result?.end.getDate()).toBe(2);
    });

    it('handles future sprints correctly', () => {
        // [2/15-2/28] (Future relative to Jan 15)
        const result = parseSprintDates('Sprint Y [2/15-2/28]');
        expect(result?.start).toEqual(new Date(2025, 1, 15));
        expect(result?.end).toEqual(new Date(2025, 1, 28));
    });

    it('returns null for invalid format', () => {
        expect(parseSprintDates('Sprint No Dates')).toBeNull();
        expect(parseSprintDates('Sprint [Invalid]')).toBeNull();
    });
});
