import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface TaskRankingPayload {
  taskId: string;
  rank: number;
}

export interface TaskSuperRankingPayload {
  taskSuperProjectId: string;
  rank: number;
}

export interface TaskGroupRankingPayload {
  taskGroupProjectId: string;
  rank: number;
}

export const fetchTaskRankings = async (projectId: string) => {
  const response = await axios.get(`${backendURI}/tasks-ranking?projectId=${projectId}`);
  return response.data;
};

export const updateTaskRankings = async (projectId: string, rankings: TaskRankingPayload[]) => {
  const response = await axios.patch(`${backendURI}/tasks-ranking`, {
    projectId,
    rankings
  });
  return response.data;
};

export const updateTaskSuperRankings = async (projectId: string, rankings: TaskSuperRankingPayload[]) => {
  const response = await axios.patch(`${backendURI}/tasks-ranking/task-super`, {
    projectId,
    rankings
  });
  return response.data;
};

export const updateTaskGroupRankings = async (projectId: string, rankings: TaskGroupRankingPayload[]) => {
  const response = await axios.patch(`${backendURI}/tasks-ranking/task-group`, {
    projectId,
    rankings
  });
  return response.data;
};