
import { useEditWorklog } from "@/hooks/worklog/useEditWorklog";
import { Button, Card, Table, } from "antd";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";
import { useDeleteWorklog } from "@/hooks/worklog/useDeleteWorklog";
import { useWorklogbyUser } from "@/hooks/worklog/useWorklogbyUser";

const columns = (status: string, editWorklog: any, navigate: any) => [
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
    title: "Requestor",
    dataIndex: "userId",
    key: "userId",
    render: (_: any, record: any) => {
      return (record?.user?.name);
    }
  },
  {
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
                <Button 
                  type="primary"
                  danger
                  onClick={() => editWorklog({ id: record?.id, status: "rejected" })}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        );
      }
    }
  },
];
const IncomingWorklogTable = ({ status }: { status: string }) => {
  const navigate = useNavigate();
  const { data: worklogs, isPending } = useWorklogbyUser(status);
  const { mutate: editWorklog, isPending: isEditPending } = useEditWorklog();
  const { mutate: deleteWorklog } = useDeleteWorklog();

  return (
    <Card>
      <TableToolbar>
        <Button type="primary" onClick={() => navigate("/worklogs/new")}>Create</Button>
      </TableToolbar>
      <Table
        loading={isPending}
        dataSource={worklogs || []}
        columns={columns(status, editWorklog, deleteWorklog, isEditPending,navigate)}
        rowKey="id"
        bordered
      />
    </Card>
  );
};

export default IncomingWorklogTable;