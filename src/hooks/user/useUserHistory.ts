import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const backendURI = import.meta.env.VITE_BACKEND_URI;

// History action types from backend
export enum HistoryActionType {
  ROLE_CHANGE = 'role_change',
  PROFILE_UPDATE = 'profile_update',
  DEPARTMENT_CHANGE = 'department_change',
  LEAVE_BALANCE_UPDATE = 'leave_balance_update',
  CONTRACT_UPDATE = 'contract_update',
  STATUS_CHANGE = 'status_change',
  VERIFICATION = 'verification',
  OTHER = 'other'
}

// Type for user history item
export interface UserHistoryItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  modifiedById?: string;
  modifiedBy?: {
    id: string;
    name: string;
    email: string;
  };
  actionType: HistoryActionType;
  field: string;
  oldValue: string;
  newValue: string;
  description?: string;
}

// Query params interface for filtering history
export interface UserHistoryQueryParams {
  actionType?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Hook to fetch user history
 */
export const useUserHistory = (
  userId: string | undefined, 
  queryParams?: UserHistoryQueryParams
) => {
  // Fetch history with optional filters
  const fetchHistory = async (): Promise<UserHistoryItem[]> => {
    if (!userId) return [];
    
    // Construct URL with query parameters
    const url = new URL(`${backendURI}/users/${userId}/history`);
    
    if (queryParams?.actionType) {
      url.searchParams.append('actionType', queryParams.actionType);
    }
    
    if (queryParams?.startDate) {
      url.searchParams.append('startDate', queryParams.startDate);
    }
    
    if (queryParams?.endDate) {
      url.searchParams.append('endDate', queryParams.endDate);
    }
    
    const response = await axios.get(url.toString());
    return response.data || [];
  };

  return useQuery<UserHistoryItem[], Error>({
    queryKey: [
      "userHistory", 
      userId, 
      queryParams?.actionType, 
      queryParams?.startDate, 
      queryParams?.endDate
    ],
    queryFn: fetchHistory,
    enabled: !!userId
  });
};