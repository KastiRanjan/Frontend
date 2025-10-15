import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface CreateSignoffDto {
  projectId: string;
  teamFitnessRemark: string;
  wasTeamFit: boolean;
  completionQuality: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'poor';
  qualityRemark?: string;
  facedProblems: boolean;
  problemsRemark?: string;
  wentAsPlanned: boolean;
  futureSuggestions?: string;
}

export const createSignoff = async (payload: CreateSignoffDto) => {
  const response = await axios.post(`${backendURI}/project-signoff`, payload);
  return response.data;
};

export const getSignoffByProject = async (projectId: string) => {
  const response = await axios.get(`${backendURI}/project-signoff/project/${projectId}`);
  return response.data;
};

export const updateSignoff = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CreateSignoffDto>;
}) => {
  const response = await axios.patch(`${backendURI}/project-signoff/${id}`, payload);
  return response.data;
};

export const deleteSignoff = async (id: string) => {
  const response = await axios.delete(`${backendURI}/project-signoff/${id}`);
  return response.data;
};
