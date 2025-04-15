import { useEditTask } from "@/hooks/task/useEditTask";
import { useTasks } from "@/hooks/task/useTask";
import { TaskType } from "@/types/task";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Table,
  TableProps,
} from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const AllTaskTable = ({ status }: { status: string }) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const { mutate } = useEditTask();
  const { data } = useTasks({ status });

  // const { data: users } = useUser();
  const [selectedTask, setSelectedTask] = useState<TaskType>({} as TaskType);
  console.log("selectedTask", selectedTask);
  const showDrawer = (record: TaskType) => {
    setOpen(true);
    setSelectedTask(record);
  };

  const onClose = () => {
    setOpen(false);
  };
  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "tcode",
        key: "tcode",
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (_: any, record: TaskType) => (
          <>
            <span
              onClick={() => showDrawer(record)}
              className="cursor-pointer hover:underline"
            >
              {record.name}
            </span>
          </>
        ),
      },

      {
        title: "Project",
        dataIndex: "project",
        key: "project",
        render: (_: any, record: any) => {
          return (
            <Link
              to={`/projects/${record.project?.id}`}
              className="text-blue-600"
            >
              {record.project?.name}
            </Link>
          );
        },
      },
      {
        title: "Type",
        dataIndex: "taskType",
        key: "taskType",
      },
      {
        title: "Asignee",
        dataIndex: "asignees",
        key: "asignees",
        render: (_: any, record: TaskType) => {
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
                {/* {record.assignees.length > 0 &&
                  record.assignees?.map((user: UserType) => (
                    <Tooltip title={user.username} placement="top">
                      <Avatar style={{ backgroundColor: "#87d068" }}>
                        {user.username.split("")[0]}
                      </Avatar>
                    </Tooltip>
                  ))} */}
              </Avatar.Group>
            </>
          );
        },
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
      },
    ],
    []
  );
  // const handleChange = (value: string) => {
  //   console.log(`selected ${value}`);
  // };

  const onFinish = (values: any) => {
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
    <Row gutter={8}>
      <Col span={24}>
        <Table
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
          size="small"
          rowKey={"id"}
          bordered
        />
      </Col>
    </Row>
  );
};

export default AllTaskTable;
