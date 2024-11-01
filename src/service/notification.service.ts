import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchMyNotifications = async () => {
  const response = await axios.get(`${backendURI}/notification`, {});
  return response.data;
};
