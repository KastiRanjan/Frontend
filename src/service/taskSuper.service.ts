import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchTaskSuper = async () => {
  const response = await axios.get(`${backendURI}/task-super`);
  return response.data;
};

export const fetchTaskSuperById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/task-super/${id}`);
  return response.data;
};

export const createTaskSuper = async (payload: any) => {
  const response = await axios.post(`${backendURI}/task-super`, payload);
  return response.data;
};

export const editTaskSuper = async ({
  payload,
  id,
}: {
  payload: any;
  id: string;
}) => {
  const response = await axios.patch(`${backendURI}/task-super/${id}`, payload);
  return response.data;
};

export const deleteTaskSuper = async ({ id }: { id: string }) => {
  const response = await axios.delete(`${backendURI}/task-super/${id}`);
  return response.data;
};

/**
 * Adds task templates and subtasks to a project
 * @param payload The payload containing project ID, task super ID, and selected templates/subtasks
 * @returns The response data from the API
 */
export const addTaskSuperToProject = async (payload: any) => {
  try {
    // Add validation for required fields to catch errors client-side if possible
    if (!payload.projectId) {
      throw new Error('Project ID is required');
    }
    
    if (!payload.taskSuperId) {
      throw new Error('Task Super ID is required');
    }
    
    if (!payload.selectedTemplates || !Array.isArray(payload.selectedTemplates) || payload.selectedTemplates.length === 0) {
      throw new Error('At least one template must be selected');
    }
    
    // Log payload information for debugging
    console.log('Sending add-to-project payload:', {
      projectId: payload.projectId,
      taskSuperId: payload.taskSuperId,
      templateCount: payload.selectedTemplates?.length || 0,
      subtaskCount: payload.selectedSubtasks?.length || 0,
      groupCount: payload.selectedGroups?.length || 0
    });

    // Make the API call
    const response = await axios.post(`${backendURI}/task-super/add-to-project`, payload);
    
    // Log success information
    console.log('Task Super added to project successfully:', {
      status: response.status,
      data: response.data
    });
    
    return response.data;
  } catch (error: any) {
    // Log detailed error information
    console.error('Error in addTaskSuperToProject:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // If we have a specific error message from the backend, enhance it
    if (error.response?.data?.message?.includes('foreign key constraint')) {
      console.error('Foreign key constraint violation detected. Ensure parent-child relationships are correct.');
      
      // Add more context to the error
      error.response.data.message = 
        `Database constraint error: ${error.response.data.message}. This usually means a parent task reference is missing or invalid.`;
    }
    
    throw error; // Re-throw to allow proper error handling in the component
  }
};

export const checkExistingTasksInProject = async (projectId: string) => {
  const response = await axios.get(`${backendURI}/projects/${projectId}/tasks/structure`);
  return response.data;
};