import axios from "axios";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchMyNotifications = async (userId: string) => {
  const response = await axios.get(`${backendURI}/notification/user/${userId}`);
  return response.data;
};

export const updateNotifications = async ({ id, userId }: { id: string, userId: string }) => {
  const response = await axios.patch(`${backendURI}/notification/read/${userId}/${id}`, {});
  return response.data;
};

// Send a notification for leave-related events
export const sendLeaveNotification = async (
  leaveId: string,
  recipientIds: string[],
  type: 'leave_requested' | 'leave_approved' | 'leave_approved_by_manager' | 'leave_rejected' | 'leave_needs_admin_approval'
) => {
  try {
    const response = await axios.post(`${backendURI}/notification/leave`, {
      leaveId,
      recipientIds,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
