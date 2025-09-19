// Types for the hierarchical add modal

// Generic entity with ID and name
export interface BaseEntity {
  id: string;
  name: string;
}

// Task Super Entity
export interface TaskSuperEntity extends BaseEntity {
  description?: string;
  rank?: number;
  isNew?: boolean;
}

// Task Group Entity
export interface TaskGroupEntity extends BaseEntity {
  description?: string;
  rank?: number;
  taskSuperId: string;
  taskSuperName?: string;
  isNew?: boolean;
}

// Task Template Entity
export interface TaskTemplateEntity extends BaseEntity {
  description?: string;
  rank?: number;
  budgetedHours?: number;
  taskType: 'story';
  groupId: string;
  groupName?: string;
  isNew?: boolean;
}

// Subtask Template Entity
export interface SubtaskTemplateEntity extends BaseEntity {
  description?: string;
  rank?: number;
  budgetedHours?: number;
  taskType: 'task';
  parentTaskId: string;
  parentTaskName?: string;
  groupId: string;
  groupName?: string;
  isNew?: boolean;
}

// Form values for creating new entities
export interface NewEntityForm {
  name: string;
  description?: string;
  rank?: number;
  budgetedHours?: number;
}

// Props for the hierarchical add modal
export interface HierarchicalAddModalProps {
  visible: boolean;
  onCancel: () => void;
  onAddToProject: (entities: {
    taskSupers: TaskSuperEntity[];
    taskGroups: TaskGroupEntity[];
    taskTemplates: TaskTemplateEntity[];
    subtaskTemplates: SubtaskTemplateEntity[];
  }) => Promise<void>;
  initialTaskSuperId?: string;
  initialTaskGroupId?: string;
  initialTaskTemplateId?: string;
}

// Component-specific state
export interface HierarchicalAddModalState {
  selectedTaskSuperId: string | null;
  selectedTaskGroupId: string | null;
  selectedTaskTemplateId: string | null;
  
  // For creating new entities
  newTaskSuper: NewEntityForm | null;
  newTaskGroup: NewEntityForm | null;
  newTaskTemplate: NewEntityForm | null;
  newSubtaskTemplate: NewEntityForm | null;
  
  // Selected entities for batch processing
  selectedTaskSupers: TaskSuperEntity[];
  selectedTaskGroups: TaskGroupEntity[];
  selectedTaskTemplates: TaskTemplateEntity[];
  selectedSubtaskTemplates: SubtaskTemplateEntity[];
}