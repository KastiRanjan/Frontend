import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

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

export const approveLeaveByLead = async (id: string, userId: string) => {
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/approve/lead`, { userId });
  return response.data;
};

export const approveLeaveByPM = async (id: string, userId: string) => {
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/approve/pm`, { userId });
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

// Generic approve function that determines the approval level based on user role
export const approveLeave = async (id: string) => {
  // This will use the user's session to determine the appropriate approval level
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/approve`);
  return response.data;
};

// Override an approved leave (revert to pending or reject)
export const overrideLeave = async (id: string, newStatus: 'pending' | 'rejected' = 'pending') => {
  const cleanId = encodeURIComponent(String(id).trim().replace(/['"]/g, ''));
  const response = await axios.patch(`${backendURI}/leave/${cleanId}/override`, { newStatus });
  return response.data;
};

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
