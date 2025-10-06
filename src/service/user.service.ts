import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error("User API Error:", error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const errorMessage = error.response.data?.message || "Server error occurred";
    throw new Error(errorMessage);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("No response from server. Please check your connection.");
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error("Error setting up request: " + error.message);
  }
};

export const fetchUsers = async ({ status, limit, page, keywords }: { status: string, limit: number, page: number, keywords: string }) => {
  try {
    console.log(`Fetching users with params: status=${status}, limit=${limit}, page=${page}, keywords=${keywords}`);
    const response = await axios.get(`${backendURI}/users?status=${status}&limit=${limit}&page=${page}&keywords=${keywords}`, {});
    console.log("Users API response:", response);
    
    // Return the paginated response data
    // The structure is: { results: User[], currentPage, pageSize, totalItems, etc. }
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchUserById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/users/${id}`);
  return response.data;
};

export const createUser = async (payload: any) => {
  const response = await axios.post(`${backendURI}/users`, payload);
  return response.data;
};
export const createUserDetail = async ({ id, payload, query }: any) => {
  // Determine if payload contains a file
  const hasFile = payload instanceof FormData && 
    (payload.has('documentFile') || payload.get('documentFile'));
  
  // Use the upload endpoint if there's a file, otherwise use regular endpoint
  const endpoint = hasFile 
    ? `${backendURI}/users/${id}/upload?option=${query}`
    : `${backendURI}/users/${id}?option=${query}`;
  
  const response = await axios.post(
    endpoint,
    payload,
    {
      headers: hasFile ? {
        "Content-Type": "multipart/form-data",
      } : undefined,
    }
  );
  return response.data;
};

export const updateUser = async (id: string, payload: any) => {
  const response = await axios.patch(`${backendURI}/users/${id}`, payload);
  return response.data;
};
