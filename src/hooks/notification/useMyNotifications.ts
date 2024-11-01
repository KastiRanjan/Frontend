import { fetchMyNotifications } from "@/service/notification.service";
import { useQuery } from "@tanstack/react-query";

export const useMyNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      return fetchMyNotifications();
    },
    // enabled: !!page && !!limit,
  });
};
