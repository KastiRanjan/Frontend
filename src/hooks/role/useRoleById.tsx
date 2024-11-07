import { fetchRoleById } from "@/service/role.service";
import { useQuery } from "@tanstack/react-query";

export const useRoleById = ({ id }: { id: string | undefined }) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: async () => {
      return fetchRoleById({ id });
    },
    enabled: !!id,
  });
};
