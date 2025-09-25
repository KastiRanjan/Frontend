import { fetchMyNotifications } from "@/service/notification.service";
import { useQuery } from "@tanstack/react-query";

export const useMyNotifications = (userId: string) => {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      return fetchMyNotifications(userId);
    },
    enabled: !!userId,
  });
};
