import { fetchMyNotifications } from "@/service/notification.service";
import { NotificationType } from "@/types/notification";
import { useQuery } from "@tanstack/react-query";

export const useMyNotifications = (userId: string, type?: NotificationType) => {
  return useQuery({
    queryKey: ["notifications", userId, type],
    queryFn: async () => {
      return fetchMyNotifications(userId, type);
    },
    enabled: !!userId,
  });
};
