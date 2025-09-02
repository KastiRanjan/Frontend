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
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["user-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
}

export function useUpdateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLeaveDto }) =>
      leaveService.updateLeave(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useDeleteLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveService.deleteLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useApproveLeaveByLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leaveService.approveLeaveByLead(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useApproveLeaveByPM() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leaveService.approveLeaveByPM(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useApproveLeaveByAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leaveService.approveLeaveByAdmin(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leaveService.rejectLeave(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
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
