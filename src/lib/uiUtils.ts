export const POINTS_TO_PIXELS = 40; // 1 point = 40px (Strict Mode)

export const calculateTaskHeight = (points: number) => {
    return Math.max((points * POINTS_TO_PIXELS) - 1, 10); // Subtract 1px for gap
};

export const calculateCapacityHeight = (capacity: number) => {
    return capacity * POINTS_TO_PIXELS;
}
