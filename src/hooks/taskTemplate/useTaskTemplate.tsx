import { fetchTaskTemplate } from "@/service/tasktemplate.service";
import { useQuery } from "@tanstack/react-query";

export const useTaskTemplate = () => {
  return useQuery({
    queryKey: ["taskTemplate"],
    queryFn: async () => {
      const templates = await fetchTaskTemplate();
      const filteredTemplate = templates?.filter((template: any) => !template.parentTask)
      return filteredTemplate
    },
  });
};
