import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface MailSettingsData {
  enabled: boolean;
  clockInRemindersEnabled: boolean;
  clockOutRemindersEnabled: boolean;
  gracePeriodMinutes: number;
  cronSchedule: string;
  excludedRoles: string[];
}

export const getMailSettings = async () => {
  const response = await axios.get(`${backendURI}/mail-settings`);
  return response.data;
};

export const updateMailSettings = async (data: MailSettingsData) => {
  const response = await axios.put(`${backendURI}/mail-settings`, data);
  return response.data;
};
