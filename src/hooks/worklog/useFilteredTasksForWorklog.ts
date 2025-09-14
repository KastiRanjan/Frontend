import { useMemo } from "react";
import { useTasks } from "@/hooks/task/useTask";
import { useProjectById } from "@/hooks/project/useProjectById";
import { TaskTemplateType } from "@/types/taskTemplate";
import { useParams } from "react-router-dom";

// Hook to get tasks filtered by worklog permission based on project settings
export const useFilteredTasksForWorklog = () => {
  const { id: projectId } = useParams();
  const { data: tasks } = useTasks({ status: "active" });
  const { data: project } = useProjectById({ id: projectId });
  
  return useMemo(() => {
    if (!tasks || !project) return [];
    
    // Filter tasks based on project's allowSubtaskWorklog setting
    const filteredTasks = tasks.filter((currentTask: TaskTemplateType) => {
      // If project allows subtask worklog, show all tasks except parent tasks that have subtasks
      if (project.allowSubtaskWorklog) {
        // Don't show parent tasks that have subtasks
        if (currentTask.taskType === 'story' && currentTask.subTasks && currentTask.subTasks.length > 0) {
          return false;
        }
        return true;
      } else {
        // If project doesn't allow subtask worklog, only show main tasks (stories) regardless of whether they have subtasks
        return currentTask.taskType === 'story';
      }
    });

    return filteredTasks.map((currentTask: TaskTemplateType) => {
      // Format the task for display
      if (currentTask.taskType === 'story') {
        return {
          label: currentTask.name,
          value: currentTask.id,
          taskType: currentTask.taskType,
          parentTask: currentTask.parentTask,
        };
      }
      
      // If it's a subtask and we're in allowSubtaskWorklog mode
      if (currentTask.taskType === 'task') {
        const parentTask = tasks?.find((t: TaskTemplateType) => 
          t.subTasks && t.subTasks.some((sub: TaskTemplateType) => sub.id === currentTask.id)
        );
        
        const parentName = currentTask.parentTask?.name || parentTask?.name || 'Unknown Parent';
        return {
          label: `${parentName} (${currentTask.name})`,
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