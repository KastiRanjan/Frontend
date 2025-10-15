import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface CreateEvaluationDto {
  projectId: string;
  evaluatedUserId: string;
  worklogTime: 'good' | 'very_good' | 'neutral' | 'poor' | 'bad';
  behaviour: 'good' | 'very_good' | 'neutral' | 'poor' | 'bad';
  learning: 'good' | 'very_good' | 'neutral' | 'poor' | 'bad';
  communication: 'good' | 'very_good' | 'neutral' | 'poor' | 'bad';
  accountability: 'good' | 'very_good' | 'neutral' | 'poor' | 'bad';
  harmony?: 'good' | 'very_good' | 'neutral' | 'poor' | 'bad';
  coordination?: 'good' | 'very_good' | 'neutral' | 'poor' | 'bad';
  remarks?: string;
}

export const createEvaluation = async (payload: CreateEvaluationDto) => {
  const response = await axios.post(`${backendURI}/project-evaluation`, payload);
  return response.data;
};

export const getEvaluationsByProject = async (projectId: string) => {
  const response = await axios.get(`${backendURI}/project-evaluation/project/${projectId}`);
  return response.data;
};

export const getEvaluationsByUser = async (userId: string) => {
  const response = await axios.get(`${backendURI}/project-evaluation/user/${userId}`);
  return response.data;
};

export const updateEvaluation = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CreateEvaluationDto>;
}) => {
  const response = await axios.patch(`${backendURI}/project-evaluation/${id}`, payload);
  return response.data;
};

export const deleteEvaluation = async (id: string) => {
  const response = await axios.delete(`${backendURI}/project-evaluation/${id}`);
  return response.data;
};
