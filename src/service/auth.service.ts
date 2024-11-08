import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

export const login = async (payload: any) => {
  return await axios.post(`${backendURI}/auth/login`, payload, {
    withCredentials: true,
  });
};

export const getProfile = async () => {
  const response = await axios.get(`${backendURI}/auth/profile`, {
    withCredentials: true,
  });
  return response.data;
};


export const logout = async () => {
  const response = await axios.post(`${backendURI}/logout`, {
    withCredentials: true,
  });
  return response.data;
};