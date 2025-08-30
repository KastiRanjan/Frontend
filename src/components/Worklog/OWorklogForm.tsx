import { useProject } from "@/hooks/project/useProject";
import { useCreateWorklog } from "@/hooks/worklog/useCreateWorklog";
import { TaskTemplateType } from "@/types/taskTemplate";
import { UserType } from "@/types/user";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Select,
  TimePicker,
  DatePicker,
  message,
} from "antd";
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import moment from "moment";

const OWorklogForm = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<{ [fieldName: string]: UserType[] }>({});
  const [filteredTasks, setFilteredTasks] = useState<{ [fieldName: string]: TaskTemplateType[] }>({});
  const [loadingTasks, setLoadingTasks] = useState<{ [fieldName: string]: boolean }>({});
  
  const { data: projects } = useProject({ status: "active" });
  const { mutate: createWorklog } = useCreateWorklog();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useSession();
  const user = profile;
  
  // Get date from URL parameters if provided
  const urlParams = new URLSearchParams(location.search);
  const dateParam = urlParams.get('date');
  
  // Initialize form with date parameter if available
  useEffect(() => {
    if (dateParam) {
      form.setFieldsValue({
        timeEntries: [{ date: moment(dateParam) }],
      });
    }
  }, [dateParam, form]);
  
  // Check if user is manager or admin
  const roleName = user?.role && (user.role as any).name ? (user.role as any).name.toLowerCase() : "";
  const isManagerOrAdmin =
    roleName === "projectmanager" ||
    roleName === "admin" ||
    roleName === "superuser";

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
        const errorMessage =
          error?.response?.data?.message ||
          "An error occurred while creating the worklog";
        message.error(errorMessage);
      },
    });
  };

  const timeFormat = "HH:mm";

  // Fetch tasks for a specific project
  const fetchProjectTasks = async (projectId: string, fieldName: string) => {
    setLoadingTasks(prev => ({ ...prev, [fieldName]: true }));
    
    try {
      // Import the service function directly
      const { fetchProjectTasks } = await import("@/service/task.service");
      const tasksData = await fetchProjectTasks({ id: projectId });
      
      const userId = (user as any)?.id;
      let tasksList = tasksData || [];
      
      // Filter tasks where current user is assigned
      tasksList = tasksList.filter((task: any) => {
        if (!task.assignees || !Array.isArray(task.assignees)) return false;
        return task.assignees.some((assignee: any) => 
          assignee?.id?.toString() === userId?.toString()
        );
      });
      
      setFilteredTasks(prev => ({
        ...prev,
        [fieldName]: tasksList
      }));
      
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      setFilteredTasks(prev => ({
        ...prev,
        [fieldName]: []
      }));
    } finally {
      setLoadingTasks(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // Handle project change for a specific form entry
  const handleProjectChange = (projectId: string, fieldName: any) => {
    // Find selected project for users
    const selectedProject = projects?.find(
      (project: any) => project.id?.toString() === projectId?.toString()
    );
    let filteredUsers: UserType[] = selectedProject?.users || [];
    console.log("Filtered Users:", filteredUsers);
    const currentUserId = (user as any)?.id?.toString();
    const currentUserRole = user?.role && (user.role as any).name ? (user.role as any).name.toLowerCase() : "";

    // Remove auditjunior and self from the list
    filteredUsers = filteredUsers.filter((u: any) => {
      const roleName = u?.role && u.role.name ? u.role.name.toLowerCase() : "";
      const isProjectLead = u?.position === "projectLead";
      if (u?.id?.toString() === currentUserId) return false; // Exclude self
      if (roleName === "auditjunior") return false; // Always exclude auditjunior
      // For auditsenior, only allow projectmanager, admin, superuser, or project lead (by position)
      if (currentUserRole === "auditsenior") {
        return ["projectmanager", "admin", "superuser"].includes(roleName) || isProjectLead;
      }
      return true;
    });

    setUsers((prevUsers) => ({
      ...prevUsers,
      [fieldName]: filteredUsers,
    }));

    // Clear existing tasks for this field
    setFilteredTasks(prev => ({
      ...prev,
      [fieldName]: []
    }));

    // Clear task selection in form
    const currentValues = form.getFieldsValue();
    if (currentValues.timeEntries && currentValues.timeEntries[fieldName]) {
      currentValues.timeEntries[fieldName].taskId = undefined;
      form.setFieldsValue(currentValues);
    }

    // Fetch tasks for the selected project
    if (projectId) {
      fetchProjectTasks(projectId, fieldName);
    }
  };

  return (
    <>
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{
          timeEntries: [{ date: dateParam ? moment(dateParam) : moment() }], // Initialize with date parameter or current date
        }}
      >
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
                      >
                        <DatePicker
                          className="w-full py-2"
                          disabled={!isManagerOrAdmin}
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
                          loading={loadingTasks[field.name]}
                          options={filteredTasks[field.name]?.map(
                            (t: TaskTemplateType) => ({
                              label: t.name,
                              value: t.id,
                            })
                          )}
                          disabled={loadingTasks[field.name] || !filteredTasks[field.name]?.length}
                          placeholder="Select a task"
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
                            form.validateFields([
                              ["timeEntries", field.name, "startTime"],
                            ]);
                          }}
                          onChange={(time) => {
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
                            form.validateFields([
                              ["timeEntries", field.name, "endTime"],
                            ]);
                          }}
                          onChange={(time) => {
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
                          { required: true, message: "Please select a user!" },
                        ]}
                      >
                        <Select
                          className="h-[40px]"
                          options={users[field.name]?.map((t: UserType) => ({
                            label: t.name,
                            value: t.id,
                          }))}
                          disabled={!users[field.name]?.length}
                          placeholder="Select a user"
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
                              ["timeEntries", field.name, "description"],
                              value
                            );
                          }}
                          value={form.getFieldValue([
                            "timeEntries",
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