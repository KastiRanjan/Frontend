import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchMyNotifications = async () => {
  const response = await axios.get(`${backendURI}/notification`, {});
  return response.data;
};
export const updateNotifications = async ({ id }: { id: string }) => {
  const response = await axios.patch(`${backendURI}/notification/${id}`, {});
  return response.data;
};
