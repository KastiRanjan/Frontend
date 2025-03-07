import { useEditWorklog } from "@/hooks/worklog/useEditWorklog";
import { Button, Card, Table, Modal, Input } from "antd";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";
import { useDeleteWorklog } from "@/hooks/worklog/useDeleteWorklog";
import { useWorklogbyUser } from "@/hooks/worklog/useWorklogbyUser";
import { useState } from "react";

const { TextArea } = Input;

const columns = (status: string, editWorklog: any, navigate: any) => {
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
        return "Requestor";
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
        return (
          <>
            <div>
              {moment(record?.startTime).format("hh:mm A") + " - " + moment(record?.endTime).format("hh:mm A")}
            </div>
            {` (${moment.duration(moment(record?.endTime).diff(moment(record?.startTime))).asMinutes()} minutes)`}
          </>
        );
      }
    },
    {
      title: getStatusTitle(status),
      dataIndex: "userId",
      key: "userId",
      render: (_: any, record: any) => {
        return record?.user?.name;
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
    hidden: status !== "open" && status !== "requested",
    render: (_: any, record: any) => {
      if (status === "rejected" || status === "requested") {
        return (
          <div className="flex gap-2">
            {status === "requested" && (
              <>
                <Button
                  type="primary"
                  onClick={() => editWorklog({ id: record?.id, status: "approved" })}
                >
                  Approve
                </Button>
                {/* Reject button will trigger modal, handled in component */}
              </>
            )}
          </div>
        );
      }
    }
  });

  return baseColumns;
};

const IncomingWorklogTable = ({ status }: { status: string }) => {
  const navigate = useNavigate();
  const { data: worklogs, isPending } = useWorklogbyUser(status);
  const { mutate: editWorklog, isPending: isEditPending } = useEditWorklog();
  const { mutate: deleteWorklog } = useDeleteWorklog();
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [remark, setRemark] = useState("");

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

  // Handle Reject button click
  const showRejectModal = (id: string) => {
    setCurrentRecordId(id);
    setRemark("");
    setIsModalVisible(true);
  };

  // Handle modal OK
  const handleReject = () => {
    if (currentRecordId) {
      editWorklog({ 
        id: currentRecordId, 
        status: "rejected",
        remark: remark
      });
    }
    setIsModalVisible(false);
    setCurrentRecordId(null);
    setRemark("");
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentRecordId(null);
    setRemark("");
  };

  return (
    <Card>
      <TableToolbar>
        <Button type="primary" onClick={() => navigate("/worklogs/new")}>Create</Button>
      </TableToolbar>
      <Table
        loading={isPending || isEditPending}
        dataSource={worklogs || []}
        columns={columns(status, editWorklog, navigate).map(col => ({
          ...col,
          // Add custom render for Action column to include Reject button with modal
          render: col.key === "s" ? (_: any, record: any) => {
            if (status === "rejected" || status === "requested") {
              return (
                <div className="flex gap-2">
                  {status === "requested" && (
                    <>
                      <Button
                        type="primary"
                        onClick={() => editWorklog({ id: record?.id, status: "approved" })}
                      >
                        Approve
                      </Button>
                      <Button
                        type="primary"
                        danger
                        onClick={() => showRejectModal(record?.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              );
            }
          } : col.render
        }))}
        expandable={{
          expandedRowRender,
          expandedRowKeys: expandedRows,
          expandIcon: customExpandIcon,
        }}
        rowKey="id"
        bordered
      />

      {/* Reject Remark Modal */}
      <Modal
        title="Reject Worklog"
        visible={isModalVisible}
        onOk={handleReject}
        onCancel={handleCancel}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <TextArea
          rows={4}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Enter reason for rejection"
        />
      </Modal>
    </Card>
  );
};

export default IncomingWorklogTable;