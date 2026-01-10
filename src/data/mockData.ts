import { Task } from '@/types';

export const MOCK_TASKS: Task[] = [
    { id: '1', title: 'Implement Login', sprints: ['Sprint 24.1'], points: 3.0, status: 'Done', assignee: 'Alice', color: 'bg-blue-500' },
    { id: '2', title: 'Database Schema Design', sprints: ['Sprint 24.1'], points: 5.0, status: 'Done', assignee: 'Bob', color: 'bg-green-500' },
    { id: '3', title: 'API Gateway Setup', sprints: ['Sprint 24.1', 'Sprint 24.2'], points: 8.0, status: 'In Progress', assignee: 'Charlie', color: 'bg-purple-500' },
    { id: '4', title: 'User Profile UI', sprints: ['Sprint 24.2'], points: 5.0, status: 'In Progress', assignee: 'Alice', color: 'bg-blue-500' },
    { id: '5', title: 'Settings Page', sprints: ['Sprint 24.2'], points: 3.0, status: 'To Do', assignee: 'Bob', color: 'bg-green-500' },
    { id: '6', title: 'Payment Integration', sprints: ['Sprint 24.3'], points: 13.0, status: 'To Do', assignee: 'Charlie', color: 'bg-purple-500' },
    { id: '7', title: 'Email Notifications', sprints: [], points: 2.0, status: 'Backlog', assignee: 'Alice', color: 'bg-blue-500' },
    { id: '8', title: 'Admin Dashboard', sprints: [], points: 8.0, status: 'Backlog', assignee: 'Bob', color: 'bg-green-500' },
    { id: '9', title: 'Mobile Responsive Fixes', sprints: [], points: 1.0, status: 'Backlog', assignee: 'Charlie', color: 'bg-purple-500' },
    { id: '10', title: 'Search Functionality', sprints: ['Sprint 24.3'], points: 5.0, status: 'To Do', assignee: 'Alice', color: 'bg-blue-500' },
    { id: '11', title: 'Audit Logging', sprints: [], points: 3.0, status: 'Backlog', assignee: 'Bob', color: 'bg-green-500' },
    { id: '12', title: 'Performance Optimization', sprints: [], points: 5.0, status: 'Backlog', assignee: 'Charlie', color: 'bg-purple-500' },
    { id: '13', title: 'Deprecated Code Removal', sprints: [], points: 0.5, status: 'Backlog', assignee: 'Alice', color: 'bg-gray-500' },
    { id: '14', title: 'Update Documentation', sprints: [], points: 1.0, status: 'Backlog', assignee: 'Alice', color: 'bg-gray-500' },
    { id: '15', title: 'Fix Typos in Footer', sprints: [], points: 0.5, status: 'Backlog', assignee: 'Bob', color: 'bg-gray-500' },
];

export const SPRINTS = [
    { name: 'Sprint 24.1', capacity: 20 },
    { name: 'Sprint 24.2', capacity: 20 },
    { name: 'Sprint 24.3', capacity: 20 },
];
