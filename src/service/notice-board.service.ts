import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

// Get all notice boards (for admins)
export const fetchAllNoticeBoards = async () => {
  const response = await axios.get(`${backendURI}/notice-board`);
  return response.data;
};

// Get notices for the current user
export const fetchMyNoticeBoards = async () => {
  const response = await axios.get(`${backendURI}/notice-board/my-notices`);
  return response.data;
};

// Get a specific notice board by ID
export const fetchNoticeBoard = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/notice-board/${id}`);
  return response.data;
};

// Create a new notice board
export const createNoticeBoard = async (payload: any) => {
  // Ensure boolean values are properly sent
  const enhancedPayload = {
    ...payload,
    sendEmail: payload.sendEmail === true,
    sendToAll: payload.sendToAll === true
  };
  
  console.log('Service sending payload:', JSON.stringify(enhancedPayload));
  const response = await axios.post(`${backendURI}/notice-board`, enhancedPayload);
  return response.data;
};

// Update an existing notice board
export const updateNoticeBoard = async ({ id, payload }: { id: string; payload: any }) => {
  // Ensure boolean values are properly sent
  const enhancedPayload = {
    ...payload,
    sendEmail: payload.sendEmail === true,
    sendToAll: payload.sendToAll === true
  };
  
  console.log('Service sending update payload:', JSON.stringify(enhancedPayload));
  const response = await axios.patch(`${backendURI}/notice-board/${id}`, enhancedPayload);
  return response.data;
};

// Delete a notice board
export const deleteNoticeBoard = async ({ id }: { id: string }) => {
  const response = await axios.delete(`${backendURI}/notice-board/${id}`);
  return response.data;
};

// Mark a notice as read by the current user
export const markNoticeBoardAsRead = async ({ id }: { id: string }) => {
  const response = await axios.patch(`${backendURI}/notice-board/${id}/mark-as-read`, {});
  return response.data;
};

// Get read statistics for a notice board
export const getNoticeBoardReadStatistics = async ({ id }: { id: string }) => {
  const response = await axios.get(`${backendURI}/notice-board/${id}/statistics`);
  return response.data;
};