import { useQuery } from "@tanstack/react-query";
import { fetchRole } from "../../service/role.service";

export const useRole = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return useRole({
    queryKey: ["projects", page, limit],
    queryFn: async () => {
      return ({ page, limit });
    },
    // enabled: !!page && !!limit,
  });
};
