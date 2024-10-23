import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchUsers = async () => {
  const response = await axios.get(`${backendURI}/users`, {
  });
  return response.data;
};



export const fetchUserById = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/users/${id}`);
  return response.data;
};