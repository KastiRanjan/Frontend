import React, { useEffect, useState } from 'react';
import { Tooltip, Badge, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatLastActiveTime } from '@/utils/userActivityTracker';
import useUserActivity from '@/hooks/useUserActivity';

interface UserActivityStatusProps {
  userId: string;
  lastActiveTime?: number | null; // Optional override for the lastActiveTime
  size?: 'small' | 'default' | 'large';
  name?: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  showName?: boolean;
  className?: string;
}

/**
 * Component that displays a user's activity status (online/offline)
 * along with their avatar and optionally their name
 */
const UserActivityStatus: React.FC<UserActivityStatusProps> = ({
  userId,
  lastActiveTime,
  size = 'default',
  name,
  avatarUrl,
  showAvatar = true,
  showName = false,
  className = '',
}) => {
  // Use the hook to get live activity data
  const { isActive, lastActiveTime: hookLastActiveTime } = useUserActivity(userId);
  
  // Allow manual override of lastActiveTime if provided
  const effectiveLastActiveTime = lastActiveTime !== undefined ? lastActiveTime : hookLastActiveTime;
  
  // Format the time string for display and update it every minute
  const [formattedTime, setFormattedTime] = useState<string>(
    formatLastActiveTime(effectiveLastActiveTime)
  );
  
  useEffect(() => {
    // Update formatting initially
    setFormattedTime(formatLastActiveTime(effectiveLastActiveTime));
    
    // Set up interval to refresh the formatted time
    const intervalId = setInterval(() => {
      setFormattedTime(formatLastActiveTime(effectiveLastActiveTime));
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [effectiveLastActiveTime]);
  
  // Status badge colors
  const badgeStatus = isActive ? 'success' : 'default';
  
  // Size mapping
  const avatarSize = size === 'small' ? 24 : size === 'large' ? 40 : 32;
  
  return (
    <div className={`user-activity-status ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Tooltip title={`${isActive ? 'Online' : 'Offline'} - Last active: ${formattedTime}`}>
        <Badge status={badgeStatus} className="user-status-badge">
          {showAvatar && (
            <Avatar 
              size={avatarSize} 
              src={avatarUrl} 
              icon={!avatarUrl && <UserOutlined />}
              style={{ marginRight: showName ? '8px' : 0 }}
            />
          )}
        </Badge>
      </Tooltip>
      
      {showName && name && (
        <span 
          className="user-name"
          style={{ 
            fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
            marginLeft: !showAvatar ? '8px' : 0
          }}
        >
          {name}
        </span>
      )}
    </div>
  );
};

export default UserActivityStatus;