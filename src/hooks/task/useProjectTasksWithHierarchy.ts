import { fetchProjectTasks } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch project tasks with complete hierarchy information.
 * This ensures we get all TaskSuperProject and TaskGroupProject relationships.
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
        return data.filter((task: any) => task.status === status);
      }
      
      return data;
    },
    enabled: !!projectId, // Only run if we have a projectId
  });
};