import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchClients = async () => {
  const response = await axios.get(`${backendURI}/client`, {});
  return response.data;
};

export const fetchClientById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/client/${id}`);
  return response.data;
};

export const createClient = async (payload: any) => {
  const response = await axios.post(`${backendURI}/client`, payload);
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
    `${backendURI}/client/${id}`,
    payload
  );
  return response.data;
};
