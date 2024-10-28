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
    title: "Action",
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

  const expandedRowRender = (record: any) => {
    return (
      <Table
        dataSource={record.tasktemplate}
        columns={[
          {
            title: "Template ID",
            dataIndex: "id",
            key: "id",
          },
          {
            title: "Template Name",
            dataIndex: "name",
            key: "name",
          },
          {
            title: "Template Description",
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
        ]}
        pagination={false}
        rowKey="id"
      />
    );
  };

  return (
    <Table
      loading={isPending}
      dataSource={taskTemplate}
      columns={columns}
      onChange={handleTableChange}
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => record.tasktemplate && record.tasktemplate.length > 0,
      }}
      rowKey="id" // Ensure each row has a unique key
    />
  );
};

export default TaskGroupTable;
