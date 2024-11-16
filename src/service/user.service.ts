import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchUsers = async () => {
  const response = await axios.get(`${backendURI}/users`, {});
  return response.data;
};

export const fetchUserById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/users/${id}`);
  return response.data;
};

export const createUser = async (payload: any) => {
  const response = await axios.post(`${backendURI}/users`, payload);
  return response.data;
};
export const createUserDetail = async ({ id, payload, query }: any) => {
  const response = await axios.post(
    `${backendURI}/users/${id}?option=${query}`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const updateUser = async (id: string, payload: any) => {
  const response = await axios.patch(`${backendURI}/users/${id}`, payload);
  return response.data;
};
