export type SprintName = string;

export interface Task {
    id: string;
    title: string;
    sprints: SprintName[]; // Can belong to multiple sprints
    points: number;
    status: 'To Do' | 'In Progress' | 'Done' | 'Backlog';
    assignee?: string;
    color?: string; // Optional visual override
}

export interface SprintColumnData {
    name: SprintName;
    capacity: number;
    tasks: Task[];
    totalPoints: number;
}
