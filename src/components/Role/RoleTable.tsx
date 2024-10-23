import { Button, Table } from "antd";
import { useState } from "react";
import { useRole } from "@/hooks/role/useRole";
import { EditOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "Actions",
    key: "actions",
    render: (_: any, record: any) => (
      <Link to={`/role/edit/${record.id}`}>
        <Button type="primary" icon={<EditOutlined />}>
          Edit
        </Button>
      </Link>
    ),
  },
];
const RoleTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: role, isPending } = useRole({ page, limit });

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const paginationOptions = {
    current: page,
    pageSize: limit,
    total: role?.totalItems,
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
      dataSource={role?.results}
      columns={columns}
      onChange={handleTableChange}
    />
  );
};

export default RoleTable;
