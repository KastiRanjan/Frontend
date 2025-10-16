import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchTaskGroup = async (params?: { taskSuperId?: string; limit?: number; page?: number }) => {
  const url = `${backendURI}/task-group`;
  const query = [];
  if (params?.taskSuperId) query.push(`taskSuperId=${params.taskSuperId}`);
  if (params?.limit) query.push(`limit=${params.limit}`);
  if (params?.page) query.push(`page=${params.page}`);
  query.push('includeTemplates=true');
  const queryString = query.length ? `?${query.join('&')}` : '';
  const response = await axios.get(`${url}${queryString}`);
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
