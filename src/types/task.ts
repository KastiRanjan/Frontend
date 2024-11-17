import { ProjectType } from "./project";
import { TaskGroupType } from "./taskGroup";

export interface TaskType {
    id: number;
    name: string;
    description?: string;
    dueDate?: string;
    project?:ProjectType
    subTasks:TaskType[]
    group: TaskGroupType
  }