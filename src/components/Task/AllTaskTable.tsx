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
import TextArea from "antd/es/input/TextArea";
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
      <Col span={16}>
        <Table
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
          size="small"
          rowKey={"id"}
          bordered
        />
      </Col>
      <Col span={8}>
        <Card>
          <div style={{ padding: "16px" }}>
            <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Code {selectedTask?.tcode}
            </p>
            <Input.TextArea
              className="text-2xl font-bold"
              value={selectedTask?.name}
              onChange={(e) => form.setFieldsValue({ name: e.target.value })}
            />

            <Form form={form} onFinish={onFinish} className="mt-2">
              <Form.Item name="status" className="m-0 w-[130px]">
                <Select
                  defaultValue={"open"}
                  onChange={(value) => form.setFieldsValue({ status: value })}
                  defaultActiveFirstOption
                  style={{
                    background:
                      form.getFieldValue("status") === "done"
                        ? "green"
                        : form.getFieldValue("status") === "in_progress"
                        ? "orange"
                        : "red",
                  }}
                  options={[
                    { value: "open", label: "Open" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "done", label: "Done" },
                  ]}
                  variant="filled"
                  size="large"
                />
              </Form.Item>
            </Form>
            <div className="py-3">
              <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                Description
              </p>
              <Form form={form1} onFinish={onFinish} defaultValue={selectedTask?.description} >
                <Form.Item id="description" name="description" >
                  <Input.TextArea  rows={5} />
                </Form.Item>
                <Button htmlType="submit" type="primary">
                  Save
                </Button>
              </Form>
            </div>
            <p style={{ fontWeight: "bold", marginBottom: "8px" }}>Detail</p>
            <Divider className="my-2" />
            <Row gutter={16} className="mb-2">
              <Col span={6}>
                <strong>Assignee: </strong>{" "}
              </Col>
              <Col span={6}>
                {/* <Form
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
              </Form> */}
              </Col>
            </Row>
            <Row gutter={16} className="mb-2">
              <Col span={6}>
                <strong>Reporter:</strong>
              </Col>
              <Col>
                <ul>
                  <li>Ranjan</li>
                </ul>
              </Col>
            </Row>
            <Row gutter={24} className="mb-2">
              <Col span={12}>
                <strong>Created Date:</strong>
              </Col>
              <Col>
                {selectedTask?.createdAt
                  ? new Date(selectedTask?.createdAt).toLocaleString()
                  : ""}
              </Col>
            </Row>
            <Row gutter={24} className="mb-2">
              <Col span={12}>
                <strong>Updated Date:</strong>
              </Col>
              <Col>
                {selectedTask?.updatedAt
                  ? new Date(selectedTask.updatedAt).toLocaleString()
                  : ""}
              </Col>
            </Row>
            <Row gutter={24} className="mb-2">
              <Col span={12}>
                <strong>Due Date:</strong>
              </Col>
              <Col>{selectedTask?.dueDate}</Col>
            </Row>
            <Row gutter={16} className="mb-2">
              <Col>
                <strong>Project:{selectedTask?.project?.name}</strong>
              </Col>
            </Row>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default AllTaskTable;
