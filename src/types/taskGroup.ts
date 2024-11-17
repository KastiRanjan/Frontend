import { TaskTemplateType } from "./taskTemplate";

export interface TaskGroupType {
    id: string;
    name?: string;
    description?: string;
    tasktemplate?: TaskTemplateType[];
    createdAt?: string
    updatedAt?: string
}