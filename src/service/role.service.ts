import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchRole = async () => {
  const response = await axios.get(
    `${backendURI}/roles?`
  );
  return response.data;
};

export const createRole = async (payload: any) => {
  const response = await axios.post(`${backendURI}/roles`, payload);
  return response.data;
};
export const editRole = async ({payload, id}:{payload: any, id: string}) => {
  const response = await axios.put(`${backendURI}/roles/${id}`, payload);
  return response.data;
};


