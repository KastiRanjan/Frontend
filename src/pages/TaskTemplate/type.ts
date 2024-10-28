import { TaskGroup } from "../TaskGroup/type";

export type TaskTemplateType = {
  id: string;
  createdBy: null;
  updatedBy: null;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string | null;
  group: TaskGroup;
};
