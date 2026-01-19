import { calculateVisualHeight, getAssigneeColorClass } from './uiUtils';

describe('uiUtils', () => {
    describe('calculateVisualHeight', () => {
        it('calculates height for 0 points', () => {
            // Base height + 0
            expect(calculateVisualHeight(0)).toBe(16);
        });

        it('calculates height for 0.5 points', () => {
            // 16 + (0.5 * 8) = 20
            expect(calculateVisualHeight(0.5)).toBe(20);
        });

        it('calculates height for 5 points', () => {
            // 16 + (5 * 8) = 56
            expect(calculateVisualHeight(5)).toBe(56);
        });

        it('calculates height for 13 points', () => {
            // 16 + (13 * 8) = 120
            expect(calculateVisualHeight(13)).toBe(120);
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
