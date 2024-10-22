export interface TaskGroup {
  id: number;
  name: string;
  description: string;
  tasktemplate: TaskTemplate[];
}

export interface TaskTemplate {
  id: number;
  name: string;
  description: string;
}
