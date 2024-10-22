import { useQuery } from "@tanstack/react-query";
import { fetchPermissions } from "../../service/permission.service";

export const usePermission = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["permissions", page, limit],
    queryFn: async () => {
      return fetchPermissions({ page, limit });
    },
    // enabled: !!page && !!limit,
  });
};
