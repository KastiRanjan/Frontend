import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

export const login = async (payload: any) => {
  return await axios.post(`${backendURI}/auth/login`, payload, {
    withCredentials: true,
  });
};

export const getProfile = async () => {
  return await axios.get(`${backendURI}/auth/profile`, {
    withCredentials: true,
  });
};
