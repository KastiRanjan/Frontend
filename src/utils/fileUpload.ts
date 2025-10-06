import axios from 'axios';

const backendURI = import.meta.env.VITE_BACKEND_URI;

/**
 * Uploads a file to the server
 * @param file The file to upload
 * @param folder The folder to upload to (e.g., 'document', 'notice-board', 'bank', 'education', 'training', 'contract')
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

/**
 * Uploads a user document file to the server
 * @param file The file to upload
 * @param userId The user ID
 * @param documentType The type of document (e.g., 'bank', 'education', 'training', 'contract', 'document')
 * @param additionalData Additional form data to send with the file
 * @returns The response data from the server
 */
export const uploadUserDocument = async (
  file: File,
  userId: string,
  documentType: string,
  additionalData?: Record<string, any>
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('documentFile', file);
    
    // Append additional data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }
    
    const response = await axios.post(
      `${backendURI}/users/${userId}/upload?option=${documentType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error uploading user document:', error);
    throw error;
  }
};

/**
 * Gets the full URL for a file path
 * @param filePath The relative file path (e.g., '/document/bank/uuid.jpg')
 * @returns The full URL to access the file
 */
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  
  return `${backendURI}/${cleanPath}`;
};