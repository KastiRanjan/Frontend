import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

// Define document type enum
export enum DocumentType {
  CITIZENSHIP = 'citizenship',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  PAN_NO = 'pan_no',
  MEMBERSHIP = 'membership',
  OTHERS = 'others'
}

// Map for human-readable document type labels
export const documentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.CITIZENSHIP]: "Citizenship",
  [DocumentType.PASSPORT]: "Passport",
  [DocumentType.DRIVING_LICENSE]: "Driving License",
  [DocumentType.PAN_NO]: "PAN Number",
  [DocumentType.MEMBERSHIP]: "Membership",
  [DocumentType.OTHERS]: "Other Document"
};

// Define types for document operations
export interface UserDocument {
  id: string;
  filename: string;
  documentFile: string;
  documentType?: DocumentType;
  identificationNo?: string;
  dateOfIssue?: string;
  placeOfIssue?: string;
  createdAt: string;
  isVerified: boolean;
  verifiedById?: string;
  verifiedAt?: string;
}

export const useUserDocuments = (userId: string | undefined) => {
  // Fetch all documents for a user
  const fetchDocuments = async (): Promise<UserDocument[]> => {
    if (!userId) return [];
    const response = await axios.get(`${backendURI}/users/${userId}/document`);
    return response.data || [];
  };

  return useQuery<UserDocument[], Error>({
    queryKey: ["userDocuments", userId],
    queryFn: fetchDocuments,
    enabled: !!userId
  });
};

export const useDeleteUserDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, documentId }: { userId: string, documentId: string }) => {
      return axios.delete(`${backendURI}/users/${userId}/document/${documentId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userDocuments", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    }
  });
};

export const useUploadUserDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      file,
      documentType = DocumentType.OTHERS,
      identificationNo,
      dateOfIssue,
      placeOfIssue
    }: { 
      userId: string, 
      file: File,
      documentType?: DocumentType,
      identificationNo?: string,
      dateOfIssue?: string,
      placeOfIssue?: string 
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      if (identificationNo) {
        formData.append('identificationNo', identificationNo);
      }
      
      if (dateOfIssue) {
        formData.append('dateOfIssue', dateOfIssue);
      }
      
      if (placeOfIssue) {
        formData.append('placeOfIssue', placeOfIssue);
      }
      
      return axios.post(`${backendURI}/users/${userId}/document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userDocuments", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    }
  });
};

export const useVerifyUserDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      documentId, 
      isVerified 
    }: { 
      userId: string, 
      documentId: string, 
      isVerified: boolean 
    }) => {
      return axios.post(`${backendURI}/users/${userId}/document/${documentId}/verify`, {
        isVerified,
        verifiedAt: new Date().toISOString()
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate document-specific queries
      queryClient.invalidateQueries({ queryKey: ["userDocuments", variables.userId] });
      
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