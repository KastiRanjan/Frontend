import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface NatureOfWork {
  id: string;
  name: string;
  shortName: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchNatureOfWorks = async () => {
  const response = await axios.get(`${backendURI}/nature-of-work`);
  return response.data;
};

export const createNatureOfWork = async (payload: Pick<NatureOfWork, "name" | "shortName">) => {
  const response = await axios.post(`${backendURI}/nature-of-work`, payload);
  return response.data;
};

export const updateNatureOfWork = async (id: string, payload: Pick<NatureOfWork, "name" | "shortName">) => {
  const response = await axios.patch(`${backendURI}/nature-of-work/${id}`, payload);
  return response.data;
};

export const deleteNatureOfWork = async (id: string) => {
  const response = await axios.delete(`${backendURI}/nature-of-work/${id}`);
  return response.data;
};
