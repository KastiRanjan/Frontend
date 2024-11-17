import { useEditTask } from "@/hooks/task/useEditTask";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { TaskType } from "@/types/task";
import { EditOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Form,
  Table,
  TableProps,
  Tooltip
} from "antd";
import { useMemo, useState } from "react";
import TableToolbar from "../Table/TableToolbar";

const RequestTaskTable = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { mutate } = useEditTask();
  const { data: users } = useUser({ status: "active", limit: 100, page: 1, keywords: "" });
  const [selectedTask, setSelectedTask] = useState<TaskType>({} as TaskType);


  const columns = useMemo(
    () => [

      {
        title: "Task",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Group",
        dataIndex: "group",
        key: "group",
        render: (_: any, record: TaskType) => {
          return record.group?.name;
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (_: any, record: any) => {
          return (
            <>
              <Badge
                count={record.status}
                color="#52c41a"
                style={{ cursor: "pointer" }}
              />
            </>
          );
        }
      },
      {
        title: "Asignee",
        dataIndex: "asignees",
        key: "asignees",
        render: (_: any, record: TaskType) => {
          console.log(record);
          return (
            <>
              <Avatar.Group
                max={{
                  count: 2,
                  style: {
                    color: "#f56a00",
                    backgroundColor: "#fde3cf",
                    cursor: "pointer",
                  },
                  popover: { trigger: "click" },
                }}
              >
                {record.assignees.length > 0 &&
                  record.assignees?.map((user: UserType) => (
                    <Tooltip title={user.username} placement="top">
                      <Avatar style={{ backgroundColor: "#87d068" }}>
                        {user.username.split("")[0]}
                      </Avatar>
                    </Tooltip>
                  ))}
              </Avatar.Group>
            </>
          );
        },
      },
      {
        title: "Due date",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (_: any, record: any) => {
          return (
            <>
              {record?.dueDate ? <span>{new Date(record.dueDate).toLocaleDateString()}</span> : '---'}
            </>
          );
        }
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
      },
      {
        title: "",
        key: "action",
        width: 50,
        render: (_: any, record: any) => (
          <>
            <Button type="primary" onClick={() => showModal(record)} icon={<EditOutlined />}></Button>
          </>
        )
      }
    ],
    []
  );


  const onFinish = (values: any) => {
    console.log("Success:", values);
    mutate({ id: selectedTask.id, payload: values });
  };

  const rowSelection: TableProps<TaskType>["rowSelection"] = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: TaskType[]) => {
      console.log(_selectedRowKeys, selectedRows);
    },
    getCheckboxProps: (record: TaskType) => ({
      name: record.name,
    }),
  };

  return (
    <>
     
      <Table
        columns={columns}
        dataSource={[]}
        rowSelection={rowSelection}
        rowKey={"id"}
        size="small"
        bordered
      />
    </>
  );
};

export default RequestTaskTable;
