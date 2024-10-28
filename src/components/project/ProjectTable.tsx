import { useProject } from "@/hooks/project/useProject";
import { Project } from "@/pages/Project/type";
import { EditOutlined } from "@ant-design/icons";
import { Avatar, Button, Table, TableProps } from "antd";
import _ from "lodash";
import { useState } from "react";
import { Link } from "react-router-dom";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_: any, record: any) => (
      <Link to={`/project/${record.id}/tasks`}>{record.name}</Link>
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "descritpion",
  },
  {
    title: "Nature Of Project",
    dataIndex: "natureOfWork",
    key: "natureOfWork",
  },
  {
    title: "Project Lead",
    dataIndex: "natureOfWork",
    key: "natureOfWork",
    render: (_: any, record: any) => (
      <>
        <Avatar size={"small"} className="bg-zinc-500">
        {record?.projectLead?.name[0]}
        </Avatar>{" "}
        {record?.projectLead?.name}
      </>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_: any, record: any) => (
      <>
        <Link to={`/project/edit/${record.id}`}>
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

  const rowSelection: TableProps<Project>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: Project[]) => {},
    getCheckboxProps: (record: Project) => ({
      name: record.name,
    }),
  };

  return (
    <Table
      loading={isPending}
      pagination={paginationOptions}
      rowSelection={rowSelection}
      dataSource={project}
      columns={columns} // Pass showEditModal to columns
      onChange={handleTableChange}
      size="small"
      rowKey={"id"}
      bordered
    />
  );
};

export default ProjectTable;
