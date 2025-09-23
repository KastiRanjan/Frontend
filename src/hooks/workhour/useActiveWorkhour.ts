import { useQuery } from "@tanstack/react-query";
import { resolveWorkhour } from "../../service/workhour.service";

export function useActiveWorkhour(roleId: string | undefined) {
  return useQuery({
    queryKey: ["active-workhour", roleId],
    queryFn: () => resolveWorkhour(roleId || ""),
    enabled: !!roleId,
  });
}