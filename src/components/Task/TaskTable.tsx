import { useEditTask } from "@/hooks/task/useEditTask";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { TaskType } from "@/pages/Task/type";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Form,
  Table,
  TableProps,
  Tooltip
} from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import TableToolbar from "../Table/TableToolbar";

const TaskTable = ({ data, showModal,project }: { data: TaskType[], showModal: any, project: any }) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { mutate } = useEditTask();
  const { data: users } = useUser();
  const [selectedTask, setSelectedTask] = useState<TaskType>({} as TaskType);


  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "tcode",
        key: "id",
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (_: any, record: TaskType) => (
          <div className="flex items-center justify-between gap-2">
            <Link to={`/project/${record?.project?.id}/tasks/${record?.id}`} className="text-blue-600">{record?.name}</Link>
            {record?.subTasks?.length > 0 && (
              <span>
                <svg
                  fill="none"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  role="presentation"
                >
                  <path
                    stroke="currentcolor"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M3 8h10c.69 0 1.25.56 1.25 1.25V13c0 .69-.56 1.25-1.25 1.25H9.25C8.56 14.25 8 13.69 8 13V3c0-.69-.56-1.25-1.25-1.25H3c-.69 0-1.25.56-1.25 1.25v3.75C1.75 7.44 2.31 8 3 8Z"
                  ></path>
                </svg>
              </span>
            )}
          </div>
        ),
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
        title: "Action",
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
    <Card>
      <TableToolbar>
        <Button
          type="primary"
          onClick={() => showModal()}
        >
          Add New Task
        </Button>  <div className="flex gap-4">


          <Avatar.Group
            max={{
              count: 4,
              style: {
                color: "#f56a00",
                backgroundColor: "#fde3cf",
                cursor: "pointer",
              },
              popover: { trigger: "click" },
            }}
          >
            {project?.users?.map((user: any) => (
              <Tooltip title={user.username} placement="top">
                <Avatar style={{ backgroundColor: "#87d068" }}>
                  {user.username.split("")[0]}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
          <Tooltip title={project?.projectLead?.username} placement="top">
            <Avatar style={{ backgroundColor: "#87d068" }}>
              {project?.projectLead?.username.split("")[0]}
            </Avatar>
          </Tooltip>
        </div>    </TableToolbar>
      <Table
        columns={columns}
        dataSource={data}
        rowSelection={rowSelection}
        rowKey={"id"}
        size="small"
        bordered
      />
    </Card>
  );
};

export default TaskTable;
