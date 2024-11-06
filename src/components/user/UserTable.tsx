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
  const { data: user, isPending } = useUser();

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };
  console.log(selectedRow);

  return (
    <>
      <Table
        loading={isPending}
        dataSource={user?.results}
        columns={columns(showDrawer)}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRow(record);
          },
        })}
        size="small"
        rowKey={"id"}
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
        <p>Bank Detail</p>
        <ul>
          <li>Bank Name: {selectedRow?.bank_detail?.bankName}</li>
          <li>Bank Branch: {selectedRow?.bank_detail?.bankBranch}</li>
          <li>Bank Account: {selectedRow?.bank_detail?.accountNo}</li>
          <li>Bank Account: {selectedRow?.bank_detail?.accountNo}</li>
          <img width={200} height={200} src={`http://localhost:7777/document/${selectedRow?.bank_detail?.documentFile}`} alt="" />
        </ul>
      </Drawer>
    </>
  );
};

export default UserTable;
