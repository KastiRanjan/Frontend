import React from 'react';
import { useSession } from '../../context/SessionContext';
import { useParams } from 'react-router-dom';
import WorkhourProfile from '../../components/Workhour/WorkhourProfile';

const WorkHourDetails: React.FC = () => {
  const { profile } = useSession();
  const { id } = useParams();
  
  // Use the actual user ID from URL params or session
  const userId = id || (profile as any)?.id;
  const userRole = (profile as any)?.role?.name;
  const userName = `${(profile as any)?.firstName || ''} ${(profile as any)?.lastName || ''}`.trim() || 'Current User';

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
