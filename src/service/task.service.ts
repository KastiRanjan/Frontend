import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchTasks = async () => {
  const response = await axios.get(`${backendURI}/tasks?`);
  return response.data;
};
export const fetchTask = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/tasks/${id}`);

  return response.data;
};

export const createTask = async (payload: any) => {
  const response = await axios.post(`${backendURI}/tasks`, payload);
  return response.data;
};
