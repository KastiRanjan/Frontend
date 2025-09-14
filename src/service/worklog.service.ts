import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchWorklogs = async (status?: string) => {
  let url = `${backendURI}/worklogs`;
  if (status && status !== 'all') {
    url += `?status=${status}`;
  }
  const response = await axios.get(url);
  return response.data;
};

export const fetchWorklogsByUser = async (status?: string) => {
  let url = `${backendURI}/worklogs/user`;
  if (status && status !== 'all') {
    url += `?status=${status}`;
  }
  const response = await axios.get(url);
  return response.data;
}

export const fetchWorklog = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/worklogs/${id}`);

  return response.data;
};

export const fetchWorklogById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/worklogs/task/${id}`);

  return response.data;
};

export const checkWorklogAllowed = async ({ taskId }: { taskId: string }) => {
  const response = await axios.get(`${backendURI}/worklogs/task/${taskId}/allowed`);
  return response.data;
};

export const createWorklog = async (payload: any) => {
  const response = await axios.post(`${backendURI}/worklogs`, payload);
  return response.data;
};
export const editWorklog = async ({
  remark,
  status,
  id,
}: {
  remark: string;
  status: any;
  id: string;
}) => {
  const response = await axios.patch(`${backendURI}/worklogs/${id}`, {status, remark});
  return response.data;
};

export const editingWorklog = async ({
  date,
  startTime,
  endTime,
  description,
  approvedBy,
  status,
  id,
}: {
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  approvedBy: string;
  status: any;
  id: string;
}) => {
  const response = await axios.patch(`${backendURI}/worklogs/${id}`, {date, startTime, endTime, description, approvedBy, status});
  return response.data;
};



export const deleteWorklog = async ({ id }: { id: string }) => {
  const response = await axios.delete(`${backendURI}/worklogs/${id}`);
  return response.data;
};
