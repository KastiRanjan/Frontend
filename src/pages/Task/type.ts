import { UserType } from "@/hooks/user/type";
import { TaskGroup } from "../TaskGroup/type";
import { Project } from "../Project/type";

export interface TaskType {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  status: string;
  description: string;
  assignees: UserType[];
  dueDate: string | null;
  group: TaskGroup | null;
  subTasks: TaskType[] | [];
  project?: Project;
}
