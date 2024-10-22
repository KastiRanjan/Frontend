import React, { useState } from 'react';
import PageTitle from '@/components/PageTitle';
import RoleTable from '@/components/Role/RoleTable';
import RoleForm from '@/components/Role/RoleForm';

interface Role {
  createdAt: string;
  name: string;
  description: string;
}

const RolesPage: React.FC = () => {
  const [showRoleForm, setShowRoleFrom] = useState<boolean>(false);
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const [editRoleData, setEditRoleData] = useState<any>();

  const showEditModal = (record: Role) => {
    setShowRoleFrom(true);
    setEditRoleData(record);
    setIsFormEdit(true);
  };
  const handleCloseRoleForm = () => {
    setShowRoleFrom(false);
    setIsFormEdit(false);
  };

  return (
    <>
    <PageTitle title="Roles" />
    <RoleTable showEditModal={showEditModal} />
    <RoleForm
      visible={showRoleForm}
      onCancel={handleCloseRoleForm}
      editRoleData={editRoleData}
      isformEdit={isFormEdit}
    />
  </>
    

  );
};

export default RolesPage;
