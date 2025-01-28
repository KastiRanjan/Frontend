import { useUser } from "@/hooks/user/useUser";
import { Role } from "@/pages/Role/type";
import { EditOutlined } from "@ant-design/icons"; // Added EditOutlined import
import { Avatar, Button, Card, Table, TableProps } from "antd"; // Added Button import
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";
import { UserType } from "@/types/user";

// Modified columns definition to be a function
const columns = (showModal: any): TableProps<UserType>["columns"] => [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_: any, record: UserType) => (
      <>
        <Avatar size={25} style={{ backgroundColor: `#${(Math.floor(Math.random() * 128) + 128).toString(16).padStart(2, '0')}${(Math.floor(Math.random() * 128) + 128).toString(16).padStart(2, '0')}${(Math.floor(Math.random() * 128) + 128).toString(16).padStart(2, '0')}` }}>{record?.name?.charAt(0)}</Avatar> &nbsp; &nbsp;
        <Link to={`/user/${record.id}/`} className="text-blue-600">{record.name}</Link>
      </>
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
    render: (_: any, record: UserType) => record?.role?.name,
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
    render: (_: any, record: UserType) => (
      <div>
        <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}></Button>
      </div>
    ),
  },
];

const UserTable = ({ status, showModal }: { status: string, showModal: any }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: user, isPending } = useUser({ status, limit, page, keywords: "" });

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const rowSelection: TableProps<UserType>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: UserType[]) => {
      console.log(selectedRowKeys, selectedRows);
    },
    getCheckboxProps: (record: UserType) => ({
      name: record.name,
    }),
  };

  return (
    <Card>
      <TableToolbar>
        <Button type="primary" onClick={() => showModal()}>
          Create User
        </Button>
      </TableToolbar>
      <Table
        loading={isPending}
        dataSource={user?.results}
        columns={columns(showModal)}
        rowSelection={rowSelection}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: limit,
          total: user?.totalItems || 0,
        }}
        size="small"
        rowKey={"id"}
      // bordered
      />
    </Card>
  );
};

export default UserTable;
