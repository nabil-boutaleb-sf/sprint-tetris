import { Task } from '@/types';

export const MOCK_TASKS: Task[] = [
    { id: '1', title: 'Implement Login', sprint: 'Sprint 24.1', points: 3.0, status: 'Done', assignee: 'Alice', color: 'bg-blue-500' },
    { id: '2', title: 'Database Schema Design', sprint: 'Sprint 24.1', points: 5.0, status: 'Done', assignee: 'Bob', color: 'bg-green-500' },
    // Split "API Gateway Setup"
    { id: '3a', title: 'API Gateway Setup (Part 1)', sprint: 'Sprint 24.1', points: 4.0, status: 'In Progress', assignee: 'Charlie', color: 'bg-purple-500' },
    { id: '3b', title: 'API Gateway Setup (Part 2)', sprint: 'Sprint 24.2', points: 4.0, status: 'To Do', assignee: 'Charlie', color: 'bg-purple-500' },

    { id: '4', title: 'User Profile UI', sprint: 'Sprint 24.2', points: 5.0, status: 'In Progress', assignee: 'Alice', color: 'bg-blue-500' },
    { id: '5', title: 'Settings Page', sprint: 'Sprint 24.2', points: 3.0, status: 'To Do', assignee: 'Bob', color: 'bg-green-500' },
    { id: '6', title: 'Payment Integration', sprint: 'Sprint 24.3', points: 13.0, status: 'To Do', assignee: 'Charlie', color: 'bg-purple-500' },

    // Backlog items (sprint: null)
    { id: '7', title: 'Email Notifications', sprint: null, points: 2.0, status: 'Backlog', assignee: 'Alice', color: 'bg-blue-500' },
    { id: '8', title: 'Admin Dashboard', sprint: null, points: 8.0, status: 'Backlog', assignee: 'Bob', color: 'bg-green-500' },
    { id: '9', title: 'Mobile Responsive Fixes', sprint: null, points: 1.0, status: 'Backlog', assignee: 'Charlie', color: 'bg-purple-500' },
    { id: '10', title: 'Search Functionality', sprint: 'Sprint 24.3', points: 5.0, status: 'To Do', assignee: 'Alice', color: 'bg-blue-500' },
    { id: '11', title: 'Audit Logging', sprint: null, points: 3.0, status: 'Backlog', assignee: 'Bob', color: 'bg-green-500' },
    { id: '12', title: 'Performance Optimization', sprint: null, points: 5.0, status: 'Backlog', assignee: 'Charlie', color: 'bg-purple-500' },
    { id: '13', title: 'Deprecated Code Removal', sprint: null, points: 0.5, status: 'Backlog', assignee: 'Alice', color: 'bg-gray-500' },
    { id: '14', title: 'Update Documentation', sprint: null, points: 1.0, status: 'Backlog', assignee: 'Alice', color: 'bg-gray-500' },
    { id: '15', title: 'Fix Typos in Footer', sprint: null, points: 0.5, status: 'Backlog', assignee: 'Bob', color: 'bg-gray-500' },
];

export const SPRINTS = [
    { name: 'Sprint 24.1', capacity: 50 },
    { name: 'Sprint 24.2', capacity: 50 },
    { name: 'Sprint 24.3', capacity: 50 },
];
