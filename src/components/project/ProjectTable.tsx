import { useSession } from "@/context/SessionContext";
import { useProject } from "@/hooks/project/useProject";
import { Project } from "@/pages/Project/type";
import { checkPermissionForComponent } from "@/utils/permission";
import { EditOutlined } from "@ant-design/icons";
import { Avatar, Button, Table, TableProps } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const columns = (permissions: any): TableProps<Project>["columns"] => [
  {

    title: "Date ",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (_: any, record: any) => <>{new Date(record?.createdAt).toLocaleDateString() || record?.createdAt}</>,
  },

  {
    title: "Project Name",
    dataIndex: "name",
    key: "name",
    render: (_: any, record: any) => (
      <Link to={`/project/${record.id}/tasks`} className="text-blue-600">{record.name}</Link>
    ),
  },
  {
    title: "Project Client",
    dataIndex: "client",
    key: "client",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "descritpion",
    width: 300,
    ellipsis: true,
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
    title: "Start Date",
    dataIndex: "startingDate",
    key: "startDate",
  },
  {
    title: "End Date",
    dataIndex: "endingDate",
    key: "startDate",
  },
  {
    title: "Action",
    key: "action",
    fixed: 'right',
    hidden: checkPermissionForComponent(permissions, "projects", 'patch', "/projects/:id") ? false : true,
    width: 50,
    render: (_: any, record: any) => (
      <>
        <Link to={`/project/edit/${record.id}`}>
          <Button type="primary" icon={<EditOutlined />}>

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
  const { permissions } = useSession();

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
    onChange: (selectedRowKeys: React.Key[], selectedRows: Project[]) => { console.log(selectedRowKeys, selectedRows);
     },
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
      columns={columns(permissions)}
      onChange={handleTableChange}
      rowKey={"id"}
      bordered
      scroll={{ x: 'max-content' }}
    />
  );
};

export default ProjectTable;
