import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchPermissions = async ({
  limit,
  page,
}: {
  limit: number;
  page: number;
}) => {
  const response = await axios.get(
    `${backendURI}/permissions?limit=${limit}&page=${page}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const createPermission = async (payload: any) => {
  const response = await axios.post(`${backendURI}/permissions`, payload, {
    withCredentials: true,
  });
  return response.data;
};
