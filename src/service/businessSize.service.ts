import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface BusinessSize {
  id: string;
  name: string;
  shortName: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchBusinessSizes = async () => {
  const response = await axios.get(`${backendURI}/business-size`);
  return response.data;
};

export const createBusinessSize = async (payload: Pick<BusinessSize, "name" | "shortName">) => {
  const response = await axios.post(`${backendURI}/business-size`, payload);
  return response.data;
};

export const updateBusinessSize = async (id: string, payload: Pick<BusinessSize, "name" | "shortName">) => {
  const response = await axios.patch(`${backendURI}/business-size/${id}`, payload);
  return response.data;
};

export const deleteBusinessSize = async (id: string) => {
  const response = await axios.delete(`${backendURI}/business-size/${id}`);
  return response.data;
};
