export interface LeaveTypeType {
  id: string;
  name: string;
  maxDaysPerYear?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveTypeDto {
  name: string;
  maxDaysPerYear?: number;
  isActive?: boolean;
}

export interface UpdateLeaveTypeDto {
  name?: string;
  maxDaysPerYear?: number;
  isActive?: boolean;
}
