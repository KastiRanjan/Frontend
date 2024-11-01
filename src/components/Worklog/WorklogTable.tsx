
import { Table } from "antd";
import moment from "moment";

const columns = [
  {
    title: "Description",
    dataIndex: "description",
    key: "descritpion",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (_: any, record: any) => {
      return new Date(record?.startTime).toLocaleDateString();
    }
  },
  {
    title: "Start Time",
    dataIndex: "startTime",
    key: "startTime",
    render: (_: any, record: any) => {
      return moment(record?.startTime).format("hh:mm A");
    }
  },
  {
    title: "End Time",
    dataIndex: "endTime",
    key: "endTime",
    render: (_: any, record: any) => {
        return moment(record?.endTime).format("hh:mm A");
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
];

const WorklogTable = ({data}:{data:any}) => {
    

  return (
    <Table
      dataSource={data}   
      columns={columns}
      size="small"
      rowKey={"id"}
      bordered
    />
  );
};

export default WorklogTable;
