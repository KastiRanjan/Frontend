import { useTaskTemplate } from "@/hooks/taskTemplate/useTaskTemplate";
import { Table } from "antd";
import { useState } from "react";

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "Updated At",
    dataIndex: "updatedAt",
    key: "updatedAt",
  },
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
];

const TaskTemplateTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: taskTemplate, isPending } = useTaskTemplate({ page, limit });

  const handleTableChange = (pagination: any) => {
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
//     showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} of ${total}`,
//   };

  return (
    <Table
      loading={isPending}
    //   pagination={paginationOptions}
      dataSource={taskTemplate}
      columns={columns} // Pass showEditModal to columns
      onChange={handleTableChange}
    />
  );
};

export default TaskTemplateTable;
