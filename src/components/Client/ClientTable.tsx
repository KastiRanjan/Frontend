import { useTaskTemplate } from "@/hooks/taskTemplate/useTaskTemplate";
import { EditOutlined } from "@ant-design/icons";
import { Button, Checkbox, Table } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const columns = [
  {
    title: "",
    dataIndex: "id",
    key: "id",
    render: (id: number) => <Checkbox type="checkbox" />,
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
  {
    title: "Group",
    dataIndex: "description",
    key: "description",
    render: (_: any, record: any) => <>{record?.group?.name}</>,
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
      <Link to={`/task-template/edit/${record.id}`}>
        <Button type="primary" icon={<EditOutlined />}>
          Edit
        </Button>
      </Link>
    ),
  },
];

const ClientTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: taskTemplate, isPending } = useTaskTemplate({ page, limit });

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  return (
    <Table
      loading={isPending}
      dataSource={taskTemplate || []}
      columns={columns}
      onChange={handleTableChange}
    />
  );
};

export default ClientTable;
