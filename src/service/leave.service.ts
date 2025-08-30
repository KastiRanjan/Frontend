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
  const response = await axios.patch(`${backendURI}/leave/${id}`, payload);
  return response.data;
};

export const deleteLeave = async (id: string) => {
  const response = await axios.delete(`${backendURI}/leave/${id}`);
  return response.data;
};

export const approveLeaveByLead = async (id: string, userId: string) => {
  const response = await axios.patch(`${backendURI}/leave/${id}/approve/lead`, { userId });
  return response.data;
};

export const approveLeaveByPM = async (id: string, userId: string) => {
  const response = await axios.patch(`${backendURI}/leave/${id}/approve/pm`, { userId });
  return response.data;
};

export const approveLeaveByAdmin = async (id: string, userId: string) => {
  const response = await axios.patch(`${backendURI}/leave/${id}/approve/admin`, { userId });
  return response.data;
};

export const rejectLeave = async (id: string, userId: string) => {
  const response = await axios.patch(`${backendURI}/leave/${id}/reject`, { userId });
  return response.data;
};

export const getLeaveCalendarView = async (from: string, to: string, projectId?: string) => {
  const response = await axios.get(`${backendURI}/leave/calendar/view`, {
    params: { from, to, ...(projectId && { projectId }) }
  });
  return response.data;
};
