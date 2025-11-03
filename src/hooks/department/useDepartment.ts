import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

const fetchDepartments = async ({ page, limit }: { page: number; limit: number }) => {
  const response = await axios.get(`${backendURI}/department?page=${page}&limit=${limit}`);
  return response.data;
};

export const useDepartments = ({ page, limit }: { page: number; limit: number }) => {
  return useQuery({
    queryKey: ["departments", page, limit],
    queryFn: () => fetchDepartments({ page, limit }),
  });
};
