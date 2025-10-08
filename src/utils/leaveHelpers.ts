/**
 * Shared utility functions for leave management components
 * Reduces duplication between LeaveManagement.tsx and LeaveProfile.tsx
 */
import { Modal } from "antd";
import { LeaveType } from "../types/leave";
import { 
  hasAnyLeaveApprovalPermission 
} from "./leavePermissions";
import { 
  approveLeave, 
  rejectLeave
} from "../service/leave.service";
import { UseMutationResult } from "@tanstack/react-query";

/**
 * Get color for leave status tag
 */
export const getLeaveStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'orange',
    approved_by_manager: 'cyan',
    approved: 'green',
    rejected: 'red',
    // For backward compatibility
    approved_by_lead: 'blue',
    approved_by_pm: 'cyan'
  };
  return colors[status] || 'default';
};

/**
 * Get human-readable text for leave status
 */
export const getLeaveStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    pending: 'Pending Manager Approval',
    approved_by_manager: 'Approved by Manager', 
    approved: 'Fully Approved',
    rejected: 'Rejected',
    // For backward compatibility
    approved_by_lead: 'Approved by Lead (Legacy)',
    approved_by_pm: 'Approved by Manager (Legacy)'
  };
  return statusTexts[status] || status;
};

/**
 * Check if user can approve a specific leave
 */
export const canApproveLeave = (
  permissions: any[],
  leave: LeaveType,
  currentUserRole: string
): boolean => {
  if (!permissions || !leave) return false;
  
  const requesterRole = leave.user?.role?.name?.toLowerCase() || '';
  const isPending = leave.status === 'pending' || leave.status === 'approved_by_manager';
  
  // Must have approval permission and leave must be in pending state
  return hasAnyLeaveApprovalPermission(permissions) && isPending;
};

/**
 * Handle approval with confirmation dialog
 */
export const handleLeaveApproval = (
  leaveId: string,
  approveMutation: UseMutationResult<any, any, any, any>
) => {
  Modal.confirm({
    title: 'Approve Leave',
    content: 'Are you sure you want to approve this leave request?',
    onOk: () => approveMutation.mutate({ leaveId })
  });
};

/**
 * Handle rejection with confirmation dialog
 */
export const handleLeaveRejection = (
  leaveId: string,
  userId: string,
  rejectMutation: UseMutationResult<any, any, any, any>
) => {
  Modal.confirm({
    title: 'Reject Leave',
    content: 'Are you sure you want to reject this leave request?',
    onOk: () => rejectMutation.mutate({ leaveId, userId })
  });
};

// Override functionality removed per requirements