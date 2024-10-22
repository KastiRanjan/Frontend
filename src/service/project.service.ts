import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchProjects = async () => {
  const response = await axios.get(
    `${backendURI}/projects?`
  );
  return response.data;
};

export const createProject = async (payload: any) => {
  const response = await axios.post(`${backendURI}/projects`, payload);
  return response.data;
};
export const editProject = async ({payload, id}:{payload: any, id: string}) => {
  const response = await axios.put(`${backendURI}/projects/${id}`, payload);
  return response.data;
};

