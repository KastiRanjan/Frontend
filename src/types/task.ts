import { ProjectType } from "./project";

export interface TaskType {
    id: number;
    name: string;
    description?: string;
    dueDate?: string;
    project?:ProjectType
    subTasks:TaskType[];
    createdAt?: string;
    updatedAt?: string;
    groupProject?: any; // TaskGroupProject with taskSuper
    assignees?: string[];
    status?: "open" | "in_progress" | "done" | "first_verified" | "second_verified";
    priority?: "critical" | "high" | "medium" | "low";
    tcode?: string;
    taskType?: "story" | "task";
    completedBy?: string;
    completedAt?: string;
    firstVerifiedBy?: string;
    firstVerifiedAt?: string;
    secondVerifiedBy?: string;
    secondVerifiedAt?: string;
    budgetedHours?: number;
  }