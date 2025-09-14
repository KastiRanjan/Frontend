import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchAttendences = async () => {
  const response = await axios.get(`${backendURI}/attendance`);
  return response.data;
};

export const fetchAllUsersAttendences = async () => {
  const response = await axios.get(`${backendURI}/attendance/all-users`);
  return response.data;
};

export const fetchTodayAllUsersAttendences = async () => {
  const response = await axios.get(`${backendURI}/attendance/today-all-users`);
  return response.data;
};
export const fetchAttendenceById = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/attendance/user/${id}`);

  return response.data;
};
export const fetchAttendence = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/attendance/${id}`);
  return response.data;
};


export const createAttendence = async (payload: any) => {
  const response = await axios.post(`${backendURI}/attendance`, payload);
  return response.data;
};
export const updateAttendence = async ({ payload ,id}: {payload:any,id:string}) => {
  const response = await axios.patch(`${backendURI}/attendance/${id}`, payload);
  return response.data;
};

export const getMyAttendence = async () => {
  const response = await axios.get(`${backendURI}/attendance/today-attendence?`);
  return response.data;
};

