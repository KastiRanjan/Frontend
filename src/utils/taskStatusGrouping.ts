import { TaskType } from "@/types/task";

/**
 * Groups tasks by status while maintaining parent-subtask relationships.
 * If a parent task is in one status but its subtasks are in different statuses,
 * the parent will appear in each status category where its subtasks exist.
 * 
 * @param tasks - Array of tasks with potential parent-subtask relationships
 * @param targetStatus - The status to filter by ('open', 'in_progress', 'done')
 * @returns Array of tasks filtered by status with parent tasks included where needed
 */
export function groupTasksByStatus(tasks: TaskType[], targetStatus: string): TaskType[] {
  if (!tasks || tasks.length === 0) return [];

  const result: TaskType[] = [];
  const addedParentIds = new Set<number>();

  // First, collect all parent tasks (stories)
  const parentTasks = tasks.filter(task => task.taskType === 'story');
  
  // Build a map of parent tasks by ID for quick lookup
  const parentTaskMap = new Map<number, TaskType>();
  parentTasks.forEach(task => {
    parentTaskMap.set(task.id, task);
  });

  // Process each parent task
  parentTasks.forEach(parentTask => {
    // Get subtasks for this parent (if any)
    const subtasksForThisParent = parentTask.subTasks || [];
    
    // Filter subtasks by target status
    const matchingSubtasks = subtasksForThisParent.filter(
      subtask => subtask.status === targetStatus
    );

    // Case 1: Parent has no subtasks - show it if it matches the status
    if (subtasksForThisParent.length === 0) {
      if (parentTask.status === targetStatus) {
        result.push(parentTask);
        addedParentIds.add(parentTask.id);
      }
    }
    // Case 2: Parent has subtasks - show parent with filtered subtasks if any subtasks match
    else if (matchingSubtasks.length > 0) {
      // Add parent with filtered subtasks
      result.push({
        ...parentTask,
        subTasks: matchingSubtasks
      });
      addedParentIds.add(parentTask.id);
    }
    // Case 3: Parent has subtasks but none match the status - check if parent itself matches
    else if (parentTask.status === targetStatus) {
      // Show parent without subtasks
      result.push({
        ...parentTask,
        subTasks: []
      });
      addedParentIds.add(parentTask.id);
    }
  });

  // Also handle standalone subtasks (tasks with taskType='task' but no parent reference in the array)
  const standaloneSubtasks = tasks.filter(task => {
    // Check if it's a subtask type
    if (task.taskType !== 'task') return false;
    
    // Check if its parent is not in the current tasks array
    const parentId = task.parentTask?.id;
    if (!parentId) return true; // No parent reference, treat as standalone
    
    // Check if parent exists in our tasks
    return !parentTaskMap.has(parentId);
  });

  // Add standalone subtasks that match the status
  standaloneSubtasks.forEach(subtask => {
    if (subtask.status === targetStatus) {
      result.push(subtask);
    }
  });

  return result;
}

/**
 * Counts tasks by status while considering parent-subtask relationships.
 * This counts the ACTUAL number of rows that will be displayed in the table.
 * 
 * @param tasks - Array of tasks with potential parent-subtask relationships
 * @param targetStatus - The status to count ('open', 'in_progress', 'done')
 * @returns Count of parent tasks that will be shown (each parent counts as 1, regardless of subtask count)
 */
export function countTasksByStatus(tasks: TaskType[], targetStatus: string): number {
  if (!tasks || tasks.length === 0) return 0;

  let count = 0;

  // Collect all parent tasks (stories)
  const parentTasks = tasks.filter(task => task.taskType === 'story');
  
  // Build a map of parent tasks by ID for quick lookup
  const parentTaskMap = new Map<number, TaskType>();
  parentTasks.forEach(task => {
    parentTaskMap.set(task.id, task);
  });

  // Count parent tasks that will be shown
  parentTasks.forEach(parentTask => {
    const subtasksForThisParent = parentTask.subTasks || [];
    
    // Case 1: Parent has no subtasks - count if it matches the status
    if (subtasksForThisParent.length === 0) {
      if (parentTask.status === targetStatus) {
        count++;
      }
    }
    // Case 2: Parent has subtasks - count if any subtask matches (parent will be shown with filtered subtasks)
    else {
      const matchingSubtasks = subtasksForThisParent.filter(
        subtask => subtask.status === targetStatus
      );
      
      if (matchingSubtasks.length > 0) {
        count++; // Count the parent once (it will show with its matching subtasks)
      }
      // Case 3: No subtasks match but parent itself matches
      else if (parentTask.status === targetStatus) {
        count++; // Count the parent once (it will show without subtasks)
      }
    }
  });

  // Count standalone subtasks (tasks without parents in the array)
  const standaloneSubtasks = tasks.filter(task => {
    if (task.taskType !== 'task') return false;
    const parentId = task.parentTask?.id;
    if (!parentId) return true;
    return !parentTaskMap.has(parentId);
  });

  standaloneSubtasks.forEach(subtask => {
    if (subtask.status === targetStatus) {
      count++;
    }
  });

  return count;
}
