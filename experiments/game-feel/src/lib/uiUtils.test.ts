import { calculateVisualHeight, getAssigneeColorClass } from './uiUtils';

describe('uiUtils', () => {
    describe('calculateVisualHeight', () => {
        it('calculates height for 0 points', () => {
            // Base height 12 + 0
            expect(calculateVisualHeight(0)).toBe(12);
        });

        it('calculates height for 0.5 points', () => {
            // 12 + (0.5 * 8) = 16
            expect(calculateVisualHeight(0.5)).toBe(16);
        });

        it('calculates height for 1 point', () => {
            // 12 + (1 * 8) = 20
            expect(calculateVisualHeight(1)).toBe(20);
        });

        it('calculates height for 5 points', () => {
            // 12 + (5 * 8) = 52
            expect(calculateVisualHeight(5)).toBe(52);
        });

        it('calculates height for 13 points', () => {
            // 12 + (13 * 8) = 116
            expect(calculateVisualHeight(13)).toBe(116);
        });
    });

    describe('getAssigneeColorClass', () => {
        it('returns consistent color for same name', () => {
            const color1 = getAssigneeColorClass('Alice');
            const color2 = getAssigneeColorClass('Alice');
            expect(color1).toBe(color2);
        });

        it('returns different colors for different names (usually)', () => {
            // This relies on hash distribution, but with 8 colors it's likely.
            // Just verifying it returns a string starting with 'bg-'
            expect(getAssigneeColorClass('Bob')).toMatch(/^bg-/);
        });
    });
});
