import { fetchTaskTemplate } from "@/service/tasktemplate.service";
import { useQuery } from "@tanstack/react-query";

export const useTaskTemplate = () => {
  return useQuery({
    queryKey: ["taskTemplate"],
    queryFn: async () => {
      const templates = await fetchTaskTemplate();
      console.log('useTaskTemplate - Raw templates from API:', templates);
      
      // No longer filter out subtasks - return all templates with their relationships
      // The parent-child organization is handled by the table component
      return templates;
    },
  });
};
