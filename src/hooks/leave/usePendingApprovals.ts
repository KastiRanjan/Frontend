import { useQuery } from "@tanstack/react-query";
import { getPendingApprovals } from "../../service/leave.service";
import { useSession } from "../../context/SessionContext";
import { LeaveType } from "../../types/leave";

/**
 * Custom hook to fetch pending leave approvals
 * For superusers, this will fetch ALL leave requests in the system
 * For other roles (admin, manager), it will fetch only relevant leaves based on permission level
 * 
 * @returns Query result with leave approvals data
 */
export function usePendingApprovals() {
  const { profile, permissions } = useSession();
  const userId = profile?.id;
  
  return useQuery({
    queryKey: ['pending-approvals', userId, permissions?.length],
    queryFn: async () => {
      console.log(`Fetching approvals for user ID: ${userId}`);
      const data = await getPendingApprovals();
      
      // Filter out the current user's own leave requests
      const filteredData = data.filter((leave: LeaveType) => leave.user?.id !== userId);
      
      console.log(`Received ${data.length} leave requests, filtered to ${filteredData.length} (removed own requests)`);
      return filteredData;
    },
    // Only enable if user is logged in
    enabled: !!userId,
    // Always refetch on window focus to keep data fresh
    refetchOnWindowFocus: true,
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000
  });
}