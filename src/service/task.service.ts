import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchTasks = async ({ status }: { status: string }) => {
  const response = await axios.get(`${backendURI}/tasks?status=${status}`);
  return response.data;
};
export const fetchProjectTasks = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/tasks/project/${id}`);

  return response.data;
};
export const fetchProjectTaskById = async ({
  pid,
  tid,
}: {
  pid: string | undefined;
  tid: string | undefined;
}) => {
  const response = await axios.get(`${backendURI}/tasks/${tid}/project/${pid}`);
  return response.data;
};

export const fetchTask = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/tasks/${id}`);

  return response.data;
};
export const addTaskProject = async (payload: any) => {
  const response = await axios.post(`${backendURI}/tasks/add-bulk`, payload);
  return response.data;
};

export const addTaskProjectIndividual = async (payload: any) => {
  const response = await axios.post(`${backendURI}/tasks/add-bulk-list`, payload);
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

export const bulkUpdateTasks = async (payload:any) => {
  const response = await axios.patch(`${backendURI}/tasks/bulk-update`, payload);
  return response.data;
};

export const markTasksComplete = async (payload: any) => {
  console.log("Sending mark complete request:", payload);
  const response = await axios.patch(`${backendURI}/tasks/mark-complete`, payload);
  console.log("Mark complete response:", response.data);
  return response.data;
};

export const firstVerifyTasks = async (payload: any) => {
  console.log("Sending first verify request:", payload);
  const response = await axios.patch(`${backendURI}/tasks/first-verify`, payload);
  console.log("First verify response:", response.data);
  return response.data;
};

export const secondVerifyTasks = async (payload: any) => {
  console.log("Sending second verify request:", payload);
  const response = await axios.patch(`${backendURI}/tasks/second-verify`, payload);
  console.log("Second verify response:", response.data);
  return response.data;
};

export const deleteTask = async ({ id }: { id: string }) => {
  const response = await axios.delete(`${backendURI}/tasks/${id}`);
  return response.data;
};