import axios from "axios";
import {
  ClientReportType,
  CreateClientReportPayload,
  UpdateClientReportPayload,
  UpdateReportAccessPayload,
  ClientReportFilterPayload,
  ClientReportStats,
  ReportAccessStatus
} from "@/types/clientReport";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

// Admin APIs for managing client reports

export const fetchClientReports = async (
  filters?: ClientReportFilterPayload
): Promise<ClientReportType[]> => {
  const params = new URLSearchParams();
  if (filters?.customerId) params.append("customerId", filters.customerId);
  if (filters?.projectId) params.append("projectId", filters.projectId);
  if (filters?.documentTypeId) params.append("documentTypeId", filters.documentTypeId);
  if (filters?.accessStatus) params.append("accessStatus", filters.accessStatus);
  if (filters?.fiscalYear) params.append("fiscalYear", filters.fiscalYear.toString());

  const url = `${backendURI}/client-reports${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await axios.get(url);
  return response.data;
};

export const fetchClientReportById = async (id: string): Promise<ClientReportType> => {
  const response = await axios.get(`${backendURI}/client-reports/${id}`);
  return response.data;
};

export const createClientReport = async (
  payload: CreateClientReportPayload
): Promise<ClientReportType> => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  formData.append("customerId", payload.customerId);
  if (payload.projectId) formData.append("projectId", payload.projectId);
  if (payload.documentTypeId) formData.append("documentTypeId", payload.documentTypeId);
  if (payload.fiscalYear) formData.append("fiscalYear", payload.fiscalYear.toString());
  if (payload.isVisible !== undefined) formData.append("isVisible", String(payload.isVisible));

  const response = await axios.post(`${backendURI}/client-reports`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const updateClientReport = async (
  id: string,
  payload: UpdateClientReportPayload
): Promise<ClientReportType> => {
  const response = await axios.patch(`${backendURI}/client-reports/${id}`, payload);
  return response.data;
};

export const updateReportAccess = async (
  id: string,
  payload: UpdateReportAccessPayload
): Promise<ClientReportType> => {
  const response = await axios.patch(`${backendURI}/client-reports/${id}/access`, payload);
  return response.data;
};

export const bulkUpdateReportAccess = async (
  ids: string[],
  accessStatus: ReportAccessStatus
): Promise<{ success: boolean }> => {
  const response = await axios.post(`${backendURI}/client-reports/bulk-access`, {
    ids,
    accessStatus
  });
  return response.data;
};

export const replaceReportFile = async (
  id: string,
  file: File
): Promise<ClientReportType> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.put(`${backendURI}/client-reports/${id}/file`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const deleteClientReport = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`${backendURI}/client-reports/${id}`);
  return response.data;
};

export const fetchReportsByCustomerId = async (
  customerId: string
): Promise<ClientReportType[]> => {
  const response = await axios.get(`${backendURI}/client-reports/customer/${customerId}`);
  return response.data;
};

export const fetchCustomerReportStats = async (
  customerId: string
): Promise<ClientReportStats> => {
  const response = await axios.get(`${backendURI}/client-reports/customer/${customerId}/stats`);
  return response.data;
};

export const fetchProjectsByCustomer = async (
  customerId: string
): Promise<{ id: string; name: string; status: string }[]> => {
  const response = await axios.get(
    `${backendURI}/client-reports/customer/${customerId}/projects`
  );
  return response.data;
};
