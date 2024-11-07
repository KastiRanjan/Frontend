import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchTasks = async () => {
  const response = await axios.get(`${backendURI}/tasks`);
  return response.data;
};
export const fetchProjectTasks = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/tasks/project/${id}`);

  return response.data;
};
export const fetchProjectTaskById = async ({ pid, tid }: { pid: string | undefined, tid: string | undefined }) => {
  const response = await axios.get(`${backendURI}/tasks/${tid}/project/${pid}`);
  return response.data;
};

export const fetchTask = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/tasks/${id}`);

  return response.data;
};
export const addTaskProject = async (payload: any) => {
  console.log(payload);
  const response = await axios.post(`${backendURI}/tasks/add-bulk`, payload);

  return response.data;
};

export const createTask = async (payload: any) => {
  const response = await axios.post(`${backendURI}/tasks`, payload);
  return response.data;
};
export const updateTask = async ({ id, payload }: any) => {
  const response = await axios.patch(`${backendURI}/tasks/${id}`, payload);
  return response.data;
};
