import { useTaskGroup } from "@/hooks/taskGroup/useTaskGroup";
import { Button, Table } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";

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
    title: "Action", // Added Action column for Edit button
    key: "action",
    render: (_: any, record: any) => (
      <Button type="primary" icon={<EditOutlined />}>
        <Link to={`/task-group/edit/${record.id}`}>Edit</Link>
      </Button>
    ),
  },
];

const TaskGroupTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: taskTemplate, isPending } = useTaskGroup();

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

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

export default TaskGroupTable;
