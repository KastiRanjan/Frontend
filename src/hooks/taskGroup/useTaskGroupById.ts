import { useQuery } from "@tanstack/react-query";
import { fetchProject } from "../../service/project.service";

export const useTaskGroupById = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["taskGroup", id],
    queryFn: async () => {
      return fetchProject({ id });
    },
    enabled: !!id,
  });
};
