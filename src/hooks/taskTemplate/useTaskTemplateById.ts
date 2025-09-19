import { fetchTaskTemplateById } from "@/service/tasktemplate.service";
import { useQuery } from "@tanstack/react-query";

export const useTaskTemplateById = ({ id }: { id: string | undefined }) => {
  return useQuery({
    queryKey: ["taskTemplate", id], // Use "taskTemplate" as the key, not "taskGroup"
    queryFn: async () => {
      console.log("Fetching task template by ID:", id);
      const result = await fetchTaskTemplateById({ id });
      console.log("Task template fetch result:", result);
      return result;
    },
    enabled: !!id,
  });
};
