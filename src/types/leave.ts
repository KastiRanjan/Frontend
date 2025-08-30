export interface LeaveType {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  type: string;
  reason?: string;
  status: 'pending' | 'approved_by_lead' | 'approved_by_pm' | 'approved' | 'rejected';
  leadApproverId?: string;
  pmApproverId?: string;
  adminApproverId?: string;
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
