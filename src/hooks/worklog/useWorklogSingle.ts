import { useQuery } from "@tanstack/react-query";
import { fetchWorklog } from "../../service/worklog.service";

export const useWorklogSingle = ({ id }: { id: string | undefined }) => {
  return useQuery({

    queryKey: ["worklog", id],
    queryFn: async () => {
      return fetchWorklog({ id: id! });
    },
    enabled: !!id,
  });
};