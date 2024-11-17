import { useClient } from "@/hooks/client/useClient";
import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Table } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";

const columns = [
  {
    title: "",
    dataIndex: "id",
    key: "id",
    render: () => <Checkbox type="checkbox" />,
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
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: client, isPending } = useClient();

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  return (
    <Card>
      <TableToolbar>
        <Button type="primary" onClick={() => navigate("/client/new")}>
          Create
        </Button>
      </TableToolbar>
      <Table
        loading={isPending}
        dataSource={client || []}
        columns={columns}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default ClientTable;
