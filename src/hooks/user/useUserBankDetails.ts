import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

// Define types for bank detail operations
export interface UserBankDetail {
  id: string;
  bankName: string;
  bankBranch: string;
  accountNo: string;
  documentFile: string;
  filename?: string;
  createdAt: string;
  isVerified: boolean;
  verifiedById?: string;
  verifiedAt?: string;
}

export const useUserBankDetails = (userId: string | undefined) => {
  // Fetch all bank details for a user
  const fetchBankDetails = async (): Promise<UserBankDetail[]> => {
    if (!userId) return [];
    const response = await axios.get(`${backendURI}/users/${userId}/bank-detail`);
    return response.data || [];
  };

  return useQuery<UserBankDetail[], Error>({
    queryKey: ["userBankDetails", userId],
    queryFn: fetchBankDetails,
    enabled: !!userId
  });
};

export const useDeleteUserBankDetail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, bankDetailId }: { userId: string, bankDetailId: string }) => {
      return axios.delete(`${backendURI}/users/${userId}/bank-detail/${bankDetailId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userBankDetails", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    }
  });
};

export const useUploadUserBankDetail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      file,
      bankName,
      bankBranch,
      accountNo
    }: { 
      userId: string, 
      file: File,
      bankName: string,
      bankBranch: string,
      accountNo: string
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bankName', bankName);
      formData.append('bankBranch', bankBranch);
      formData.append('accountNo', accountNo);
      
      return axios.post(`${backendURI}/users/${userId}/bank-detail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userBankDetails", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    }
  });
};

export const useVerifyUserBankDetail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      bankDetailId, 
      isVerified 
    }: { 
      userId: string, 
      bankDetailId: string, 
      isVerified: boolean 
    }) => {
      return axios.post(`${backendURI}/users/${userId}/bank-detail/${bankDetailId}/verify`, {
        isVerified,
        verifiedAt: new Date().toISOString()
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate bank detail specific queries
      queryClient.invalidateQueries({ queryKey: ["userBankDetails", variables.userId] });
      
      // Invalidate all user-related queries to ensure profile and dashboard reflect changes
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
      
      // Invalidate any potential document verification status displays
      queryClient.invalidateQueries({ queryKey: ["documentVerificationStatus"] });
      
      // Also invalidate dashboard since it might show verification statistics
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
};