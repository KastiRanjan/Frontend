import { useQuery } from "@tanstack/react-query";
import { fetchTodayAllUsersAttendences } from "@/service/attendence.service";

export const useTodayAllUsersAttendence = (enabled = true) => {
  const query = useQuery({
    queryKey: ["today-all-users-attendence"],
    queryFn: fetchTodayAllUsersAttendences,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled,
  });

  return query;
};