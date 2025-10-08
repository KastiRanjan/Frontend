import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

// Import DTOs from types/leave.ts
import { CreateLeaveDto as ImportedCreateLeaveDto, UpdateLeaveDto as ImportedUpdateLeaveDto } from '../types/leave';
export type CreateLeaveDto = ImportedCreateLeaveDto;
export type UpdateLeaveDto = ImportedUpdateLeaveDto;

// Import types from types/leave.ts
import { LeaveType as ImportedLeaveType } from '../types/leave';
export type LeaveType = ImportedLeaveType;

export const fetchLeaves = async (status?: string) => {
  const response = await axios.get(`${backendURI}/leave`, {
    params: status ? { status } : {}
  });
  return response.data;
};

export const createLeave = async (payload: CreateLeaveDto) => {
  try {
    const response = await axios.post(`${backendURI}/leave`, payload);
    return response.data;
  } catch (error: any) {
    console.error('Create leave error:', error);
    throw error;
  }
};

export const updateLeave = async (id: string, payload: UpdateLeaveDto) => {
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const response = await axios.patch(`${backendURI}/leave/${cleanId}`, payload);
  return response.data;
};

export const deleteLeave = async (id: string) => {
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const response = await axios.delete(`${backendURI}/leave/${cleanId}`);
  return response.data;
};

/**
 * @deprecated Team lead approval step has been removed from the system
 * This function is kept for backward compatibility with existing code
 */
export const approveLeaveByLead = async (id: string, userId: string) => {
  console.warn('approveLeaveByLead is deprecated - use approveLeaveByManager instead');
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  // Redirect to manager approval endpoint for new backend compatibility
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/approve/manager`, { userId });
  return response.data;
};

/**
 * Approve leave by manager - first step in the two-level approval process
 * For users with manager/projectmanager role
 */
export const approveLeaveByManager = async (id: string, userId: string, notifyAdmins?: string[]) => {
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const body: { userId: string; notifyAdmins?: string[] } = { userId };
  if (notifyAdmins && notifyAdmins.length > 0) {
    body.notifyAdmins = notifyAdmins;
  }
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/approve/manager`, body);
  return response.data;
};

/**
 * @deprecated Project Manager approval is now merged with manager approval
 * This function is kept for backward compatibility with existing code
 */
export const approveLeaveByPM = async (id: string, userId: string) => {
  console.warn('approveLeaveByPM is deprecated - use approveLeaveByManager instead');
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  // Redirect to manager approval endpoint for new backend compatibility
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/approve/manager`, { userId });
  return response.data;
};

export const approveLeaveByAdmin = async (id: string, userId: string) => {
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/approve/admin`, { userId });
  return response.data;
};

export const rejectLeave = async (id: string, userId: string) => {
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/reject`, { userId });
  return response.data;
};

/**
 * Generic approve function that determines the approval level based on user's role
 * This is the recommended function to use for new code as it handles role-based 
 * approval levels automatically on the backend
 */
export const approveLeave = async (id: string, notifyAdmins?: string[]) => {
  // This will use the user's session to determine the appropriate approval level
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const body: { notifyAdmins?: string[] } = {};
  if (notifyAdmins && notifyAdmins.length > 0) {
    body.notifyAdmins = notifyAdmins;
  }
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/approve`, body);
  return response.data;
};

// Override functionality removed per requirements

export const getLeaveCalendarView = async (from: string, to: string, projectId?: string) => {
  const response = await axios.get(`${backendURI}/leave/calendar/view`, {
    params: { from, to, ...(projectId && { projectId }) }
  });
  return response.data;
};

export const fetchUserLeaveBalances = async (userId: string, year?: number) => {
  const params: any = {};
  if (year) params.year = year;
  
  const response = await axios.get(`${backendURI}/leave/balance/${userId}`, { params });
  return response.data;
};

export const fetchUserLeaves = async (status?: string) => {
  const params: any = {};
  if (status && status !== 'all') params.status = status;
  
  const endpoint = '/leave/my-leaves';
  const response = await axios.get(`${backendURI}${endpoint}`, { params });
  return response.data;
};

export const fetchLeavesForUser = async (userId: string, status?: string) => {
  const params: any = {};
  if (status && status !== 'all') params.status = status;
  const response = await axios.get(`${backendURI}/leave/user/${encodeURIComponent(String(userId))}`, { params });
  return response.data;
};

export const getPendingApprovals = async () => {
  const response = await axios.get(`${backendURI}/leave/approvals/pending`);
  return response.data;
};
