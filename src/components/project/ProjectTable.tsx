import { useProject } from "@/hooks/project/useProject";
import { EditOutlined } from "@ant-design/icons";
import { Button, Table } from "antd"; // Added Button import
import { useState } from "react";
import { Link } from "react-router-dom";

// Modified columns definition to be a function
const columns = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id", // Corrected key from "name" to "id"
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name", // Corrected key from "age" to "resource"
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "descritpion", // Corrected key from "age" to "method"
  },
  {
    title: "Nature Of Project",
    dataIndex: "natureOfWork",
    key: "natureOfWork", // Corrected key from "age" to "path"
  },
  {
    title: "Action", // Added Action column for Edit button
    key: "action",
    render: (_: any, record: any) => (
      <>
        <Link to={`/project/edit/${record.id}`}>
          <Button type="primary" icon={<EditOutlined />}>
            Edit
          </Button>
        </Link>
        <Link to={`/project/tasks`}>
          <Button type="primary" icon={<EditOutlined />}>
            Edit
          </Button>
        </Link>
      </>
    ),
  },
];

const ProjectTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: project, isPending } = useProject();

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  // Function to handle showing the edit modal

  const paginationOptions = {
    current: page,
    pageSize: limit,
    total: project?.totalItems,
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
      dataSource={project}
      columns={columns} // Pass showEditModal to columns
      onChange={handleTableChange}
    />
  );
};

export default ProjectTable;
