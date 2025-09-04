export interface LeaveType {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
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
    isActive: boolean;
  };
  startDate: string;
  endDate: string;
  type: string;
  reason?: string;
  status: 'pending' | 'approved_by_lead' | 'approved_by_pm' | 'approved' | 'rejected';
  leadApproverId?: string;
  pmApproverId?: string;
  adminApproverId?: string;
  overriddenBy?: string;
  overriddenAt?: string;
  canOverride?: boolean; // For frontend display logic
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveDto {
  startDate: string;
  endDate: string;
  type: string;
  reason?: string;
}

export interface UpdateLeaveDto {
  startDate?: string;
  endDate?: string;
  type?: string;
  reason?: string;
}
