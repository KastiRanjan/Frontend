import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URI;

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  maxDaysPerYear?: number;
  isEmergency?: boolean;
  allowCarryOver?: boolean;
  maxCarryOverDays?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveTypeDto {
  name: string;
  description?: string;
  maxDaysPerYear?: number;
  isEmergency?: boolean;
  allowCarryOver?: boolean;
  maxCarryOverDays?: number;
}

export interface UpdateLeaveTypeDto {
  name?: string;
  description?: string;
  maxDaysPerYear?: number;
  isEmergency?: boolean;
  allowCarryOver?: boolean;
  maxCarryOverDays?: number;
  isActive?: boolean;
}

export interface LeaveBalance {
  leaveType: LeaveType;
  allocatedDays: number;
  carriedOverDays: number;
  totalAvailableDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export const leaveTypeService = {
  // Get all leave types
  async getAllLeaveTypes(): Promise<LeaveType[]> {
    const response = await axios.get(`${API_BASE_URL}/leave-type`);
    return response.data;
  },

  // Get active leave types only
  async getActiveLeaveTypes(): Promise<LeaveType[]> {
    const response = await axios.get(`${API_BASE_URL}/leave-type/active`);
    return response.data;
  },

  // Get leave type by ID
  async getLeaveTypeById(id: string): Promise<LeaveType> {
    const response = await axios.get(`${API_BASE_URL}/leave-type/${id}`);
    return response.data;
  },

  // Create new leave type
  async createLeaveType(data: CreateLeaveTypeDto): Promise<LeaveType> {
    const response = await axios.post(`${API_BASE_URL}/leave-type`, data);
    return response.data;
  },

  // Update leave type
  async updateLeaveType(id: string, data: UpdateLeaveTypeDto): Promise<LeaveType> {
    const response = await axios.patch(`${API_BASE_URL}/leave-type/${id}`, data);
    return response.data;
  },

  // Delete leave type
  async deleteLeaveType(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/leave-type/${id}`);
  },

  // Activate/Deactivate leave type
  async toggleLeaveTypeStatus(id: string, isActive: boolean): Promise<LeaveType> {
    const response = await axios.patch(`${API_BASE_URL}/leave-type/${id}`, { isActive });
    return response.data;
  },

  // Get my leave balances
  async getMyLeaveBalances(year?: number): Promise<LeaveBalance[]> {
    const params = year ? { year } : {};
    const response = await axios.get(`${API_BASE_URL}/leave/balance/my`, { params });
    return response.data;
  },

  // Get user leave balances (admin only)
  async getUserLeaveBalances(userId: string, year?: number): Promise<LeaveBalance[]> {
    const params = year ? { year } : {};
    const response = await axios.get(`${API_BASE_URL}/leave/balance/${userId}`, { params });
    return response.data;
  },

  // Get specific leave balance
  async getSpecificLeaveBalance(userId: string, leaveType: string, year?: number): Promise<LeaveBalance> {
    const params = year ? { year } : {};
    const response = await axios.get(`${API_BASE_URL}/leave/balance/${userId}/${leaveType}`, { params });
    return response.data;
  }
};

export default leaveTypeService;
