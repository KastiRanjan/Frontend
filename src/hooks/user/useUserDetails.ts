import { useQuery } from "@tanstack/react-query";
import { fetchUserById } from "../../service/user.service";

/**
 * Hook to fetch user details with regular polling to keep data fresh
 * @param id User ID to fetch
 * @param options Additional query options
 */
export const useUserDetails = (id: string | undefined, options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUserById({ id }),
    enabled: !!id,
    refetchInterval: options?.refetchInterval || 30000, // Default to 30 seconds
    refetchOnWindowFocus: true,
  });
};
