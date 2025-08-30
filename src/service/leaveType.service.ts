import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

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

export const fetchLeaveTypes = async () => {
  try {
    const response = await axios.get(`${backendURI}/leave-type`);
    
    // Ensure we always return an array
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && typeof response.data === 'object') {
      // If it's an object with properties, wrap it in an array
      return [response.data];
    } else {
      console.warn('Unexpected leaveTypes data structure:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Fetch leave types error:', error);
    throw error;
  }
};

export const createLeaveType = async (payload: CreateLeaveTypeDto) => {
  const response = await axios.post(`${backendURI}/leave-type`, payload);
  return response.data;
};

export const updateLeaveType = async (id: string, payload: UpdateLeaveTypeDto) => {
  const response = await axios.patch(`${backendURI}/leave-type/${id}`, payload);
  return response.data;
};

export const deleteLeaveType = async (id: string) => {
  const response = await axios.delete(`${backendURI}/leave-type/${id}`);
  return response.data;
};
