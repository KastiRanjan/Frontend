import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { WorkhourType } from "../../types/workhour";

const backendURI = import.meta.env.VITE_BACKEND_URI;
axios.defaults.withCredentials = true;

export function useWorkhourByUser(userId: string) {
  return useQuery({
    queryKey: ["workhour", "user", userId],
    queryFn: async (): Promise<WorkhourType | null> => {
      try {
        const response = await axios.get(`${backendURI}/workhour/resolve/${userId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching workhour:", error);
        return null;
      }
    },
    enabled: !!userId,
  });
}

export function useWorkhourByRole(roleId: string) {
  return useQuery({
    queryKey: ["workhour", "role", roleId],
    queryFn: async (): Promise<WorkhourType | null> => {
      try {
        const response = await axios.get(`${backendURI}/workhour/role/${roleId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching workhour by role:", error);
        return null;
      }
    },
    enabled: !!roleId,
  });
}
