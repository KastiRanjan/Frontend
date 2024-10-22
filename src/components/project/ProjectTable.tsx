import { Table, Button } from "antd"; // Added Button import
import { useState } from "react";
import { EditOutlined } from '@ant-design/icons'; // Added EditOutlined import
// import { usePermission } from "../../hooks/permission/usePermission";
import { useProject } from "@/hooks/project/useProject";


// Modified columns definition to be a function
const columns = (showEditModal:any) => [
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
    render: (text, record) => (
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

const ProjectTable = ({showEditModal}:any) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: project, isPending } = useProject({ page, limit });


  const handleTableChange = (pagination:any) => {
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
    showTotal: (total, range) =>
      `${range[0]}-${range[1]} of ${total}`,
  };
  console.log("project", project);

  return (
    <Table
      loading={isPending}
      pagination={paginationOptions}
      dataSource={project}
      columns={columns(showEditModal)} // Pass showEditModal to columns
      onChange={handleTableChange}
    />
  );
};

export default ProjectTable;
