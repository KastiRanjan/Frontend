import { useUser } from "@/hooks/user/useUser";
import { User } from "@/pages/Project/type";
import { Role } from "@/pages/Role/type";
import { EditOutlined } from "@ant-design/icons"; // Added EditOutlined import
import { Button, Table } from "antd"; // Added Button import
import _ from "lodash";
import { useState } from "react";
import { render } from "react-dom";
import { Link } from "react-router-dom";

// Modified columns definition to be a function
const columns = () => [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_: any, record: User) => <Link to={`/user/${record.id}/personal-detail`}>{record.name}</Link>,
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
    render :(_: any, record: User) => record.role.name
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
      <Button type="primary" icon={<EditOutlined />}></Button>
    ),
  },
];

const UserTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: user, isPending } = useUser({ page, limit });

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };


  return (
    <Table
      loading={isPending}
      dataSource={user?.results}
      columns={columns()}
      onChange={handleTableChange}
      size="small"
      bordered
    />
  );
};

export default UserTable;
