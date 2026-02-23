import axios from "axios";
import {
  ClientUserType,
  ClientLoginResponse,
  CreateClientUserPayload,
  UpdateClientUserPayload,
  ClientLoginPayload,
  ClientForgotPasswordPayload,
  ClientResetPasswordPayload,
  ClientChangePasswordPayload
} from "@/types/clientUser";
import {
  ClientReportType,
  ClientReportWithDownloadInfo,
  ClientReportStats
} from "@/types/clientReport";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

// Admin APIs for managing client users

export const fetchClientUsers = async (customerId?: string): Promise<ClientUserType[]> => {
  const url = customerId
    ? `${backendURI}/client-users?customerId=${customerId}`
    : `${backendURI}/client-users`;
  const response = await axios.get(url);
  return response.data;
};

export const fetchClientUserById = async (id: string): Promise<ClientUserType> => {
  const response = await axios.get(`${backendURI}/client-users/${id}`);
  return response.data;
};

export const createClientUser = async (
  payload: CreateClientUserPayload
): Promise<ClientUserType> => {
  const response = await axios.post(`${backendURI}/client-users`, payload);
  return response.data;
};

export const updateClientUser = async (
  id: string,
  payload: UpdateClientUserPayload
): Promise<ClientUserType> => {
  const response = await axios.patch(`${backendURI}/client-users/${id}`, payload);
  return response.data;
};

export const deleteClientUser = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`${backendURI}/client-users/${id}`);
  return response.data;
};

// Client Portal APIs (for client users)

export const clientLogin = async (
  payload: ClientLoginPayload
): Promise<ClientLoginResponse> => {
  const response = await axios.post(`${backendURI}/client-portal/login`, payload);
  return response.data;
};

export const clientLogout = async (): Promise<{ success: boolean }> => {
  const response = await axios.post(`${backendURI}/client-portal/logout`);
  return response.data;
};

export const getClientProfile = async (): Promise<ClientUserType> => {
  const response = await axios.get(`${backendURI}/client-portal/profile`);
  return response.data;
};

export const getClientReports = async (): Promise<ClientReportType[]> => {
  const response = await axios.get(`${backendURI}/client-portal/reports`);
  return response.data;
};

export const getClientReportStats = async (): Promise<ClientReportStats> => {
  const response = await axios.get(`${backendURI}/client-portal/reports/stats`);
  return response.data;
};

export const getClientReportDetails = async (
  id: string
): Promise<ClientReportWithDownloadInfo> => {
  const response = await axios.get(`${backendURI}/client-portal/reports/${id}`);
  return response.data;
};

export const downloadClientReport = async (id: string): Promise<Blob> => {
  const response = await axios.get(`${backendURI}/client-portal/reports/${id}/download`, {
    responseType: "blob"
  });
  return response.data;
};

export const clientForgotPassword = async (
  payload: ClientForgotPasswordPayload
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post(`${backendURI}/client-portal/forgot-password`, payload);
  return response.data;
};

export const clientResetPassword = async (
  payload: ClientResetPasswordPayload
): Promise<{ success: boolean }> => {
  const response = await axios.post(`${backendURI}/client-portal/reset-password`, payload);
  return response.data;
};

export const clientChangePassword = async (
  payload: ClientChangePasswordPayload
): Promise<{ success: boolean }> => {
  const response = await axios.post(`${backendURI}/client-portal/change-password`, payload);
  return response.data;
};

// Client Portal: Projects
export const getClientProjects = async (): Promise<any[]> => {
  const response = await axios.get(`${backendURI}/client-portal/projects`);
  return response.data;
};

export const getClientProjectById = async (id: string): Promise<any> => {
  const response = await axios.get(`${backendURI}/client-portal/projects/${id}`);
  return response.data;
};

// Client Portal: Company
export const getClientCompanyDetails = async (): Promise<any> => {
  const response = await axios.get(`${backendURI}/client-portal/company`);
  return response.data;
};
