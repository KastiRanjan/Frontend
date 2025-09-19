import { TaskType } from "./task";
import { UserType } from "./user";

export interface WorklogType {
  id: number;
  description: string;
  startTime: string;
  endTime: string;
  status: 'requested' | 'approved' | 'rejected';
  user?: UserType;
  task?: TaskType;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string;
}
