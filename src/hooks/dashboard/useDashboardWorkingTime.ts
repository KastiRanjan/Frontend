import { useQuery } from '@tanstack/react-query';
import { fetchDashboardWorkingTime } from '../../service/dashboard.service';
import { useSession } from '../../context/SessionContext';

export const useDashboardWorkingTime = (date?: string, period: 'day' | 'week' | 'month' = 'day') => {
  const { permissions } = useSession();

  // Check if user has permission to view working time dashboard
  const hasPermission = Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === 'dashboard' &&
        perm.path === '/dashboard/working-time' &&
        perm.method?.toLowerCase() === 'get'
    );

  // Debug logging
  console.log('useDashboardWorkingTime - Permission check:', {
    hasPermissions: !!permissions,
    permissionsCount: permissions?.length || 0,
    hasPermission,
    date,
    period
  });

  return useQuery({
    queryKey: ['dashboard-working-time', date, period],
    queryFn: () => {
      console.log('Fetching working time data...', { date, period });
      return fetchDashboardWorkingTime(date, period);
    },
    enabled: hasPermission,
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true,
  });
};
