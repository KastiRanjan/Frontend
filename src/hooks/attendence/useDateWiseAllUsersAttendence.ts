import { useQuery } from '@tanstack/react-query';
import { fetchDateWiseAllUsersAttendences } from '@/service/attendence.service';

export const useDateWiseAllUsersAttendence = (date: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['attendence', 'date-wise-all-users', date],
    queryFn: () => fetchDateWiseAllUsersAttendences(date),
    enabled: enabled && !!date,
  });
};