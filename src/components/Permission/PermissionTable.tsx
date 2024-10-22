import { Table } from "antd";
import { useState } from "react";
import { usePermission } from "../../hooks/usePermission";

const columns = [
  {
    title: "Description",
    dataIndex: "description",
    key: "name",
  },
  {
    title: "Resource",
    dataIndex: "resource",
    key: "age",
  },
  {
    title: "Method",
    dataIndex: "method",
    key: "age",
  },
  {
    title: "Path",
    dataIndex: "path",
    key: "age",
  },
];

const PerimssionTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: user, isPending } = usePermission({ page, limit });

  const handleTableChange = (pagination: any) => {
    console.log(pagination);
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const paginationOptions = {
    current: page,
    pageSize: limit,
    total: user?.totalItems,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: [5, 10, 20, 30, 50, 100],
    showTotal: (total: number, range: any[]) =>
      `${range[0]}-${range[1]} of ${total}`,
  };

  return (
    <Table
      loading={isPending}
      pagination={paginationOptions}
      dataSource={user?.results}
      columns={columns}
      onChange={handleTableChange}
    />
  );
};

export default PerimssionTable;
