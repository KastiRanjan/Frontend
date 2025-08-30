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
  const response = await axios.get(`${backendURI}/leave-type`);
  return response.data;
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
