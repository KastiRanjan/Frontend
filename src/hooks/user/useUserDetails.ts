import { useQuery } from "@tanstack/react-query";
import { fetchUserById } from "../../service/user.service";

export const useUserDetails = (id: string | undefined) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUserById({ id }),
    enabled: !!id,
  },
  );
};
