import { useUser } from "@/hooks/user/useUser";
import { User } from "@/pages/Project/type";
import { Role } from "@/pages/Role/type";
import { EditOutlined } from "@ant-design/icons"; // Added EditOutlined import
import { Button, Drawer, Table, TableProps } from "antd"; // Added Button import
import { useState } from "react";
import { Link } from "react-router-dom";

// Modified columns definition to be a function
const columns: TableProps<User>["columns"] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_: any, record: User) => (
      <Link to={`/user/${record.id}/`} className="text-blue-600">{record.name}</Link>
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
    width: 50,
    render: (_: any, record: User) => (
      <div>
        <Link to={`/user/${record.id}/account-detail`}><Button type="primary" icon={<EditOutlined />}></Button></Link>

      </div>
    ),
  },
];

const UserTable = () => {
  const { data: user, isPending } = useUser();

  const handleTableChange = () => {
    // setPage(pagination.current);
    // setLimit(pagination.pageSize);
  };

  return (
    <>
      <Table
        loading={isPending}
        dataSource={user?.results}
        columns={columns}
        onChange={handleTableChange}
        size="small"
        rowKey={"id"}
        bordered
      />
    </>
  );
};

export default UserTable;
