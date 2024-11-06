import { fetchAttendences } from "@/service/attendence.service";
import { useQuery } from "@tanstack/react-query";

export const useAttendence = () => {
  return useQuery({
    queryKey: ["attendence-list"],
    queryFn: async () => {
      return fetchAttendences();
    },
    // enabled: !!id,
  });
};
