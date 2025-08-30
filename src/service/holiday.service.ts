import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface CreateHolidayDto {
  date: string;
  type: string;
  title: string;
  description?: string;
  bsDate?: string;
}

export interface UpdateHolidayDto {
  date?: string;
  type?: string;
  title?: string;
  description?: string;
  bsDate?: string;
}

export interface HolidayType {
  id: string;
  date: string;
  type: string;
  title: string;
  description?: string;
  bsDate?: string;
}

export const fetchHolidays = async () => {
  const response = await axios.get(`${backendURI}/holiday`);
  return response.data;
};

export const createHoliday = async (payload: CreateHolidayDto) => {
  const response = await axios.post(`${backendURI}/holiday`, payload);
  return response.data;
};

export const updateHoliday = async (id: string, payload: UpdateHolidayDto) => {
  const response = await axios.patch(`${backendURI}/holiday/${id}`, payload);
  return response.data;
};

export const deleteHoliday = async (id: string) => {
  const response = await axios.delete(`${backendURI}/holiday/${id}`);
  return response.data;
};

export const importHolidaysFromCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${backendURI}/holiday/import-csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const previewHolidaysFromCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${backendURI}/holiday/preview-csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
