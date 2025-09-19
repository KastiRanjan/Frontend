export interface TaskSuperType {
  id: string;
  name: string;
  description: string;
  rank: number;
  taskGroups?: TaskGroupType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskGroupType {
  id: string;
  name: string;
  description: string;
  rank: number;
  taskSuperId?: string;
  taskSuper?: TaskSuperType;
  taskTemplates?: any[];
  tasktemplate?: any[]; // Added for backend consistency
  createdAt?: string;
  updatedAt?: string;
}