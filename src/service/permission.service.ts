import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchPermissions = async ({
  limit,
  page,
}: {
  limit: number;
  page: number;
}) => {
  const response = await axios.get(
    `${backendURI}/permissions?limit=${limit}&page=${page}`
  );
  return response.data;
};

export const createPermission = async (payload: any) => {
  const response = await axios.post(`${backendURI}/permissions`, payload);
  return response.data;
};

export const editPermission = async ({payload, id}:{payload: any, id: string}) => {
  const response = await axios.put(`${backendURI}/permissions/${id}`, payload);
  return response.data;
};

export const deletePermission = async (id: string) => {
  const response = await axios.delete(`${backendURI}/permissions/${id}`);
  return response.data;
};

export const syncPermissions = async () => {
  const response = await axios.post(`${backendURI}/permissions/sync`);
  return response.data;
};

