import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  clientLogin,
  clientLogout,
  getClientProfile,
  getClientReports,
  getClientReportStats,
  getClientReportDetails,
  downloadClientReport,
  clientForgotPassword,
  clientResetPassword,
  clientChangePassword
} from "@/service/clientPortal.service";
import {
  ClientLoginPayload,
  ClientForgotPasswordPayload,
  ClientResetPasswordPayload,
  ClientChangePasswordPayload
} from "@/types/clientUser";

// Hook for client login
export const useClientLogin = () => {
  return useMutation({
    mutationFn: (payload: ClientLoginPayload) => clientLogin(payload)
    // Note: Navigation and token storage are handled in the Login component
    // to support customer selection flow
  });
};

// Hook for client logout
export const useClientLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clientLogout(),
    onSuccess: () => {
      localStorage.removeItem("client_token");
      localStorage.removeItem("client_user");
      queryClient.clear();
      navigate("/client-login");
    }
  });
};

// Hook to get client profile
export const useClientProfile = () => {
  return useQuery({
    queryKey: ["client-profile"],
    queryFn: () => getClientProfile(),
    retry: false
  });
};

// Hook to get client's reports
export const useMyClientReports = (customerId?: string) => {
  return useQuery({
    queryKey: ["my-client-reports", customerId],
    queryFn: () => getClientReports(),
    enabled: !!customerId
  });
};

// Hook to get client report stats
export const useMyClientReportStats = (customerId?: string) => {
  return useQuery({
    queryKey: ["my-client-report-stats", customerId],
    queryFn: () => getClientReportStats(),
    enabled: !!customerId
  });
};

// Hook to get a single report details
export const useClientReportDetails = (id: string) => {
  return useQuery({
    queryKey: ["client-report-details", id],
    queryFn: () => getClientReportDetails(id),
    enabled: !!id
  });
};

// Hook to download a report
export const useDownloadClientReport = () => {
  return useMutation({
    mutationFn: async ({ id, fileName }: { id: string; fileName: string }) => {
      const blob = await downloadClientReport(id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    }
  });
};

// Hook for forgot password
export const useClientForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ClientForgotPasswordPayload) => clientForgotPassword(payload)
  });
};

// Hook for reset password
export const useClientResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ClientResetPasswordPayload) => clientResetPassword(payload),
    onSuccess: () => {
      navigate("/client-login");
    }
  });
};

// Hook for change password
export const useClientChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ClientChangePasswordPayload) => clientChangePassword(payload)
  });
};
