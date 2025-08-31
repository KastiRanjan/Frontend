import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import leaveTypeService, { 
  UpdateLeaveTypeDto
} from '../service/leaveTypeService';

// Query keys
export const leaveTypeKeys = {
  all: ['leaveTypes'] as const,
  lists: () => [...leaveTypeKeys.all, 'list'] as const,
  list: (filter: any) => [...leaveTypeKeys.lists(), filter] as const,
  details: () => [...leaveTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaveTypeKeys.details(), id] as const,
  balances: (userId?: string, year?: number) => ['leaveBalances', userId, year] as const,
};

// Get all leave types
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: leaveTypeKeys.list('all'),
    queryFn: leaveTypeService.getAllLeaveTypes,
  });
};

// Get active leave types only
export const useActiveLeaveTypes = () => {
  return useQuery({
    queryKey: leaveTypeKeys.list('active'),
    queryFn: leaveTypeService.getActiveLeaveTypes,
  });
};

// Get leave type by ID
export const useLeaveType = (id: string) => {
  return useQuery({
    queryKey: leaveTypeKeys.detail(id),
    queryFn: () => leaveTypeService.getLeaveTypeById(id),
    enabled: !!id,
  });
};

// Get my leave balances
export const useMyLeaveBalances = (year?: number) => {
  return useQuery({
    queryKey: leaveTypeKeys.balances(undefined, year),
    queryFn: () => leaveTypeService.getMyLeaveBalances(year),
  });
};

// Get user leave balances
export const useUserLeaveBalances = (userId: string, year?: number) => {
  return useQuery({
    queryKey: leaveTypeKeys.balances(userId, year),
    queryFn: () => leaveTypeService.getUserLeaveBalances(userId, year),
    enabled: !!userId,
  });
};

// Create leave type mutation
export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveTypeService.createLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveTypeKeys.all });
      message.success('Leave type created successfully');
    },
    onError: (error: any) => {
      console.error('Create leave type error:', error);
      message.error(error?.response?.data?.message || 'Failed to create leave type');
    },
  });
};

// Update leave type mutation
export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveTypeDto }) =>
      leaveTypeService.updateLeaveType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveTypeKeys.all });
      message.success('Leave type updated successfully');
    },
    onError: (error: any) => {
      console.error('Update leave type error:', error);
      message.error(error?.response?.data?.message || 'Failed to update leave type');
    },
  });
};

// Delete leave type mutation
export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveTypeService.deleteLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveTypeKeys.all });
      message.success('Leave type deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete leave type error:', error);
      message.error(error?.response?.data?.message || 'Failed to delete leave type');
    },
  });
};

// Toggle leave type status mutation
export const useToggleLeaveTypeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      leaveTypeService.toggleLeaveTypeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveTypeKeys.all });
      message.success('Leave type status updated successfully');
    },
    onError: (error: any) => {
      console.error('Toggle leave type status error:', error);
      message.error(error?.response?.data?.message || 'Failed to update leave type status');
    },
  });
};
