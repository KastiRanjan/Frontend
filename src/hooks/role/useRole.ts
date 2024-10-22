import { useQuery } from "@tanstack/react-query";
import { fetchRole } from "../../service/role.service";

export const useRole = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      return fetchRole();
    },
    // enabled: !!page && !!limit,
  });
};
