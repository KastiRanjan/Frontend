import axios from "axios";
import { NotificationType } from "@/types/notification";
axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchMyNotifications = async (userId: string, type?: NotificationType) => {
  const url = type 
    ? `${backendURI}/notification/user/${userId}?type=${type}`
    : `${backendURI}/notification/user/${userId}`;
  const response = await axios.get(url);
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
