
import { Table } from "antd";
import moment from "moment";
import { Link } from "react-router-dom";

const columns = [
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
      return <Link to={`/project/${record?.task?.project?.id}/tasks`} className="text-blue-600">{record?.task?.project?.name}</Link>
    }
  },
  {
    title: "Task",
    dataIndex: "Task",
    key: "task",
    render: (_: any, record: any) => {
      return <Link to={`/project/${record?.task?.project?.id}/tasks/${record?.task?.id}`} className="text-blue-600">{record?.task?.name}</Link>
    }
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "descritpion",
  },
  {
    title: "Review Date",
    dataIndex: "status",
    key: "descritpion",
  },
  {
    title: "Duration",
    dataIndex: "startTime",
    key: "startTime",
    render: (_: any, record: any) => {
      return moment(record?.startTime).format("hh:mm A") + " - " + moment(record?.endTime).format("hh:mm A");
    }
  },

  {
    title: "Logged by",
    dataIndex: "userId",
    key: "userId",
    render: (_: any, record: any) => {
      return (record?.user?.name);
    }
  },
  {
    title: "Approved by",
    dataIndex: "userId",
    key: "userId",
    render: (_: any, record: any) => {
      return (record?.user?.name);
    }
  },
];

const AllWorklogTable = ({ data, isPending }: any) => {

  return (
    <Table
      loading={isPending}
      dataSource={data}
      columns={columns}
      rowKey={"id"}
      bordered
    />
  );
};

export default AllWorklogTable;
