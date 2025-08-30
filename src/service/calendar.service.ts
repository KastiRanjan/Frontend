import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface CreateCalendarDto {
  date: string;
  type: string;
  title: string;
  description?: string;
}

export interface UpdateCalendarDto {
  date?: string;
  type?: string;
  title?: string;
  description?: string;
}

export interface CalendarType {
  id: string;
  date: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchCalendarEvents = async () => {
  const response = await axios.get(`${backendURI}/calendar`);
  return response.data;
};

export const createCalendarEvent = async (payload: CreateCalendarDto) => {
  const response = await axios.post(`${backendURI}/calendar`, payload);
  return response.data;
};

export const updateCalendarEvent = async (id: string, payload: UpdateCalendarDto) => {
  const response = await axios.patch(`${backendURI}/calendar/${id}`, payload);
  return response.data;
};

export const deleteCalendarEvent = async (id: string) => {
  const response = await axios.delete(`${backendURI}/calendar/${id}`);
  return response.data;
};

export const convertAdToBs = async (adDate: string) => {
  const response = await axios.get(`${backendURI}/calendar/convert/ad-to-bs`, {
    params: { adDate }
  });
  return response.data;
};

export const convertBsToAd = async (bsDate: string) => {
  const response = await axios.get(`${backendURI}/calendar/convert/bs-to-ad`, {
    params: { bsDate }
  });
  return response.data;
};

export const getCalendarByMonth = async (year: number, month: number, calendarType: 'AD' | 'BS' = 'AD') => {
  const response = await axios.get(`${backendURI}/calendar/month`, {
    params: { year, month, calendarType }
  });
  return response.data;
};
