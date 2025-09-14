import { useQuery } from "@tanstack/react-query";
import { fetchAllUsersAttendences } from "@/service/attendence.service";

export const useAllUsersAttendence = (enabled = true) => {
  const query = useQuery({
    queryKey: ["all-users-attendence"],
    queryFn: fetchAllUsersAttendences,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled,
  });

  return query;
};