import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchWorklogs = async (status: string) => {
  const response = await axios.get(`${backendURI}/worklogs?status=${status}`);
  return response.data;
};
export const fetchWorklog = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/worklogs/${id}`);

  return response.data;
};

export const fetchWorklogById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/worklogs/task/${id}`);

  return response.data;
};

export const createWorklog = async (payload: any) => {
  const response = await axios.post(`${backendURI}/worklogs`, payload);
  return response.data;
};
export const editWorklog = async ({
  status,
  id,
}: {
  status: any;
  id: string;
}) => {
  const response = await axios.patch(`${backendURI}/worklogs/${id}`, {status});
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
