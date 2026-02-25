import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientReports,
  fetchClientReportById,
  createClientReport,
  createMultipleClientReports,
  updateClientReport,
  updateReportAccess,
  bulkUpdateReportAccess,
  replaceReportFile,
  deleteClientReport,
  addFilesToReport,
  removeFileFromReport,
  updateReportFileDisplayName,
  fetchReportsByCustomerId,
  fetchCustomerReportStats,
  fetchProjectsByCustomer,
  fetchAccessibleProjects,
  fetchStaffReports
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

// Hook to create multiple client reports (bulk upload) - creates single report with multiple files
export const useCreateMultipleClientReports = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateClientReportPayload, "file"> & { files: File[] }) =>
      createMultipleClientReports(payload),
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

// Hook to add files to an existing report
export const useAddFilesToReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => addFilesToReport(id, files),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["client-reports"] });
      queryClient.invalidateQueries({ queryKey: ["client-report", id] });
    }
  });
};

// Hook to remove a file from a report
export const useRemoveFileFromReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, fileId }: { reportId: string; fileId: string }) =>
      removeFileFromReport(reportId, fileId),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ["client-reports"] });
      queryClient.invalidateQueries({ queryKey: ["client-report", reportId] });
    }
  });
};

// Hook to update a file's display name
export const useUpdateReportFileDisplayName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, fileId, displayFileName }: { reportId: string; fileId: string; displayFileName: string }) =>
      updateReportFileDisplayName(reportId, fileId, displayFileName),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ["client-reports"] });
      queryClient.invalidateQueries({ queryKey: ["client-report", reportId] });
    }
  });
};

// Hook to fetch projects by customer (for dropdown)
export const useProjectsByCustomer = (customerId?: string) => {
  return useQuery({
    queryKey: ["projects-by-customer", customerId],
    queryFn: () => fetchProjectsByCustomer(customerId!),
    enabled: !!customerId
  });
};

// Hook to fetch all projects accessible to the current staff user (all statuses),
// with customer info — for populating client + project dropdowns respecting access.
export const useAccessibleProjects = () => {
  return useQuery({
    queryKey: ["staff-accessible-projects"],
    queryFn: fetchAccessibleProjects
  });
};

// Hook to fetch reports scoped to the current staff user's accessible customers (server-side)
export const useStaffReports = (filters?: ClientReportFilterPayload) => {
  return useQuery({
    queryKey: ["staff-reports", filters],
    queryFn: () => fetchStaffReports(filters)
  });
};
