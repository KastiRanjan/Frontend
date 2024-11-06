import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchAttendences = async () => {
  const response = await axios.get(`${backendURI}/attendence`);
  return response.data;
};
export const fetchAttendenceById = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/attendence/user/${id}`);

  return response.data;
};
export const fetchAttendence = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/attendence/${id}`);
  return response.data;
};


export const createAttendence = async (payload: any) => {
  const response = await axios.post(`${backendURI}/attendence`, payload);
  return response.data;
};
export const updateAttendence = async ({ id, payload }: any) => {
  const response = await axios.patch(`${backendURI}/attendence`, payload);
  return response.data;
};

export const getMyAttendence = async () => {
  const response = await axios.get(`${backendURI}/attendence/today-attendence?`);
  return response.data;
};

