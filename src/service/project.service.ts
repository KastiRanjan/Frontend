// Fetch project timeline
export const getProjectTimeline = async (projectId: number) => {
  const response = await axios.get(`${backendURI}/projects/${projectId}/timeline`);
  return response.data;
};
import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchProjects = async ({ status }: { status: string }) => {
  const response = await axios.get(`${backendURI}/projects?status=${status}`);
  return response.data;
};
export const fetchProject = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/projects/${id}`);

  return response.data;
};

export const createProject = async (payload: any) => {
  const response = await axios.post(`${backendURI}/projects`, payload);
  return response.data;
};
export const editProject = async ({
  payload,
  id,
}: {
  payload: any;
  id: string;
}) => {
  const response = await axios.patch(`${backendURI}/projects/${id}`, payload);
  return response.data;
};
