import { TaskTemplateType } from "./taskTemplate";
import { TaskSuperType } from "./taskSuper";

export interface TaskGroupType {
    id: string;
    name?: string;
    description?: string;
    tasktemplate?: TaskTemplateType[];
    taskTemplates?: TaskTemplateType[];
    taskSuper?: TaskSuperType;
    taskSuperId?: string;
    rank?: number;
    createdAt?: string;
    updatedAt?: string;
}