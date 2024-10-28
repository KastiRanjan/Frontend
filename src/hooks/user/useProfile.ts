import { getProfile } from "@/service/auth.service";
import { useQuery } from "@tanstack/react-query";

export const useProfile = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !!isAuthenticated,
  });
};
