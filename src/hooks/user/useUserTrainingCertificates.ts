import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

// Define types for training certificate operations
export interface UserTrainingCertificate {
  id: string;
  institute: string;
  designationOfCourse: string;
  year: number;
  documentFile: string;
  filename?: string;
  createdAt: string;
  isVerified: boolean;
  verifiedById?: string;
  verifiedAt?: string;
}

export const useUserTrainingCertificates = (userId: string | undefined) => {
  // Fetch all training certificates for a user
  const fetchTrainingCertificates = async (): Promise<UserTrainingCertificate[]> => {
    if (!userId) return [];
    const response = await axios.get(`${backendURI}/users/${userId}/training-certificate`);
    return response.data || [];
  };

  return useQuery<UserTrainingCertificate[], Error>({
    queryKey: ["userTrainingCertificates", userId],
    queryFn: fetchTrainingCertificates,
    enabled: !!userId
  });
};

export const useDeleteUserTrainingCertificate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, trainingId }: { userId: string, trainingId: string }) => {
      return axios.delete(`${backendURI}/users/${userId}/training-certificate/${trainingId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userTrainingCertificates", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    }
  });
};

export const useUploadUserTrainingCertificate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      file,
      institute,
      designationOfCourse,
      year
    }: { 
      userId: string, 
      file: File,
      institute: string,
      designationOfCourse: string,
      year: number
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('institute', institute);
      formData.append('designationOfCourse', designationOfCourse);
      formData.append('year', year.toString());
      
      return axios.post(`${backendURI}/users/${userId}/training-certificate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userTrainingCertificates", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    }
  });
};

export const useVerifyUserTrainingCertificate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      trainingId, 
      isVerified 
    }: { 
      userId: string, 
      trainingId: string, 
      isVerified: boolean 
    }) => {
      return axios.post(`${backendURI}/users/${userId}/training-certificate/${trainingId}/verify`, {
        isVerified,
        verifiedAt: new Date().toISOString()
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate training certificate specific queries
      queryClient.invalidateQueries({ queryKey: ["userTrainingCertificates", variables.userId] });
      
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