import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../service/user.service";

export const useUser = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
};
