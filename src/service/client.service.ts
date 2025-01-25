import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchClients = async () => {
  const response = await axios.get(`${backendURI}/clients`, {});
  return response.data;
};

export const fetchClientById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/clients/${id}`);
  return response.data;
};

export const createClient = async (payload: any) => {
  const response = await axios.post(`${backendURI}/clients`, payload);
  return response.data;
};

export const editClient = async ({
  payload,
  id,
}: {
  payload: any;
  id: string;
}) => {
  const response = await axios.patch(
    `${backendURI}/clients/${id}`,
    payload
  );
  return response.data;
};
