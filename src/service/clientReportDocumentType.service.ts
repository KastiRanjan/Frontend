import axios from "axios";
import {
  ClientReportDocumentTypeType,
  ClientReportDocumentTypeWithCount,
  CreateClientReportDocumentTypePayload,
  UpdateClientReportDocumentTypePayload,
  ClientReportDocumentTypeFilterPayload,
} from "@/types/clientReportDocumentType";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

// Get all document types with optional filters
export const fetchDocumentTypes = async (
  filters?: ClientReportDocumentTypeFilterPayload
): Promise<ClientReportDocumentTypeType[]> => {
  const params = new URLSearchParams();
  if (filters?.customerId) params.append("customerId", filters.customerId);
  if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
  if (filters?.includeGlobal !== undefined) params.append("includeGlobal", String(filters.includeGlobal));

  const url = `${backendURI}/client-report-document-type${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await axios.get(url);
  return response.data;
};

// Get all active document types
export const fetchActiveDocumentTypes = async (): Promise<ClientReportDocumentTypeType[]> => {
  const response = await axios.get(`${backendURI}/client-report-document-type/active`);
  return response.data;
};

// Get all global document types
export const fetchGlobalDocumentTypes = async (): Promise<ClientReportDocumentTypeType[]> => {
  const response = await axios.get(`${backendURI}/client-report-document-type/global`);
  return response.data;
};

// Get document types for a specific customer (includes global types)
export const fetchDocumentTypesForCustomer = async (
  customerId: string
): Promise<ClientReportDocumentTypeType[]> => {
  const response = await axios.get(`${backendURI}/client-report-document-type/customer/${customerId}`);
  return response.data;
};

// Get document types with report counts
export const fetchDocumentTypesWithCounts = async (
  customerId?: string
): Promise<ClientReportDocumentTypeWithCount[]> => {
  const params = customerId ? `?customerId=${customerId}` : "";
  const response = await axios.get(`${backendURI}/client-report-document-type/with-counts${params}`);
  return response.data;
};

// Get a single document type by ID
export const fetchDocumentTypeById = async (
  id: string
): Promise<ClientReportDocumentTypeType> => {
  const response = await axios.get(`${backendURI}/client-report-document-type/${id}`);
  return response.data;
};

// Create a new document type
export const createDocumentType = async (
  payload: CreateClientReportDocumentTypePayload
): Promise<ClientReportDocumentTypeType> => {
  const response = await axios.post(`${backendURI}/client-report-document-type`, payload);
  return response.data;
};

// Update a document type
export const updateDocumentType = async (
  id: string,
  payload: UpdateClientReportDocumentTypePayload
): Promise<ClientReportDocumentTypeType> => {
  const response = await axios.patch(`${backendURI}/client-report-document-type/${id}`, payload);
  return response.data;
};

// Delete a document type
export const deleteDocumentType = async (id: string): Promise<void> => {
  await axios.delete(`${backendURI}/client-report-document-type/${id}`);
};

// Toggle document type active status
export const toggleDocumentTypeStatus = async (
  id: string
): Promise<ClientReportDocumentTypeType> => {
  const response = await axios.patch(`${backendURI}/client-report-document-type/${id}/toggle-status`);
  return response.data;
};
