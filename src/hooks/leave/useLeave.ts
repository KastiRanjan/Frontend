import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as leaveService from "../../service/leave.service";
import { CreateLeaveDto, UpdateLeaveDto } from "../../types/leave";

export function useLeaves(status?: string) {
  return useQuery({
    queryKey: ["leaves", status],
    queryFn: () => leaveService.fetchLeaves(status),
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveService.createLeave,
    onSuccess: () => {
      // Invalidate all leave-related queries
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["user-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      // Also invalidate user profile data as leave status affects profile
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLeaveDto }) =>
      leaveService.updateLeave(id, payload),
    onSuccess: () => {
      // Invalidate leave data
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["user-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      // Also invalidate profile data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveService.deleteLeave,
    onSuccess: () => {
      // Invalidate leave data
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["user-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      // Also invalidate profile data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * @deprecated Team lead approval step has been removed
 * Use useApproveLeaveByManager instead
 */
export function useApproveLeaveByLead() {
  console.warn('useApproveLeaveByLead is deprecated - use useApproveLeaveByManager instead');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leaveService.approveLeaveByLead(id, userId),
    onSuccess: () => {
      // Invalidate leave data
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["user-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      // Also invalidate profile data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook for manager approval of leave requests
 * First level of approval in the two-level process
 */
export function useApproveLeaveByManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leaveService.approveLeaveByManager(id, userId),
    onSuccess: () => {
      // Invalidate leave data
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["user-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      // Also invalidate profile data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useApproveLeaveByPM() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leaveService.approveLeaveByPM(id, userId),
    onSuccess: () => {
      // Invalidate leave data
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["user-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      // Also invalidate profile data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useApproveLeaveByAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leaveService.approveLeaveByAdmin(id, userId),
    onSuccess: () => {
      // Invalidate leave data
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["user-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      // Also invalidate profile data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leaveService.rejectLeave(id, userId),
    onSuccess: () => {
      // Invalidate leave data
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["user-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      // Also invalidate profile data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useLeaveCalendarView() {
  return useQuery({
    queryKey: ["leave-calendar"],
    queryFn: () => {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return leaveService.getLeaveCalendarView(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
    },
  });
}

export function useLeaveCalendarViewByRange(from: string, to: string, projectId?: string) {
  return useQuery({
    queryKey: ["leave-calendar", from, to, projectId],
    queryFn: () => leaveService.getLeaveCalendarView(from, to, projectId),
    enabled: !!(from && to),
  });
}
