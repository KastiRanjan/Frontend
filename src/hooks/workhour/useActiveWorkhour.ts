import { useQuery } from "@tanstack/react-query";
import { resolveWorkhour } from "../../service/workhour.service";

export function useActiveWorkhour(roleId: string | undefined) {
  return useQuery({
    queryKey: ["active-workhour", roleId],
    queryFn: () => {
      // If roleId is a UUID or not a valid number, skip the call to prevent 400 Bad Request
      if (!roleId || isNaN(Number(roleId))) {
        return Promise.resolve(null);
      }
      return resolveWorkhour(roleId);
    },
    enabled: !!roleId && !isNaN(Number(roleId)),
  });
}