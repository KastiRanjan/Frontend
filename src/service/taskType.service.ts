import axios from "axios";
import { TaskType } from "@/types/todoTask";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error);
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

// TaskType API Functions
export const fetchTaskTypes = async () => {
  try {
    console.log("Fetching task types from API");
    const response = await axios.get(`${backendURI}/task-type`);
    console.log("Task types API response:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching task types:", error);
    return handleApiError(error);
  }
};

export const fetchTaskTypeById = async (id: string) => {
  try {
    const response = await axios.get(`${backendURI}/task-type/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createTaskType = async (payload: Partial<TaskType>) => {
  try {
    console.log("Creating task type with payload:", payload);
    const response = await axios.post(`${backendURI}/task-type`, payload);
    console.log("Create task type response:", response);
    return response.data;
  } catch (error) {
    console.error("Error creating task type:", error);
    return handleApiError(error);
  }
};

export const updateTaskType = async ({ id, payload }: { id: string, payload: Partial<TaskType> }) => {
  try {
    console.log(`Updating task type ${id} with payload:`, payload);
    const response = await axios.patch(`${backendURI}/task-type/${id}`, payload);
    console.log("Update task type response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error updating task type ${id}:`, error);
    return handleApiError(error);
  }
};

export const deleteTaskType = async (id: string) => {
  try {
    console.log(`Deleting task type ${id}`);
    const response = await axios.delete(`${backendURI}/task-type/${id}`);
    console.log("Delete task type response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error deleting task type ${id}:`, error);
    return handleApiError(error);
  }
};