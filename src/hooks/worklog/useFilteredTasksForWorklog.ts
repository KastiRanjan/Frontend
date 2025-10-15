import { useMemo } from "react";
import { useTasks } from "@/hooks/task/useTask";
import { useProjectById } from "@/hooks/project/useProjectById";
import { TaskType } from "@/types/task";
import { useParams } from "react-router-dom";

// Hook to get tasks filtered by worklog permission based on project settings
export const useFilteredTasksForWorklog = () => {
  const { id: projectId } = useParams();
  const { data: tasks } = useTasks({ status: "active" });
  const { data: project } = useProjectById({ id: projectId });
  
  return useMemo(() => {
    if (!tasks || !project) return [];
    
    // Filter tasks based on project's allowSubtaskWorklog setting
    const filteredTasks = tasks.filter((currentTask: TaskType) => {
      // If project allows subtask worklog
      if (project.allowSubtaskWorklog) {
        // Show subtasks (taskType === 'task')
        if (currentTask.taskType === 'task') {
          return true;
        }
        // Show parent tasks (taskType === 'story') ONLY if they don't have subtasks
        if (currentTask.taskType === 'story') {
          return !currentTask.subTasks || currentTask.subTasks.length === 0;
        }
        return false;
      } else {
        // If project doesn't allow subtask worklog, only show main tasks (stories) regardless of whether they have subtasks
        return currentTask.taskType === 'story';
      }
    });

    return filteredTasks.map((currentTask: TaskType) => {
      // If it's a subtask, show with parent name
      if (currentTask.taskType === 'task') {
        const parentName = currentTask.parentTask?.name || 'Unknown Parent';
        return {
          label: `${parentName} - ${currentTask.name}`,
          value: currentTask.id,
          taskType: currentTask.taskType,
          parentTask: currentTask.parentTask,
        };
      }
      
      // If it's a story task (parent without children or when subtask worklog is disabled)
      if (currentTask.taskType === 'story') {
        return {
          label: currentTask.name,
          value: currentTask.id,
          taskType: currentTask.taskType,
          parentTask: currentTask.parentTask,
        };
      }
      
      // Fallback
      return {
        label: currentTask.name,
        value: currentTask.id,
        taskType: currentTask.taskType,
        parentTask: currentTask.parentTask,
      };
    });
  }, [tasks, project]);
};