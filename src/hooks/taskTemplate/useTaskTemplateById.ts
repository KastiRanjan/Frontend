import { fetchTaskTemplateById } from "@/service/tasktemplate.service";
import { useQuery } from "@tanstack/react-query";

export const useTaskTemplateById = ({ id }: { id: string | undefined }) => {
  return useQuery({
    queryKey: ["taskGroup", id],
    queryFn: async () => {
      return fetchTaskTemplateById({ id });
    },
    enabled: !!id,
  });
};
