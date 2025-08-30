import React from 'react';
import PageTitle from '../../components/PageTitle';
import WorkhourSettings from '../../components/Workhour/WorkhourSettings';

// Mock data - in real implementation, fetch from API
const mockUsers = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com' },
  { id: 3, firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@company.com' },
];

const mockRoles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Audit Senior' },
  { id: 3, name: 'Audit Junior' },
  { id: 4, name: 'Developer' },
  { id: 5, name: 'Intern' },
];

const WorkhourSettingsPage: React.FC = () => {
  return (
    <div>
      <PageTitle title="Work Hour Settings" />
      <WorkhourSettings users={mockUsers} roles={mockRoles} />
    </div>
  );
};

export default WorkhourSettingsPage;
