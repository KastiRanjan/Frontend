import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchUsers = async () => {
  const response = await axios.get(`${backendURI}/users`, {
    withCredentials: true,
  });
  return response.data;
};
