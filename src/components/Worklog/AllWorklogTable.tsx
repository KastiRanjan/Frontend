import { useEditWorklog } from "@/hooks/worklog/useEditWorklog";
import { useWorklog } from "@/hooks/worklog/useWorklog";
import { Button, Card, Table, Popconfirm } from "antd";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";
  import { useDeleteWorklog } from "@/hooks/worklog/useDeleteWorklog";
import { useState } from "react";

const columns = (status: string, editWorklog: any, deleteWorklog: any, isEditPending: boolean, navigate: any) => {
  // Determine column title based on status
  const getStatusTitle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "Approved By";
      case "rejected":
        return "Rejected By";
      case "requested":
        return "Requested By";
      default:
        return "Reviewed By";
    }
  };

  const baseColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: true,
      showSorterTooltip: false,
      render: (_: any, record: any) => {
        return new Date(record?.startTime).toLocaleDateString();
      }
    },
    {
      title: "Project Name",
      dataIndex: "project",
      key: "project",
      render: (_: any, record: any) => {
        return <Link to={`/projects/${record?.task?.project?.id}`} className="text-blue-600">{record?.task?.project?.name}</Link>
      }
    },
    {
      title: "Task",
      dataIndex: "Task",
      key: "task",
      render: (_: any, record: any) => {
        return <Link to={`/projects/${record?.task?.project?.id}/tasks/${record?.task?.id}`} className="text-blue-600">{record?.task?.name}</Link>
      }
    },
    {
      title: "Review Date",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (_: any, record: any) => {
        return new Date(record?.updatedAt).toLocaleDateString();
      }
    },
    {
      title: "Duration",
      dataIndex: "startTime",
      key: "startTime",
      render: (_: any, record: any) => {
        return <>
          <div>
            {moment(record?.startTime).format("hh:mm A") + " - " + moment(record?.endTime).format("hh:mm A")}
          </div>
          {` (${moment.duration(moment(record?.endTime).diff(moment(record?.startTime))).asMinutes()} minutes)`}
        </>
      }
    },
    {
      title: getStatusTitle(status),
      dataIndex: "approvedBy",
      key: "approvedBy",
      render: (_: any, record: any) => {
        return (record?.user?.name);
      }
    },
  ];

  // Add Remark column only for rejected status
  if (status.toLowerCase() === "rejected") {
    baseColumns.push({
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
      render: (_: any, record: any) => {
        return record?.remark || "-";
      }
    });
  }

  baseColumns.push({
    title: "Action",
    dataIndex: "o",
    key: "s",
    render: (_: any, record: any) => {
      return (
        <div className="flex gap-2">
          <Button 
            type="primary"
            onClick={() => navigate(`/worklogs/edit/${record?.id}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this worklog?"
            onConfirm={() => deleteWorklog({id:record?.id})}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      );
    }
  });

  return baseColumns;
};

const AllWorklogTable = ({ status }: { status: string }) => {
  const navigate = useNavigate();
  const { data: worklogs, isPending } = useWorklog(status);
  const { mutate: editWorklog, isPending: isEditPending } = useEditWorklog();
  const { mutate: deleteWorklog } = useDeleteWorklog();
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Function to toggle description visibility
  const toggleDescription = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // Custom expand icon
  const customExpandIcon = ({ expanded, onExpand, record }: any) => {
    return (
      <span
        onClick={e => {
          toggleDescription(record.id);
          onExpand(record, e);
        }}
        style={{ cursor: "pointer", marginRight: 8 }}
      >
        {expanded ? "−" : "+"}
      </span>
    );
  };

  // Expanded row render function for description
  const expandedRowRender = (record: any) => {
    const description = record?.description || "No description available";
    return (
      <div 
        className="p-4 bg-gray-50"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    );
  };

  return (
    <Card>
      <TableToolbar>
        <Button type="primary" onClick={() => navigate("/worklogs/new")}>Create</Button>
      </TableToolbar>
      <Table
        loading={isPending || isEditPending}
        dataSource={worklogs || []}
        columns={columns(status, editWorklog, deleteWorklog, isEditPending, navigate)}
        expandable={{
          expandedRowRender,
          expandedRowKeys: expandedRows,
          expandIcon: customExpandIcon,
        }}
        rowKey="id"
        bordered
      />
    </Card>
  );
};

export default AllWorklogTable;