import { useQuery } from "@tanstack/react-query";
import { fetchDashboardAttendance } from "@/service/dashboard.service";
import { useSession } from "@/context/SessionContext";

/**
 * Hook to fetch dashboard attendance data with permission check
 * Only users with permission to view dashboard attendance can use this hook
 * @param date - Optional date in YYYY-MM-DD format. Defaults to today.
 */
export const useDashboardAttendance = (date?: string) => {
  const { permissions } = useSession();

  // Check if user has permission to view dashboard attendance
  const hasPermission =
    Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "dashboard" &&
        perm.path === "/dashboard/attendance" &&
        perm.method?.toLowerCase() === "get"
    );

  return useQuery({
    queryKey: ["dashboard-attendance", date],
    queryFn: () => fetchDashboardAttendance(date),
    enabled: hasPermission, // Only fetch if user has permission
    refetchInterval: 60000, // Refetch every minute to keep data fresh
    refetchOnWindowFocus: true,
  });
};

/**
 * Helper function to check if user can view dashboard attendance
 */
export const canViewDashboardAttendance = (permissions: any[]): boolean => {
  return (
    Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "dashboard" &&
        perm.path === "/dashboard/attendance" &&
        perm.method?.toLowerCase() === "get"
    )
  );
};
