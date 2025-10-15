import { fetchProjectTasks } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch project tasks with complete hierarchy information.
 * This ensures we get all TaskSuperProject and TaskGroupProject relationships.
 * 
 * Status filtering logic:
 * - If parent task matches the status and has no subtasks, include it
 * - If any subtask matches the status, include the parent with ONLY matching subtasks
 * - Parent is shown regardless of its own status if it has matching subtasks (needed to display the subtasks)
 * - If parent doesn't match and no subtasks match, exclude it completely
 */
export const useProjectTasksWithHierarchy = ({ 
  projectId, 
  status 
}: { 
  projectId: string, 
  status?: string 
}) => {
  return useQuery({
    queryKey: ["project-tasks-hierarchy", projectId, status],
    queryFn: async () => {
      // Fetch project tasks, which should include the complete hierarchy
      const data = await fetchProjectTasks({ id: projectId });
      
      // Log to help debug what data we're getting
      console.log("Project tasks with hierarchy:", data);
      
      // Debugging: Check a sample task for hierarchy properties
      if (data && data.length > 0) {
        const sampleTask = data[0];
        console.log("Sample task hierarchy info:", {
          taskId: sampleTask.id,
          taskName: sampleTask.name,
          groupProject: sampleTask.groupProject,
          taskSuperFromGroupProject: sampleTask.groupProject?.taskSuper
        });
        
        // Count tasks with groupProject
        const tasksWithGroupProject = data.filter((task: any) => !!task.groupProject).length;
        const tasksWithoutGroupProject = data.filter((task: any) => !task.groupProject).length;
        console.log(`Tasks with groupProject: ${tasksWithGroupProject}, without groupProject: ${tasksWithoutGroupProject}`);
        
        // Check if taskSuper is available
        const tasksWithTaskSuperViaGroupProject = data.filter((task: any) => !!task.groupProject?.taskSuper).length;
        console.log(`Tasks with taskSuper via groupProject: ${tasksWithTaskSuperViaGroupProject}`);
      }
      
      // If we have status filtering, apply it
      if (status) {
        console.log('Filtering tasks by status:', status);
        console.log('Sample task before filtering:', data[0]);
        if (data[0]?.subTasks && data[0].subTasks.length > 0) {
          console.log('Sample subtask before filtering:', data[0].subTasks[0]);
        }
        
        return data
          .map((task: any) => {
            // If task has subtasks, filter them by status
            if (task.subTasks && task.subTasks.length > 0) {
              const matchingSubtasks = task.subTasks.filter((subtask: any) => subtask.status === status);
              
              console.log(`Task "${task.name}": Found ${matchingSubtasks.length} subtasks matching status "${status}"`, 
                matchingSubtasks.map((st: any) => ({ 
                  name: st.name, 
                  status: st.status,
                  hasGroupProject: !!st.groupProject,
                  groupProjectName: st.groupProject?.name 
                }))
              );
              
              // If any subtasks match, return parent with ONLY matching subtasks
              if (matchingSubtasks.length > 0) {
                return {
                  ...task,
                  subTasks: matchingSubtasks // Only include subtasks that match the status
                };
              }
              
              // If parent matches status but no subtasks match, still include parent if it matches
              if (task.status === status) {
                return {
                  ...task,
                  subTasks: [] // No matching subtasks
                };
              }
              
              // Neither parent nor any subtask matches, exclude this task
              return null;
            }
            
            // Task has no subtasks, include it only if it matches status
            if (task.status === status) {
              console.log(`Standalone task "${task.name}" matches status "${status}", hasGroupProject:`, !!task.groupProject);
              return task;
            }
            
            return null;
          })
          .filter((task: any) => task !== null); // Remove null entries
      }
      
      return data;
    },
    enabled: !!projectId, // Only run if we have a projectId
  });
};