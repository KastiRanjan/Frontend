import { fetchTaskTemplate } from "@/service/tasktemplate.service";
import { useQuery } from "@tanstack/react-query";

export const useTaskTemplate = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["taskTemplate", page, limit],
    queryFn: async () => {
      return fetchTaskTemplate();
    },
    // enabled: !!page && !!limit,
  });
};
