import { useUser } from "@/hooks/user/useUser";
import { User } from "@/pages/Project/type";
import { Role } from "@/pages/Role/type";
import { EditOutlined } from "@ant-design/icons"; // Added EditOutlined import
import { Button, Table } from "antd"; // Added Button import
import { useState } from "react";

// Modified columns definition to be a function
const columns = () => [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },

  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "PhoneNumber",
    dataIndex: "phoneNumber",
    key: "email",
  },
  {
    title: "Deggination",
    dataIndex: "degination",
    key: "degination",
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

  // Function to handle showing the edit modal

  //   const paginationOptions = {
  //     current: page,
  //     pageSize: limit,
  //     total: user?.totalItems,
  //     showSizeChanger: true,
  //     showQuickJumper: true,
  //     pageSizeOptions: [5, 10, 20, 30, 50, 100],
  //     showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
  //   };

  return (
    <Table
      loading={isPending}
      //   pagination={paginationOptions}
      dataSource={user?.results}
      columns={columns()} // Pass showEditModal to columns
      onChange={handleTableChange}
      size="small"
      bordered
    />
  );
};

export default UserTable;
