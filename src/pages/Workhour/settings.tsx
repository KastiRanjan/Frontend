import React from 'react';
import { Spin, Alert } from 'antd';
import PageTitle from '../../components/PageTitle';
import WorkhourSettings from '../../components/Workhour/WorkhourSettings';
import { useRole } from '../../hooks/role/useRole';
import { useUser } from '../../hooks/user/useUser';

const WorkhourSettingsPage: React.FC = () => {
  // Fetch roles - using high limit to get all roles
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRole({
    page: 1,
    limit: 100 // High limit to get all roles
  });

  // Fetch users - using high limit to get all users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUser({
    status: 'active',
    page: 1,
    limit: 1000, // High limit to get all users
    keywords: ''
  });

  const isLoading = rolesLoading || usersLoading;
  const hasError = rolesError || usersError;

  if (isLoading) {
    return (
      <div>
        <PageTitle title="Work Hour Settings" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div>
        <PageTitle title="Work Hour Settings" />
        <Alert
          message="Error Loading Data"
          description="Failed to load users or roles data. Please try again."
          type="error"
          style={{ margin: '20px 0' }}
        />
      </div>
    );
  }

  // Extract the actual data arrays
  const roles = rolesData?.results || [];
  const users = usersData?.results || [];

  return (
    <div>
      <PageTitle title="Work Hour Settings" />
      <WorkhourSettings users={users} roles={roles} />
    </div>
  );
};

export default WorkhourSettingsPage;
