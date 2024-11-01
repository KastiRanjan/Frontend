import { useQuery } from "@tanstack/react-query";
import { fetchWorklogById } from "../../service/worklog.service";

export const useWorklogById = ({ id }: { id: string }) => {
  return useQuery({

    queryKey: ["worklog", id],
    queryFn: async () => {
      return fetchWorklogById({ id });
    },
    enabled: !!id,
  });
};
