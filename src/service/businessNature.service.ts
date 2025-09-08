import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface BusinessNature {
  id: string;
  name: string;
  shortName: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchBusinessNatures = async () => {
  const response = await axios.get(`${backendURI}/business-nature`);
  return response.data;
};

export const createBusinessNature = async (payload: Pick<BusinessNature, "name" | "shortName">) => {
  const response = await axios.post(`${backendURI}/business-nature`, payload);
  return response.data;
};

export const updateBusinessNature = async (id: string, payload: Pick<BusinessNature, "name" | "shortName">) => {
  const response = await axios.patch(`${backendURI}/business-nature/${id}`, payload);
  return response.data;
};

export const deleteBusinessNature = async (id: string) => {
  const response = await axios.delete(`${backendURI}/business-nature/${id}`);
  return response.data;
};
