import { ProjectType } from "./project";
import { TaskGroupType } from "./taskGroup";

export interface TaskType {
    id: number;
    name: string;
    description?: string;
    dueDate?: string;
    project?:ProjectType
    subTasks:TaskType[]
    group: TaskGroupType;
    assignees?: string[];
    status?: "open" | "in_progress" | "done";
    priority?: "critical" | "high" | "medium" | "low";
    tcode?: string;
    taskType?: "story" | "task";
  }