import PageTitle from "@/components/PageTitle";
import UserForm from "@/components/user/UserForm";
import UserTable from "@/components/user/UserTable";
import { UserStatus } from "@/types/userStatus";
import { Modal, Tabs } from "antd";
import React, { useCallback } from "react";

const User: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [editUserData, setEditUserData] = React.useState<any | undefined>(undefined);

  const showModal = useCallback((task?: any) => {
    setEditUserData(task);
    setOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditUserData(undefined);
    setOpen(false);
  }, []);
  return (
    <>
      <PageTitle
        title="Users"
      />
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: "Active",
            key: "1",
            children: <UserTable status={UserStatus.ACTIVE} showModal={showModal}/>,
          },
          {
            label: "Inactive",
            key: "2",
            children: <UserTable status={UserStatus.INACTIVE} showModal={showModal}/>,
          },
          {
            label: "Blocked",
            key: "3",
            children: <UserTable status={UserStatus.BLOCKED} showModal={showModal}/>,
          },
        ]}
      />

      {open && (
        <Modal title={editUserData ? "Edit User" : "Add User"} footer={null} open={open} onCancel={handleCancel}>
          <UserForm initialValues={editUserData} handleCancel={handleCancel} />
        </Modal>
      )}
    </>
  );
};

export default User;
