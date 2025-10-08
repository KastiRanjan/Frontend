import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserLastActiveTime, isUserActive } from '@/utils/userActivityTracker';
import { fetchUserById } from '@/service/user.service';

/**
 * Hook to track user's last activity time combining local and server data
 * @param userId The ID of the user to track
 * @returns Object containing activity status and last active time
 */
export const useUserActivity = (userId: string | undefined) => {
  const [localLastActive, setLocalLastActive] = useState<number | null>(null);
  
  // For the current user, we can use local storage data which is more up-to-date
  useEffect(() => {
    if (!userId) return;
    
    // Check if this is the current user (based on localStorage userId)
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId === userId) {
      // Get data from localStorage which is updated by the activity tracker
      const lastActive = getUserLastActiveTime();
      setLocalLastActive(lastActive);
      
      // Setup listener for storage changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'artha_last_activity') {
          const newTime = e.newValue ? parseInt(e.newValue, 10) : null;
          setLocalLastActive(newTime);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [userId]);
  
  // For other users, we need to fetch from the server
  const { data: userData, isLoading } = useQuery({
    queryKey: ['users', userId, 'activity'],
    queryFn: () => fetchUserById({ id: userId }),
    enabled: !!userId,
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Combine local and server data
  const lastActiveTime = userId === localStorage.getItem('userId') && localLastActive
    ? localLastActive // For current user, prefer local data
    : userData?.lastActiveAt 
      ? new Date(userData.lastActiveAt).getTime() 
      : null;
      
  const active = isUserActive(lastActiveTime);
  
  return {
    isActive: active,
    lastActiveTime,
    lastActiveDate: lastActiveTime ? new Date(lastActiveTime) : null,
    isLoading,
  };
};

export default useUserActivity;