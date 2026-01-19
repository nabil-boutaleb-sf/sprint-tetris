export type SprintName = string;

export interface Task {
    id: string;
    title: string;
    sprint: SprintName | null; // Can belong to ONE sprint (or null for Backlog)
    points: number;
    status: 'To Do' | 'In Progress' | 'Done' | 'Backlog';
    assignee?: string;
    color?: string; // Optional visual override
    description?: string; // HTML description from Asana
}

export interface SprintColumnData {
    name: SprintName;
    capacity: number;
    tasks: Task[];
    totalPoints: number;
}

export interface Sprint {
    name: string;
    capacity: number;
    assigneeCapacities: Record<string, number>;
}
