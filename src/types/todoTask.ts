export enum TodoTaskStatus {
    OPEN = 'open',
    ACKNOWLEDGED = 'acknowledged',
    PENDING = 'pending',
    COMPLETED = 'completed',
    DROPPED = 'dropped'
}

export interface TaskType {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    name?: string;
    email: string;
}

export interface TodoTask {
    id: string;
    title: string;
    description?: string;
    taskTypeId: string;
    taskType?: TaskType;
    createdById: string;
    createdByUser?: User;
    createdTimestamp: string;
    dueDate?: string;
    assignedToId: string;
    assignedTo?: User;
    acknowledgedTimestamp?: string;
    acknowledgeRemark?: string;
    completedById?: string;
    completedBy?: User;
    completionRemark?: string;
    completedTimestamp?: string;
    pendingRemark?: string;
    pendingTimestamp?: string;
    droppedRemark?: string;
    droppedTimestamp?: string;
    status: TodoTaskStatus;
    createdAt: string;
    updatedAt: string;
}