import { EditOutlined } from '@ant-design/icons'; // Added EditOutlined import
import { Button, Table } from "antd"; // Added Button import
import { useState } from "react";
import { usePermission } from "../../hooks/permission/usePermission";

// Modified columns definition to be a function
const columns = (showEditModal: any) => [
  {
    title: "Description",
    dataIndex: "description",
    key: "name",
  },
  {
    title: "Resource",
    dataIndex: "resource",
    key: "resource", // Corrected key from "age" to "resource"
  },
  {
    title: "Method",
    dataIndex: "method",
    key: "method", // Corrected key from "age" to "method"
  },
  {
    title: "Path",
    dataIndex: "path",
    key: "path", // Corrected key from "age" to "path"
  },
  {
    title: "Action", // Added Action column for Edit button
    key: "action",
    render: (_: any, record: any) => (
      <Button
        type="primary"
        icon={<EditOutlined />}
        onClick={() => showEditModal(record)} // Added click handler
      >
        Edit
      </Button>
    ),
  },
];

const PermissionTable = ({ showEditModal }: { showEditModal: any }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: user, isPending } = usePermission({ page, limit });


  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  // Function to handle showing the edit modal


  const paginationOptions = {
    current: page,
    pageSize: limit,
    total: user?.totalItems,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: [5, 10, 20, 30, 50, 100],
    showTotal: (total: number, range: number[]) =>
      `${range[0]}-${range[1]} of ${total}`,
  };

  return (
    <Table
      loading={isPending}
      pagination={paginationOptions}
      dataSource={user?.results}
      columns={columns(showEditModal)} // Pass showEditModal to columns
      onChange={handleTableChange}
    />
  );
};

export default PermissionTable;
