// Shared types for TaskGroup components
import { TaskGroupType } from '@/types/taskSuper';

// Interface for the project assignment form
export interface ProjectAssignmentFormValues {
  projectId: string;
  suffixTaskSuper: string;
  suffixTaskGroup: string;
  suffixTaskTemplate: string;
}

// Interface for an item in the preview list
export interface PreviewItemType {
  id: string;
  type: 'taskSuper' | 'taskGroup' | 'template' | 'subtask';
  originalName: string;
  name: string;
  budgetedHours: number;
  description?: string;
  parentId?: string;
  groupId?: string;
  templateId?: string;
  taskSuperId?: string;
  taskType?: 'story' | 'task';
  parentTemplateId?: string; // Explicit reference to parent template
  parentTaskType?: 'story' | 'task'; // Type of the parent
  rank?: number; // Property for ordering
  isSubtask?: boolean; // Flag to explicitly mark as subtask
  isTemplate?: boolean; // Flag to explicitly mark as template
  isImplicitParent?: boolean; // Flag to mark templates added implicitly as parents
  isDuplicate?: boolean; // Flag to mark items with duplicate names detected by backend
}

// Props for task groups table
export interface TaskGroupsTableProps {
  taskSuperId: string;
  onEdit?: (id: string) => void;
  data?: TaskGroupType[];
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Props for expanded row view (templates)
export interface TemplateExpandedViewProps {
  record: TaskGroupType;
  selectedTemplateRows: Record<string, React.Key[]>;
  setSelectedTemplateRows: (value: Record<string, React.Key[]>) => void;
  selectedSubtaskRows: Record<string, React.Key[]>;
  setSelectedSubtaskRows: (value: Record<string, React.Key[]>) => void;
  handleAddTemplate: (record: TaskGroupType) => void;
  handleEditTemplate: (template: any) => void;
  handleDeleteTemplate: (templateId: string) => void;
}

// Props for project assignment modal
export interface ProjectAssignmentModalProps {
  visible: boolean;
  onCancel: () => void;
  taskSuperId: string;
  selectedGroups: React.Key[];
  selectedTemplateRows: Record<string, React.Key[]>;
  selectedSubtaskRows: Record<string, React.Key[]>;
  taskGroups: TaskGroupType[];
  onSuccess: (projectId: string) => void;
}

// Props for review screen
export interface ReviewScreenProps {
  projectAssignmentData: {
    projectId: string;
    suffixTaskSuper: string;
    suffixTaskGroup: string;
    suffixTaskTemplate: string;
    items: PreviewItemType[];
  };
  handleUpdatePreviewItem: (itemId: string, field: 'name' | 'budgetedHours', value: string | number) => void;
  handleBackToStep1: () => void;
  handleAddToProjectSubmit: () => void;
  submittingAddToProject: boolean;
}