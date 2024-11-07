import { useEditTask } from "@/hooks/task/useEditTask";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { TaskType } from "@/pages/Task/type";
import {
  Avatar,
  Badge,
  Button,
  Col,
  Drawer,
  Form,
  Row,
  Table,
  TableProps,
  Tooltip
} from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import { useMemo, useState } from "react";
import FormSelectWrapper from "../FormSelectWrapper";

const TaskTable = ({ data }: { data: TaskType[] }) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { mutate } = useEditTask();
  const { data: users } = useUser();
  const [selectedTask, setSelectedTask] = useState<TaskType>({} as TaskType);
  console.log(selectedTask?.assignees);

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
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (_: any, record: TaskType) => (
          <>
            <span onClick={() => showDrawer(record)}>{record.name}</span>{" "}
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
          </>
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
                {/* <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                <Avatar style={{ backgroundColor: "#f56a00" }}>K</Avatar>

                <Avatar
                  style={{ backgroundColor: "#1677ff" }}
                  icon={<AntDesignOutlined />}
                /> */}
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
    ],
    []
  );


  const onFinish = (values: any) => {
    console.log("Success:", values);
    mutate({ id: selectedTask.id, payload: values });
  };

  const rowSelection: TableProps<TaskType>["rowSelection"] = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: TaskType[]) => { console.log(_selectedRowKeys, selectedRows);
    },
    getCheckboxProps: (record: TaskType) => ({
      name: record.name,
    }),
  };
  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowSelection={rowSelection}
        size="small"
        rowKey={"id"}
        bordered
      />

      <Drawer
        onClose={onClose}
        open={open}
        size="large"
        placement="right"
      // getContainer={false}
      >
        <div style={{ padding: "16px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "8px" }}>PENG 326</p>
          <Title level={3} style={{ marginBottom: "16px" }}>
            {selectedTask?.name}
          </Title>
          <Form form={form} onFinish={onFinish}>
            <Row>
              <Col span={6}>
                <strong>Status: </strong>{" "}
              </Col>
              <Col span={6}>
                <FormSelectWrapper
                  id="status"
                  name="status"
                  defaultValue={selectedTask?.status}
                  options={[
                    { value: "open", label: "Open" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "done", label: "Done" },
                  ]}
                  changeHandler={() => form.submit()}
                />
              </Col>
            </Row>
          </Form>
          <div className="py-3">
            <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Description
            </p>
            <Form form={form} onFinish={onFinish}>
              <Form.Item id="asignees" name="description">
                <TextArea defaultValue={selectedTask?.description} />
              </Form.Item>
              <Button htmlType="submit" type="primary">
                Save
              </Button>
            </Form>
          </div>
          <p style={{ fontWeight: "bold", marginBottom: "8px" }}>Detail</p>
          <Row gutter={16}>
            <Col span={6}>
              <strong>Assignee: </strong>{" "}
            </Col>
            <Col span={6}>
              <Form
                form={form}
                initialValues={selectedTask?.assignees || []}
                onFinish={onFinish}
              >
                <FormSelectWrapper
                  id="asignees"
                  name="assineeId"
                  mode="multiple"
                  classname="h-[38px]"
                  options={users?.results.map((user: UserType) => ({
                    label: user.username,
                    value: user.id,
                  }))}
                  changeHandler={() => form.submit()}
                />
              </Form>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <strong>Reporter:</strong>
            </Col>
            <Col>
              <ul>
                <li>Ranjan</li>
              </ul>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <strong>Due Date:</strong>
            </Col>
            <Col>{selectedTask?.dueDate}</Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <strong>Project:</strong>
            </Col>
            <Col>
              <strong>Project:</strong>
            </Col>
          </Row>
        </div>
      </Drawer>
    </>
  );
};

export default TaskTable;
