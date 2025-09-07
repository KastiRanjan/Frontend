import { useDeleteBilling } from "@/hooks/billing/useDeleteBilling";
import { BillingType } from "@/types/billing";
import { Button, Popconfirm, Space, Table, Tag, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";

interface BillingTableProps {
  data: BillingType[];
  showModal: (billing?: BillingType) => void;
  onRefresh: () => void;
}

const BillingTable = ({ data, showModal, onRefresh }: BillingTableProps) => {
  const { mutate: deleteBilling } = useDeleteBilling();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteBilling(id.toString(), {
        onSuccess: () => {
          message.success("Billing entity deleted successfully");
          onRefresh();
        },
        onError: (error) => {
          message.error(`Failed to delete: ${error.message}`);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<BillingType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "PAN Number",
      dataIndex: "pan_number",
      key: "pan_number",
      render: (text) => text || "N/A",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "N/A",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "green";
        if (status === "suspended") {
          color = "orange";
        } else if (status === "archived") {
          color = "red";
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this billing entity?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={loading}
          >
            <Button type="link" danger loading={loading}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={data.map(item => ({...item, key: item.id}))} 
      pagination={{ pageSize: 10 }}
    />
  );
};

export default BillingTable;
