export interface TaskGroup {
  id: string;
  name?: string;
  description?: string;
  tasktemplate?: TaskTemplate[];
  createdAt?: string
  updatedAt?: string
}

export interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  taskgroup: TaskGroup;
}
