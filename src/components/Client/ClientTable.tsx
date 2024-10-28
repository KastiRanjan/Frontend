import { useClient } from "@/hooks/client/useClient";
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
    title: "Legal Status",
    dataIndex: "legalStatus",
    key: "legalStatus",
  },
  {
    title: "Nature",
    dataIndex: "industryNature",
    key: "industryNature",
  },
  {
    title: "Business Size",
    dataIndex: "businessSize",
    key: "businessSize",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Action", // Added Action column for Edit button
    key: "action",
    render: (_: any, record: any) => (
      <Link to={`/client/edit/${record.id}`}>
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
  const { data: client, isPending } = useClient();

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  return (
    <Table
      loading={isPending}
      dataSource={client || []}
      columns={columns}
      onChange={handleTableChange}
    />
  );
};

export default ClientTable;
