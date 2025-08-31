import React from 'react';
import PageTitle from '../components/PageTitle';
import LeaveTypeManager from '../components/LeaveTypeManager';

const LeaveTypeManagementPage: React.FC = () => {
  return (
    <div>
      <PageTitle title="Leave Type Management" />
      <LeaveTypeManager />
    </div>
  );
};

export default LeaveTypeManagementPage;
