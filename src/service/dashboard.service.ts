import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchDashboardAttendance = async (date?: string) => {
  const params = date ? { date } : {};
  const response = await axios.get(`${backendURI}/dashboard/attendance`, { params });
  return response.data;
};

export const fetchDashboardWorkingTime = async (date?: string, period?: 'day' | 'week' | 'month') => {
  const params: any = {};
  if (date) params.date = date;
  if (period) params.period = period;
  const response = await axios.get(`${backendURI}/dashboard/working-time`, { params });
  return response.data;
};
