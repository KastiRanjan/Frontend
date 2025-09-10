import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchClients = async (status?: string) => {
  const url = status 
    ? `${backendURI}/clients?status=${status}` 
    : `${backendURI}/clients`;
  const response = await axios.get(url, {});
  return response.data;
};

export const fetchClientById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/clients/${id}`);
  return response.data;
};

export const createClient = async (payload: any) => {
  const response = await axios.post(`${backendURI}/clients`, payload);
  return response.data;
};

export const editClient = async ({
  payload,
  id,
}: {
  payload: any;
  id: string;
}) => {
  const response = await axios.patch(
    `${backendURI}/clients/${id}`,
    payload
  );
  return response.data;
};

// Portal Credentials APIs
export const fetchPortalCredentials = async (clientId: string) => {
  const response = await axios.get(`${backendURI}/clients/${clientId}/portal-credentials`);
  return response.data;
};

export const fetchPortalCredentialById = async (clientId: string, credentialId: string) => {
  const response = await axios.get(`${backendURI}/clients/${clientId}/portal-credentials/${credentialId}`);
  return response.data;
};

export const createPortalCredential = async (clientId: string, payload: any) => {
  const response = await axios.post(`${backendURI}/clients/${clientId}/portal-credentials`, payload);
  return response.data;
};

export const updatePortalCredential = async (clientId: string, credentialId: string, payload: any) => {
  const response = await axios.patch(
    `${backendURI}/clients/${clientId}/portal-credentials/${credentialId}`,
    payload
  );
  return response.data;
};

export const deletePortalCredential = async (clientId: string, credentialId: string) => {
  const response = await axios.delete(`${backendURI}/clients/${clientId}/portal-credentials/${credentialId}`);
  return response.data;
};
