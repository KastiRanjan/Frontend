import { TaskGroupType } from "./taskGroup";

export interface TaskTemplateType {
    id: number | string;
    name: string;
    description: string;
    taskgroup?: TaskGroupType;
    taskType?: "story" | "task";
    parentTask?: TaskTemplateType;
    subTasks?: TaskTemplateType[];
    budgetedHours?: number;
    status?: string;
    rank?: number;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
}