import { useProject } from "@/hooks/project/useProject";
import { useCreateWorklog } from "@/hooks/worklog/useCreateWorklog";
import { TaskTemplateType } from "@/types/taskTemplate";
import { UserType } from "@/types/user";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Row,
  Select,
  TimePicker,
  DatePicker,
  message,
} from "antd";
import { useState } from "react";
import ReactQuill from "react-quill";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import moment from "moment";

const OWorklogForm = () => {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState<{
    [fieldName: string]: TaskTemplateType[];
  }>({});
  const [users, setUsers] = useState<{ [fieldName: string]: UserType[] }>({});
  const { data: projects } = useProject({ status: "active" });
  const { mutate: createWorklog } = useCreateWorklog();
  const navigate = useNavigate();
  const { profile } = useSession(); // Get current user info (you'll need to implement this)
  const user = profile;

  // Check if user is manager or admin
  const isManagerOrAdmin =
    user?.role?.name === "manager" ||
    user?.role === "admin" ||
    user?.role?.name === "superuser";

  // Handle the form submission
  const handleFinish = (values: any) => {
    const updatedTimeEntries = values.timeEntries.map((entry: any) => ({
      ...entry,
      status: "requested",
    }));

    createWorklog(updatedTimeEntries, {
      onSuccess: () => {
        navigate("/worklogs-all");
      },
      onError: (error: any) => {
        // Extract message from error response
        const errorMessage =
          error?.response?.data?.message ||
          "An error occurred while creating the worklog";
        message.error(errorMessage); // Display the error message
      },
    });
  };

  const timeFormat = "HH:mm";

  // Handle project change for a specific form entry
  const handleProjectChange = (projectId: string, fieldName: any) => {
    const selectedProject = projects?.find(
      (project: any) => project.id === projectId
    );
    if (selectedProject) {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [fieldName]: selectedProject.tasks || [],
      }));
      setUsers((prevUsers) => ({
        ...prevUsers,
        [fieldName]: selectedProject.users || [],
      }));
    }
  };

  return (
    <>
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.List name="timeEntries">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Card key={field.key} style={{ marginBottom: "20px" }}>
                  <Row gutter={16} key={field.key}>
                    {/* Date Field */}
                    <Col span={4}>
                      <Form.Item
                        label="Date"
                        name={[field.name, "date"]}
                        rules={[
                          {
                            required: true,
                            message: "Please select a date!",
                          },
                        ]}
                        initialValue={moment()} // Default to current date
                      >
                        <DatePicker
                          className="w-full py-2"
                          disabled={!isManagerOrAdmin} // Disable if not manager/admin
                        />
                      </Form.Item>
                    </Col>

                    {/* Project Dropdown */}
                    <Col span={5}>
                      <Form.Item
                        label="Project"
                        name={[field.name, "projectId"]}
                        rules={[
                          {
                            required: true,
                            message: "Please select a project!",
                          },
                        ]}
                      >
                        <Select
                          className="h-[40px]"
                          onChange={(projectId) =>
                            handleProjectChange(projectId, field.name)
                          }
                          options={projects?.map((p: TaskTemplateType) => ({
                            label: p.name,
                            value: p.id,
                          }))}
                        />
                      </Form.Item>
                    </Col>

                    {/* Task Dropdown */}
                    <Col span={5}>
                      <Form.Item
                        label="Task"
                        name={[field.name, "taskId"]}
                        rules={[
                          { required: true, message: "Please select a task!" },
                        ]}
                      >
                        <Select
                          className="h-[40px]"
                          options={tasks[field.name]?.map(
                            (t: TaskTemplateType) => ({
                              label: t.name,
                              value: t.id,
                            })
                          )}
                          disabled={!tasks[field.name]?.length}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={3}>
                      <Form.Item
                        label="Start Time"
                        name={[field.name, "startTime"]}
                        rules={[
                          {
                            required: true,
                            message: "Please select start time!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const endTime = getFieldValue([
                                "timeEntries",
                                field.name,
                                "endTime",
                              ]);
                              if (
                                !value ||
                                !endTime ||
                                value.isBefore(endTime)
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error(
                                  "Start time cannot be after end time!"
                                )
                              );
                            },
                          }),
                        ]}
                      >
                        <TimePicker
                          className="w-full py-2"
                          format={timeFormat}
                          minuteStep={1}
                          onSelect={(time) => {
                            form.setFieldsValue({
                              timeEntries: {
                                [field.name]: { startTime: time },
                              },
                            });
                            // Trigger validation manually if needed
                            form.validateFields([
                              ["timeEntries", field.name, "startTime"],
                            ]);
                          }}
                          onChange={(time) => {
                            // Ensure the value is updated even if popup closes without OK
                            if (time) {
                              form.setFieldsValue({
                                timeEntries: {
                                  [field.name]: { startTime: time },
                                },
                              });
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>

                    {/* End Time Field */}
                    <Col span={3}>
                      <Form.Item
                        label="End Time"
                        name={[field.name, "endTime"]}
                        rules={[
                          {
                            required: true,
                            message: "Please select end time!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const startTime = getFieldValue([
                                "timeEntries",
                                field.name,
                                "startTime",
                              ]);
                              if (
                                !value ||
                                !startTime ||
                                value.isAfter(startTime)
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("End time must be after start time!")
                              );
                            },
                          }),
                        ]}
                      >
                        <TimePicker
                          className="w-full py-2"
                          format={timeFormat}
                          minuteStep={1}
                          onSelect={(time) => {
                            form.setFieldsValue({
                              timeEntries: { [field.name]: { endTime: time } },
                            });
                            // Trigger validation manually if needed
                            form.validateFields([
                              ["timeEntries", field.name, "endTime"],
                            ]);
                          }}
                          onChange={(time) => {
                            // Ensure the value is updated even if popup closes without OK
                            if (time) {
                              form.setFieldsValue({
                                timeEntries: {
                                  [field.name]: { endTime: time },
                                },
                              });
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={3}>
                      <Form.Item
                        label="Request To"
                        name={[field.name, "approvedBy"]}
                        rules={[
                          { required: true, message: "Please select a task!" },
                        ]}
                      >
                        <Select
                          className="h-[40px]"
                          options={users[field.name]?.map((t: UserType) => ({
                            label: t.name,
                            value: t.id,
                          }))}
                          disabled={!tasks[field.name]?.length}
                        />
                      </Form.Item>
                    </Col>

                    {/* Description Field */}
                    <Col span={12}>
                      <Form.Item
                        name={[field.name, "description"]}
                        rules={[
                          {
                            required: true,
                            message: "Please input the worklog message!",
                          },
                        ]}
                      >
                        <ReactQuill
                          theme="snow"
                          onChange={(value) => {
                            form.setFieldValue(
                              [field.name, "description"],
                              value
                            );
                          }}
                          value={form.getFieldValue([
                            field.name,
                            "description",
                          ])}
                        />
                      </Form.Item>
                    </Col>

                    {/* Remove Field */}
                    <Col span={1}>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Col>
                  </Row>
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add Log
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>


        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </>
  );
};

export default OWorklogForm;
