import { fetchAttendence } from "@/service/attendence.service";
import { useQuery } from "@tanstack/react-query";

export const useAttendence = () => {
  return useQuery({
    queryKey: ["attendence"],
    queryFn: async () => {
      return fetchAttendence();
    },
    enabled: !!id,
  });
};
