import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientReports,
  fetchClientReportById,
  createClientReport,
  updateClientReport,
  updateReportAccess,
  bulkUpdateReportAccess,
  replaceReportFile,
  deleteClientReport,
  fetchReportsByCustomerId,
  fetchCustomerReportStats,
  fetchProjectsByCustomer
} from "@/service/clientReport.service";
import {
  ClientReportFilterPayload,
  CreateClientReportPayload,
  UpdateClientReportPayload,
  UpdateReportAccessPayload,
  ReportAccessStatus
} from "@/types/clientReport";

// Hook to fetch all client reports with optional filters
export const useClientReports = (filters?: ClientReportFilterPayload) => {
  return useQuery({
    queryKey: ["client-reports", filters],
    queryFn: () => fetchClientReports(filters)
  });
};

// Hook to fetch a single client report by ID
export const useClientReportById = (id: string) => {
  return useQuery({
    queryKey: ["client-report", id],
    queryFn: () => fetchClientReportById(id),
    enabled: !!id
  });
};

// Hook to fetch reports by customer ID
export const useClientReportsByCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ["client-reports", "customer", customerId],
    queryFn: () => fetchReportsByCustomerId(customerId),
    enabled: !!customerId
  });
};

// Hook to fetch customer report stats
export const useCustomerReportStats = (customerId: string) => {
  return useQuery({
    queryKey: ["client-reports", "customer", customerId, "stats"],
    queryFn: () => fetchCustomerReportStats(customerId),
    enabled: !!customerId
  });
};

// Hook to create a new client report
export const useCreateClientReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientReportPayload) => createClientReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-reports"] });
    }
  });
};

// Hook to update a client report
export const useUpdateClientReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientReportPayload }) =>
      updateClientReport(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["client-reports"] });
      queryClient.invalidateQueries({ queryKey: ["client-report", id] });
    }
  });
};

// Hook to update report access status
export const useUpdateReportAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReportAccessPayload }) =>
      updateReportAccess(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["client-reports"] });
      queryClient.invalidateQueries({ queryKey: ["client-report", id] });
    }
  });
};

// Hook to bulk update report access
export const useBulkUpdateReportAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, accessStatus }: { ids: string[]; accessStatus: ReportAccessStatus }) =>
      bulkUpdateReportAccess(ids, accessStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-reports"] });
    }
  });
};

// Hook to replace report file
export const useReplaceReportFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => replaceReportFile(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["client-reports"] });
      queryClient.invalidateQueries({ queryKey: ["client-report", id] });
    }
  });
};

// Hook to delete a client report
export const useDeleteClientReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClientReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-reports"] });
    }
  });
};

// Hook to fetch projects by customer (for report creation dropdown)
export const useProjectsByCustomer = (customerId?: string) => {
  return useQuery({
    queryKey: ["projects-by-customer", customerId],
    queryFn: () => fetchProjectsByCustomer(customerId!),
    enabled: !!customerId
  });
};
