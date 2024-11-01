import { useTaskGroup } from "@/hooks/taskGroup/useTaskGroup";
import { Button, Table, TableProps } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import { TaskGroup } from "@/pages/TaskGroup/type";
import usePagination from "@/hooks/usePagination";

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
    title: "Updated At",
    dataIndex: "updatedAt",
    key: "updatedAt",
  },
  {
    title: "Action",
    key: "action",
    render: (_: any, record: any) => (
      <Link to={`/task-group/edit/${record.id}`}>
        <Button type="primary" icon={<EditOutlined />}>
        </Button>
      </Link>
    ),
  },
];

const TaskGroupTable = () => {
  const { page, limit, setPage, setLimit } = usePagination();
  const [selectedRow, setSelectedRow] = useState<TaskGroup[]>([]);
  const { data: taskTemplate, isPending } = useTaskGroup();

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const rowSelection: TableProps<TaskGroup>["rowSelection"] = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: TaskGroup[]) => {
      setSelectedRow(selectedRows);
    },
    getCheckboxProps: (record: TaskGroup) => ({
      name: record.name,
    }),
  };

  return (
    <Table
      loading={isPending}
      //   pagination={paginationOptions}
      rowSelection={rowSelection}
      dataSource={taskTemplate}
      columns={columns}
      onChange={handleTableChange}
      bordered
    />
  );
};

export default TaskGroupTable;
