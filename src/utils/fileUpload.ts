import axios from 'axios';

const backendURI = import.meta.env.VITE_BACKEND_URI;

/**
 * Uploads a file to the server
 * @param file The file to upload
 * @param folder The folder to upload to (e.g., 'document', 'notice-board')
 * @returns The path to the uploaded file
 */
export const uploadFile = async (file: File, folder: string = 'document'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    let response;
    
    // Use specific endpoints for different types of uploads
    if (folder === 'notice-board') {
      response = await axios.post(`${backendURI}/notice-board/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.imagePath;
    } else {
      // Generic upload endpoint
      response = await axios.post(`${backendURI}/upload/${folder}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.filePath;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};