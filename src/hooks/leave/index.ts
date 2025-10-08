/**
 * Leave hooks index file
 * Exports all leave-related hooks for easier imports
 */

// Export hooks from useLeave.ts
export {
  useLeaves,
  useCreateLeave,
  useUpdateLeave,
  useDeleteLeave,
  useApproveLeaveByLead, // Deprecated but kept for backward compatibility
  useApproveLeaveByManager, // New manager approval hook
  useApproveLeaveByPM, // Legacy but kept for backward compatibility
  useApproveLeaveByAdmin,
  useRejectLeave,
  useLeaveCalendarView,
  useLeaveCalendarViewByRange
} from './useLeave';

// Export pending approvals hook
export { usePendingApprovals } from './usePendingApprovals';