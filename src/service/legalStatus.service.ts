import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface LegalStatus {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const fetchLegalStatuses = async () => {
  const response = await axios.get(`${backendURI}/legal-status`);
  return response.data;
};

export const createLegalStatus = async (data: Partial<LegalStatus>) => {
  const response = await axios.post(`${backendURI}/legal-status`, data);
  return response.data;
};

export const updateLegalStatus = async (id: string, data: Partial<LegalStatus>) => {
  const response = await axios.patch(`${backendURI}/legal-status/${id}`, data);
  return response.data;
};

export const deleteLegalStatus = async (id: string) => {
  const response = await axios.delete(`${backendURI}/legal-status/${id}`);
  return response.data;
};
