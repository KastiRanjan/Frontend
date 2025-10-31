export interface LeaveType {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: {
      name: string;
      displayName?: string;
    };
  };
  leaveType?: {
    id: string;
    name: string;
    maxDaysPerYear?: number;
    isEmergency?: boolean;
    allowCarryOver?: boolean;
    maxCarryOverDays?: number;
    isActive: boolean;
  };
  startDate: string;
  endDate: string;
  isCustomDates?: boolean;
  customDates?: string[];
  type: string;
  reason?: string;
  status: 'pending' | 'approved_by_manager' | 'approved' | 'rejected';
  requestedManagerId?: string;
  managerApproverId?: string;
  adminApproverId?: string;
  overriddenBy?: string;
  overriddenAt?: string;
  canOverride?: boolean; // For frontend display logic
  createdAt: string;
  updatedAt: string;
  // Extended fields for improved UI - with user relations
  requestedManager?: {
    id: string;
    name: string;
    email: string;
  };
  managerApprover?: {
    id: string;
    name: string;
    email: string;
  };
  adminApprover?: {
    id: string;
    name: string;
    email: string;
  };
  managerApprovalTime?: string;
  adminApprovalTime?: string;
  notifyAdmins?: string[]; // IDs of admins to notify
}

export interface CreateLeaveDto {
  startDate?: string;
  endDate?: string;
  isCustomDates?: boolean;
  customDates?: string[];
  type: string;
  reason?: string;
  requestedManagerId: string;
}

export interface UpdateLeaveDto {
  startDate?: string;
  endDate?: string;
  type?: string;
  reason?: string;
}

// Leave Balance Types
export interface LeaveBalance {
  leaveType: {
    id: string;
    name: string;
    maxDaysPerYear?: number;
    isEmergency?: boolean;
    allowCarryOver?: boolean;
    maxCarryOverDays?: number;
    isActive: boolean;
  };
  allocatedDays: number;
  carriedOverDays: number;
  totalAvailableDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface AllocateLeaveDto {
  userId: string;
  leaveTypeId: string;
  year: number;
  allocatedDays: number;
  carriedOverDays?: number;
}

export interface CarryOverLeaveDto {
  fromYear: number;
  toYear: number;
  userIds?: string[];
  leaveTypeIds?: string[];
}
