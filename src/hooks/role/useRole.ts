import { useQuery } from "@tanstack/react-query";
import { fetchRole } from "../../service/role.service";

export const useRole = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["role", page, limit],
    queryFn: async () => {
      return fetchRole({ page, limit });
    },
    // enabled: !!page && !!limit,
  });
};
