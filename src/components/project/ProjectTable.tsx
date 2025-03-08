import { useSession } from "@/context/SessionContext";
import { useProject } from "@/hooks/project/useProject";
import { ProjectType } from "@/types/project";
import { checkPermissionForComponent } from "@/utils/permission";
import { DownloadOutlined, EditOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Space, Table, TableProps, Tooltip } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import SearchBarWithPopover from "../SearchBarPopover";
import TableToolbar from "../Table/TableToolbar";

const columns = (
  permissions: any,
  showModal: any
): TableProps<ProjectType>["columns"] => [
  {
    title: "Date ",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (_: any, record: any) => (
      <>
        {new Date(record?.createdAt).toLocaleDateString() || record?.createdAt}
      </>
    ),
  },

  {
    title: "Project Name",
    dataIndex: "name",
    key: "name",
    render: (_: any, record: any) => (
      <Link to={`/projects/${record.id}`} className="text-blue-600">
        {record.name}
      </Link>
    ),
  },
  {
    title: "Project Client",
    dataIndex: "client",
    key: "client",
    render: (_: any, record: any) => <>{record?.customer?.name}</>,
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
        <Avatar
          size={"small"}
          className="bg-zinc-500"
          src={` ${import.meta.env.VITE_BACKEND_URI}/document/${
            record?.projectLead?.avatar
          }`}
        >
          {record?.projectLead?.name[0]}
        </Avatar>{" "}
        {record?.projectLead?.name}
      </>
    ),
  },
  {
    title: "End Date",
    dataIndex: "endingDate",
    key: "startDate",
  },
  {
    title: "Action",
    key: "action",
    fixed: "right",
    hidden: checkPermissionForComponent(
      permissions,
      "projects",
      "patch",
      "/projects/:id"
    )
      ? false
      : true,
    width: 50,
    render: (_: any, record: any) => (
      <>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => showModal(record)}
        ></Button>
      </>
    ),
  },
];

const ProjectTable = ({ showModal, status }: any) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: project, isPending } = useProject({ status });
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

  const rowSelection: TableProps<ProjectType>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: ProjectType[]) => {
      console.log(selectedRowKeys, selectedRows);
    },
    getCheckboxProps: (record: ProjectType) => ({
      name: record.name,
    }),
  };

  return (
    <Card>
      <TableToolbar>
        <div className="flex w-full justify-between">
          <SearchBarWithPopover />
          <Space size={10}>
            <Button size="large" color="danger">
              Delete
            </Button>
            <Tooltip title="Download">
              <Button size="large">
                <DownloadOutlined />
              </Button>
            </Tooltip>
            <Button size="large" type="primary" onClick={() => showModal()}>
              Create Project
            </Button>
          </Space>
        </div>
      </TableToolbar>
      <Table
        loading={isPending}
        pagination={paginationOptions}
        rowSelection={rowSelection}
        showSorterTooltip={true}
        dataSource={project}
        columns={columns(permissions, showModal)}
        onChange={handleTableChange}
        rowKey={"id"}
        size="middle"
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
};

export default ProjectTable;
