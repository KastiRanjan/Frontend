import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchTaskGroup = async (params?: { taskSuperId?: string }) => {
  const url = `${backendURI}/task-group`;
  const queryParams = params?.taskSuperId ? `?taskSuperId=${params.taskSuperId}&includeTemplates=true` : '?includeTemplates=true';
  const response = await axios.get(`${url}${queryParams}`);
  return response.data;
};

export const fetchTaskGroupById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/task-group/${id}?includeTemplates=true`);
  return response.data;
};


export const createTaskGroup = async (payload: any) => {
  const response = await axios.post(`${backendURI}/task-group`, payload);
  return response.data;
};
export const editTaskGroup = async ({
  payload,
  id,
}: {
  payload: any;
  id: string;
}) => {
  const response = await axios.patch(`${backendURI}/task-group/${id}`, payload);
  return response.data;
};


export const deleteTaskGroup = async ({ id }: { id: string }) => {
  const response = await axios.delete(`${backendURI}/task-group/${id}`);
  return response.data;
};
