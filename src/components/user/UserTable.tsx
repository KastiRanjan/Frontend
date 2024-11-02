import { useUser } from "@/hooks/user/useUser";
import { User } from "@/pages/Project/type";
import { Role } from "@/pages/Role/type";
import { EditOutlined } from "@ant-design/icons"; // Added EditOutlined import
import { Button, Drawer, Table } from "antd"; // Added Button import
import { useState } from "react";
import { Link } from "react-router-dom";

// Modified columns definition to be a function
const columns = (showDrawer: any) => [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_: any, record: User) => (
      <Link to={`/user/${record.id}/personal-detail`}>{record.name}</Link>
    ),
  },

  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "PhoneNumber",
    dataIndex: "phoneNumber",
    key: "phoneNumber",
  },
  {
    title: "Degination",
    dataIndex: "degination",
    key: "degination",
    render: (_: any, record: User) => record.role.name,
  },

  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    render: (role: Role) => role.name,
  },
  {
    title: "Action",
    key: "action",
    render: (_: any, record: User) => (
      <div>
        <Button type="primary" icon={<EditOutlined />}></Button>
        <Button type="primary" icon={<EditOutlined />} onClick={showDrawer}>
          Vew
        </Button>
      </div>
    ),
  },
];

const UserTable = () => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: user, isPending } = useUser({ page, limit });

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  return (
    <>
      <Table
        loading={isPending}
        dataSource={user?.results}
        columns={columns(showDrawer)}
        onChange={handleTableChange}
        size="small"
        bordered
      />

      <Drawer
        title="Basic Drawer"
        placement="right"
        closable={true}
        onClose={onClose}
        open={open}
        size="large"
        getContainer={false}
        width={"100%"}
      >
        <p>Some contents...</p>
      </Drawer>
    </>
  );
};

export default UserTable;
