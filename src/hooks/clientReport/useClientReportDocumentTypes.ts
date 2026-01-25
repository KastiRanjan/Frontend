import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDocumentTypes,
  fetchActiveDocumentTypes,
  fetchGlobalDocumentTypes,
  fetchDocumentTypesForCustomer,
  fetchDocumentTypesWithCounts,
  fetchDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  toggleDocumentTypeStatus,
} from "@/service/clientReportDocumentType.service";
import {
  ClientReportDocumentTypeFilterPayload,
  CreateClientReportDocumentTypePayload,
  UpdateClientReportDocumentTypePayload,
} from "@/types/clientReportDocumentType";

// Hook to fetch all document types with optional filters
export const useDocumentTypes = (filters?: ClientReportDocumentTypeFilterPayload) => {
  return useQuery({
    queryKey: ["client-report-document-types", filters],
    queryFn: () => fetchDocumentTypes(filters),
  });
};

// Hook to fetch all active document types
export const useActiveDocumentTypes = () => {
  return useQuery({
    queryKey: ["client-report-document-types", "active"],
    queryFn: fetchActiveDocumentTypes,
  });
};

// Hook to fetch global document types
export const useGlobalDocumentTypes = () => {
  return useQuery({
    queryKey: ["client-report-document-types", "global"],
    queryFn: fetchGlobalDocumentTypes,
  });
};

// Hook to fetch document types for a specific customer
export const useDocumentTypesForCustomer = (customerId?: string) => {
  return useQuery({
    queryKey: ["client-report-document-types", "customer", customerId],
    queryFn: () => fetchDocumentTypesForCustomer(customerId!),
    enabled: !!customerId,
  });
};

// Hook to fetch document types with report counts
export const useDocumentTypesWithCounts = (customerId?: string) => {
  return useQuery({
    queryKey: ["client-report-document-types", "with-counts", customerId],
    queryFn: () => fetchDocumentTypesWithCounts(customerId),
  });
};

// Hook to fetch a single document type by ID
export const useDocumentTypeById = (id: string) => {
  return useQuery({
    queryKey: ["client-report-document-type", id],
    queryFn: () => fetchDocumentTypeById(id),
    enabled: !!id,
  });
};

// Hook to create a new document type
export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientReportDocumentTypePayload) => createDocumentType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-report-document-types"] });
    },
  });
};

// Hook to update a document type
export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientReportDocumentTypePayload }) =>
      updateDocumentType(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["client-report-document-types"] });
      queryClient.invalidateQueries({ queryKey: ["client-report-document-type", id] });
    },
  });
};

// Hook to delete a document type
export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDocumentType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-report-document-types"] });
    },
  });
};

// Hook to toggle document type status
export const useToggleDocumentTypeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleDocumentTypeStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["client-report-document-types"] });
      queryClient.invalidateQueries({ queryKey: ["client-report-document-type", id] });
    },
  });
};
