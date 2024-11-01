import { useQuery } from "@tanstack/react-query";
import { getMyAttendence } from "../../service/attendence.service";

export const useGetMyAttendence = () => {
  return useQuery({
    queryKey: ["attendence"],
    queryFn: async () => {
      return getMyAttendence();
    },
    // enabled: !!page && !!limit,
  });
};
