export const POINTS_TO_PIXELS = 20; // 1 point = 20px

export const calculateTaskHeight = (points: number) => {
    return Math.max(points * POINTS_TO_PIXELS, 10); // Minimum 10px height
};

export const calculateCapacityHeight = (capacity: number) => {
    return capacity * POINTS_TO_PIXELS;
}
