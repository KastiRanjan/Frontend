import { fetchRoleById } from "@/service/role.service";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";

export const useRolePermissionById = ({ id }: { id: string | undefined }) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: async () => {
      const response = await fetchRoleById({ id });
      console.log(response);
      const transformedData = _(response.permission)
        .groupBy("resource")
        .map((value, key) => ({
          key: key,
          children: value.map((item) => ({
            key: item.id,
          })),
        }))
        .value();

      return _(transformedData)
        .flatMap((item) => item.children.map((child) => child.key))
        .value();
    },
    enabled: !!id,
  });
};
