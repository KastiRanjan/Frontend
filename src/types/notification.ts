// Notification types matching backend enum
export enum NotificationType {
    WORKLOG = 'worklog',
    NOTICEBOARD = 'noticeboard',
    TASK = 'task',
    PROJECT = 'project',
    GENERAL = 'general'
}

// Notification interface
export interface Notification {
    id: string;
    message: string;
    link?: string;
    type: NotificationType;
    createdAt: string;
}

// User notification interface (what we get from backend)
export interface UserNotification {
    id: string;
    notification: Notification;
    isRead: boolean;
    isArchived: boolean;
    createdAt: string;
    user: {
        id: string;
        name?: string;
        email?: string;
    };
}
