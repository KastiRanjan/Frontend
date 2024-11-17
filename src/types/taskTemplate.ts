import { TaskGroupType } from "./taskGroup";

export interface TaskTemplateType {
    id: number;
    name: string;
    description: string;
    taskgroup?: TaskGroupType;
}