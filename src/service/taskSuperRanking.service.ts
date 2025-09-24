import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface TaskSuperGlobalRankingPayload {
  id: string;
  rank: number;
}

export const updateTaskSuperGlobalRankings = async (rankings: TaskSuperGlobalRankingPayload[]) => {
  const response = await axios.patch(`${backendURI}/task-super/rankings`, rankings);
  return response.data;
};
