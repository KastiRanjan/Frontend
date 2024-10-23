import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchRole = async ({
  limit,
  page,
}: {
  limit: number;
  page: number;
}) => {
  const response = await axios.get(
    `${backendURI}/roles?limit=${limit}&page=${page}`
  );
  return response.data;
};
export const fetchRoleById = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/roles/${id}`);
  return response.data;
};

export const createRole = async (payload: any) => {
  const response = await axios.post(`${backendURI}/roles`, payload);
  return response.data;
};
export const editRole = async ({
  payload,
  id,
}: {
  payload: any;
  id: string;
}) => {
  const response = await axios.put(`${backendURI}/roles/${id}`, payload);
  return response.data;
};
