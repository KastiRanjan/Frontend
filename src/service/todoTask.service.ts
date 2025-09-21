import axios from "axios";
import { TodoTaskStatus } from "@/types/todoTask";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error("TodoTask API Error:", error);
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

// TodoTask API Functions
export const fetchTodoTasks = async (status?: TodoTaskStatus, assignedToId?: string) => {
  try {
    let url = `${backendURI}/todo-task`;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (assignedToId) params.append('assignedToId', assignedToId);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log(`Fetching all todo tasks with URL: ${url}`);
    const response = await axios.get(url);
    console.log('Todo tasks response:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchTodoTaskById = async (id: string) => {
  try {
    const response = await axios.get(`${backendURI}/todo-task/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchTodoTasksByStatus = async (status: TodoTaskStatus) => {
  try {
    console.log(`Fetching todo tasks by status: ${status}`);
    const response = await axios.get(`${backendURI}/todo-task/status/${status}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchTodoTasksByAssignedUser = async (userId: string, status?: TodoTaskStatus) => {
  try {
    let url = `${backendURI}/todo-task/assigned/${userId}`;
    
    if (status) {
      url += `?status=${status}`;
    }
    
    console.log(`Fetching todo tasks for assigned user: ${userId} with URL: ${url}`);
    const response = await axios.get(url);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks by assigned user:', error);
    return handleApiError(error);
  }
};

export const fetchTodoTasksByCreatedUser = async (userId: string, status?: TodoTaskStatus) => {
  try {
    const url = status 
      ? `${backendURI}/todo-task/created/${userId}?status=${status}` 
      : `${backendURI}/todo-task/created/${userId}`;
    
    console.log(`Fetching todo tasks created by user: ${userId} with URL: ${url}`);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createTodoTask = async (payload: any) => {
  try {
    console.log(`Creating todo task with payload:`, payload);
    const response = await axios.post(`${backendURI}/todo-task`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateTodoTask = async ({ id, payload }: { id: string, payload: any }) => {
  try {
    console.log(`Updating todo task ${id} with payload:`, payload);
    const response = await axios.patch(`${backendURI}/todo-task/${id}`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteTodoTask = async (id: string) => {
  try {
    console.log(`Deleting todo task ${id}`);
    const response = await axios.delete(`${backendURI}/todo-task/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const acknowledgeTodoTask = async ({ id, payload }: { id: string, payload: any }) => {
  try {
    console.log(`Acknowledging todo task ${id} with payload:`, payload);
    const response = await axios.patch(`${backendURI}/todo-task/${id}/acknowledge`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const markTodoTaskAsPending = async ({ id, payload }: { id: string, payload: any }) => {
  try {
    console.log(`Marking todo task ${id} as pending with payload:`, payload);
    const response = await axios.patch(`${backendURI}/todo-task/${id}/pending`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const completeTodoTask = async ({ id, payload }: { id: string, payload: any }) => {
  try {
    console.log(`Completing todo task ${id} with payload:`, payload);
    const response = await axios.patch(`${backendURI}/todo-task/${id}/complete`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const dropTodoTask = async ({ id, payload }: { id: string, payload: any }) => {
  try {
    console.log(`Dropping todo task ${id} with payload:`, payload);
    const response = await axios.patch(`${backendURI}/todo-task/${id}/drop`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};