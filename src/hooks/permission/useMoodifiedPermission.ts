import { useQuery } from "@tanstack/react-query";
import { fetchPermissions } from "../../service/permission.service";
import _ from "lodash";

export const useModifiedPermission = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["permissions", page, limit],
    queryFn: async () => {
      const response = await fetchPermissions({ page, limit });
      const transformedData = _(response.results)
        .groupBy("resource")
        .map((value, key) => ({
          key: key,
          title: key,
          children: value.map((item) => ({
            resource: item.resource,
            key: item.id,
            title: item.description,
          })),
        }))
        .value();

      return transformedData;
    },
    // enabled: !!page && !!limit,
  });
};
