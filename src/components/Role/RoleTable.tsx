import { Table, Button, Popconfirm } from "antd"; // Added Button import
import { useState } from "react";
import { DeleteOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons'; // Added EditOutlined import
// import { usePermission } from "../../hooks/permission/usePermission";
import { useRole } from "@/hooks/role/useRole";
import { Role } from "@/pages/Role/type";


// Modified columns definition to be a function
const columns = (showEditModal:any) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (text: string) => new Date(text).toLocaleString(),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: ( record:Role) => (
      <span>
        <Button 
          icon={<EditOutlined />} 
          onClick={() => showEditModal(record)} 
          style={{ marginRight: 8 }} 
        />
        <Popconfirm
          title="Are you sure to delete this role?"
          onConfirm={() => showEditModal}
          okText="Yes"
          cancelText="No"
        >
          <Button icon={<DeleteOutlined />} style={{ marginRight: 8 }} />
        </Popconfirm>
        <Button 
          icon={<SettingOutlined />} 
          onClick={() => showEditModal(record)} 
        />
      </span>
    ),
  },
]
const RoleTable = ({showEditModal}:any) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: role, isPending } = useRole( { page, limit });


  const handleTableChange = (pagination:any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  // Function to handle showing the edit modal


  const paginationOptions = {
    current: page,
    pageSize: limit,
    total: role?.totalItems,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: [5, 10, 20, 30, 50, 100],
    showTotal: (total:number, range:number[]) =>
      `${range[0]}-${range[1]} of ${total}`,
  };
  console.log("ROLE", role);

  return (
    <Table
      loading={isPending}
      pagination={paginationOptions}
      dataSource={role}
      columns={columns(showEditModal)} // Pass showEditModal to columns
      onChange={handleTableChange}
    />
  );
};

export default RoleTable;
