import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as leaveTypeService from "../../service/leaveType.service";
import { UpdateLeaveTypeDto } from "../../types/leaveType";

export function useLeaveTypes() {
  return useQuery({
    queryKey: ["leave-types"],
    queryFn: leaveTypeService.fetchLeaveTypes,
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveTypeService.createLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLeaveTypeDto }) =>
      leaveTypeService.updateLeaveType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveTypeService.deleteLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
  });
}
