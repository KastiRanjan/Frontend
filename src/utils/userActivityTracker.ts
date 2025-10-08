import { useEffect } from 'react';
import { directApiClient } from '@/utils/apiClient';
import { useSession } from '@/context/SessionContext';

// Time in milliseconds after which a user is considered inactive (default: 30 minutes)
const INACTIVITY_THRESHOLD = 30 * 60 * 1000; 

// Local storage key for last activity time
const LAST_ACTIVITY_KEY = 'artha_last_activity';

/**
 * Updates the user's last active timestamp in the system
 * @param userId The ID of the user whose activity to update
 * @param timestamp The timestamp (in ISO format) of the activity
 */
// Track frequency to prevent excessive logging
let lastErrorLog = 0;
const ERROR_LOG_INTERVAL = 60000; // Log errors at most once per minute

export const updateUserLastActive = async (userId: string, timestamp: string = new Date().toISOString()) => {
  // Skip tracking for invalid or test user IDs to avoid errors
  if (!userId || userId === 'undefined' || userId === 'test-user') {
    // Only log at reasonable intervals to prevent console spam
    const now = Date.now();
    if (now - lastErrorLog > ERROR_LOG_INTERVAL) {
      console.warn('Skipping activity tracking for invalid user ID');
      lastErrorLog = now;
    }
    return false;
  }
  
  // Use a shorter timeout for activity tracking to prevent UI blocking
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
  
  try {
    // Single API call for activity tracking - use the correct public endpoint path
    const response = await directApiClient.post('/users/activity/track', {
      userId,
      timestamp
    }, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check if the backend indicates success (even with HTTP 200)
    if (response?.data?.success === false) {
      // Silent failure, don't spam console
      return false;
    }
    
    // Only log success in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Activity tracked successfully');
    }
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Only log at reasonable intervals to prevent console spam
    const now = Date.now();
    if (now - lastErrorLog > ERROR_LOG_INTERVAL) {
      console.warn('Failed to update user activity');
      lastErrorLog = now;
    }
    return false;
  }
};

/**
 * Hook to track user activity and update the last active timestamp
 * 
 * This hook will:
 * 1. Track user interaction events (mouse movements, clicks, key presses)
 * 2. Update the local storage with the latest activity time
 * 3. Periodically sync with the server when activity is detected
 * 
 * @param updateInterval How often (in ms) to sync with the server (default: 5 minutes)
 */
export const useTrackUserActivity = (updateInterval = 5 * 60 * 1000) => {
  const { profile, isAuthenticated } = useSession();
  
  useEffect(() => {
    if (!isAuthenticated || !profile?.id) {
      console.log('User not authenticated or no profile ID, skipping activity tracking');
      return;
    }
    
    console.log('Starting activity tracking for user:', profile.id);
    let lastSyncTime = 0;
    let activityTimeout: NodeJS.Timeout;
    
    // Function to handle user activity
    const handleActivity = () => {
      // Update local storage with current time
      const now = Date.now();
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      
      // Only sync with the server if enough time has passed since the last sync and we have a valid user ID
      if (now - lastSyncTime > updateInterval && profile?.id) {
        console.log('Syncing activity with server for user:', profile.id);
        updateUserLastActive(profile.id)
          .then(success => {
            if (success) {
              lastSyncTime = now;
            } else {
              console.warn('Failed to sync activity with server');
            }
          });
      }
      
      // Clear any existing timeout and set a new one
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        // No activity for the threshold period, user is considered inactive
        // We could trigger additional actions here if needed
        console.log('User inactive for', INACTIVITY_THRESHOLD, 'ms');
      }, INACTIVITY_THRESHOLD);
    };
    
    // Initialize with the current time or retrieve from storage
    const storedTime = localStorage.getItem(LAST_ACTIVITY_KEY);
    const initialTime = storedTime ? parseInt(storedTime, 10) : Date.now();
    
    // If stored time is older than our threshold, update it now
    if (Date.now() - initialTime > updateInterval && profile?.id) {
      updateUserLastActive(profile.id);
      lastSyncTime = Date.now();
    }
    
    // Setup event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    
    // Check if user is active now (on component mount)
    handleActivity();
    
    // Cleanup function
    return () => {
      clearTimeout(activityTimeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [profile?.id, isAuthenticated, updateInterval]);
};

/**
 * Gets the user's last active time from local storage
 * @returns The timestamp of the user's last activity or null if not available
 */
export const getUserLastActiveTime = (): number | null => {
  const lastActive = localStorage.getItem(LAST_ACTIVITY_KEY);
  return lastActive ? parseInt(lastActive, 10) : null;
};

/**
 * Formats the last active time into a human-readable string
 * @param lastActiveTime The timestamp to format (or null)
 * @returns A human-readable string like "2 hours ago" or "Just now"
 */
export const formatLastActiveTime = (lastActiveTime: number | null): string => {
  if (!lastActiveTime) return 'Never';
  
  const now = Date.now();
  const diff = now - lastActiveTime;
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  const date = new Date(lastActiveTime);
  return date.toLocaleDateString();
};

/**
 * Check if a user is currently considered active based on their last activity timestamp
 * @param lastActiveTime The timestamp of the user's last activity
 * @returns true if the user is considered active, false otherwise
 */
export const isUserActive = (lastActiveTime: number | null): boolean => {
  if (!lastActiveTime) return false;
  return Date.now() - lastActiveTime < INACTIVITY_THRESHOLD;
};