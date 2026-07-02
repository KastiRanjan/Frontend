import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../../service/project.service";

export const useProject = ({status}: {status?: string}) => {
  return useQuery({
    queryKey: ["projects", status || "all"],
    queryFn: async () => {
      return fetchProjects({status: status || "all"});
    },
    // enabled: !!page && !!limit,
  });
};
