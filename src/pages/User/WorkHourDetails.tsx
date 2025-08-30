import React from 'react';
import WorkhourProfile from '../../components/Workhour/WorkhourProfile';

const WorkHourDetails: React.FC = () => {
  // Mock user data - in real implementation, get from profile context or API
  const userId = 1;
  const userRole = 'audit-junior';
  const userName = 'Current User';

  return (
    <div>
      <WorkhourProfile
        userId={userId}
        userRole={userRole}
        userName={userName}
        showTitle={false}
      />
    </div>
  );
};

export default WorkHourDetails;
