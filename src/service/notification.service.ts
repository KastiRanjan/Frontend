import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchMyNotifications = async (userId: string) => {
  const response = await axios.get(`${backendURI}/notification/user/${userId}`);
  return response.data;
};

export const updateNotifications = async ({ id, userId }: { id: string, userId: string }) => {
  const response = await axios.patch(`${backendURI}/notification/read/${userId}/${id}`, {});
  return response.data;
};
