import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchTaskTemplate = async () => {
  const response = await axios.get(`${backendURI}/task-template`);
  return response.data;
};

export const fetchTaskTemplateById = async ({ id }: { id: string | undefined }) => {
  const response = await axios.get(`${backendURI}/task-template/${id}`);
  return response.data;
};


export const createTaskTemplate = async (payload: any) => {
  console.log('Creating task template with payload:', payload);
  try {
    const response = await axios.post(`${backendURI}/task-template`, payload);
    console.log('Create task template response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating task template:', error.response?.data || error.message);
    throw error;
  }
};

export const editTaskTemplate = async ({
  payload,
  id,
}: {
  payload: any;
  id: string;
}) => {
  console.log(`Editing task template ${id} with payload:`, payload);
  try {
    const response = await axios.patch(
      `${backendURI}/task-template/${id}`,
      payload
    );
    console.log('Edit task template response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error editing task template:', error.response?.data || error.message);
    throw error;
  }
};


export const deleteTaskTemplate = async ({ id }: { id: string }) => {
  const response = await axios.delete(`${backendURI}/task-template/${id}`);
  return response.data;
};
