import { fetchRoleById } from "@/service/role.service";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";

export const useRolePermissionById = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: async () => {
      const response = await fetchRoleById({ id });
      console.log(response);
      const ids = _(response?.permissions).map("id").value();
      return ids;
    },
    enabled: !!id,
  });
};
