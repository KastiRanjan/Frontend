import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchBillings = async (status?: string) => {
  const url = status ? `${backendURI}/billing?status=${status}` : `${backendURI}/billing`;
  const response = await axios.get(url);
  return response.data;
};

export const fetchBillingById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/billing/${id}`);
  return response.data;
};

export const createBilling = async (payload: any) => {
  const response = await axios.post(`${backendURI}/billing`, payload);
  return response.data;
};

export const editBilling = async ({
  payload,
  id,
}: {
  payload: any;
  id: string;
}) => {
  const response = await axios.patch(
    `${backendURI}/billing/${id}`,
    payload
  );
  return response.data;
};

export const deleteBilling = async (id: string) => {
  const response = await axios.delete(`${backendURI}/billing/${id}`);
  return response.data;
};
