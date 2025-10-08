import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

// Define types for education detail operations
export interface UserEducationDetail {
  id: string;
  universityCollege: string;
  faculty: string;
  yearOfPassing: number;
  placeOfIssue: string;
  documentFile: string;
  filename?: string;
  createdAt: string;
  isVerified: boolean;
  verifiedById?: string;
  verifiedAt?: string;
}

export const useUserEducationDetails = (userId: string | undefined) => {
  // Fetch all education details for a user
  const fetchEducationDetails = async (): Promise<UserEducationDetail[]> => {
    if (!userId) return [];
    const response = await axios.get(`${backendURI}/users/${userId}/education-detail`);
    return response.data || [];
  };

  return useQuery<UserEducationDetail[], Error>({
    queryKey: ["userEducationDetails", userId],
    queryFn: fetchEducationDetails,
    enabled: !!userId
  });
};

export const useDeleteUserEducationDetail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, educationDetailId }: { userId: string, educationDetailId: string }) => {
      return axios.delete(`${backendURI}/users/${userId}/education-detail/${educationDetailId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userEducationDetails", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    }
  });
};

export const useUploadUserEducationDetail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      file,
      universityCollege,
      faculty,
      yearOfPassing,
      placeOfIssue
    }: { 
      userId: string, 
      file: File,
      universityCollege: string,
      faculty: string,
      yearOfPassing: number,
      placeOfIssue: string
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('universityCollege', universityCollege);
      formData.append('faculty', faculty);
      formData.append('yearOfPassing', yearOfPassing.toString());
      formData.append('placeOfIssue', placeOfIssue);
      
      return axios.post(`${backendURI}/users/${userId}/education-detail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userEducationDetails", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    }
  });
};

export const useVerifyUserEducationDetail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      educationDetailId, 
      isVerified 
    }: { 
      userId: string, 
      educationDetailId: string, 
      isVerified: boolean 
    }) => {
      return axios.post(`${backendURI}/users/${userId}/education-detail/${educationDetailId}/verify`, {
        isVerified,
        verifiedAt: new Date().toISOString()
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate education detail specific queries
      queryClient.invalidateQueries({ queryKey: ["userEducationDetails", variables.userId] });
      
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