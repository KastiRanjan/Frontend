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
  Modal,
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
  // ...existing code...
  const { profile } = useSession();
  const user = profile;
  // Permission check for editing worklog date (object-based)
  const permissions = (user && user.role && user.role.permission) ? user.role.permission : [];
  const canEditWorklogDate = Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "worklogs" &&
        perm.path === "/worklogs/:id/date" &&
        perm.method?.toLowerCase() === "patch"
    );
  const [form] = Form.useForm();
  const [users, setUsers] = useState<{ [fieldName: string]: UserType[] }>({});
  const [filteredTasks, setFilteredTasks] = useState<{ [fieldName: string]: TaskTemplateType[] }>({});
  const [loadingTasks, setLoadingTasks] = useState<{ [fieldName: string]: boolean }>({});
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  
  const { data: projects } = useProject({ status: "active" });
  const { mutate: createWorklog } = useCreateWorklog();
  const navigate = useNavigate();
  const location = useLocation();
  // ...existing code...
  // user is already declared above
  
  // Get date from URL parameters if provided
  const urlParams = new URLSearchParams(location.search);
  const dateParam = urlParams.get('date');
  
  // Functions to handle mouse hover
  const handleMouseEnter = (fieldName: number) => {
    setHoveredItem(fieldName);
  };
  
  const handleMouseLeave = () => {
    setHoveredItem(null);
  };
  
  // Initialize form with date parameter if available
  useEffect(() => {
    // Initialize with multiple empty entries all with today's date
    const today = dateParam ? moment(dateParam) : moment();
    form.setFieldsValue({
      timeEntries: [{ date: today }],
    });
  }, [dateParam, form]);
  
  // Check if user is manager or admin
  // (removed unused isManagerOrAdmin)

  // Function to check for overlapping time entries
  const checkForOverlappingEntries = (entries: any[]): { hasOverlap: boolean, overlapDetails: string[] } => {
    const overlapDetails: string[] = [];
    
    // Group entries by date
    const entriesByDate = entries.reduce((acc: { [key: string]: any[] }, entry: any) => {
      if (!entry.date || !entry.startTime || !entry.endTime) return acc;
      
      const dateKey = entry.date.format('YYYY-MM-DD');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push({
        ...entry,
        dateKey,
      });
      
      return acc;
    }, {});
    
    // Check for overlaps within each date group
    Object.keys(entriesByDate).forEach(dateKey => {
      const dateEntries = entriesByDate[dateKey];
      
      if (dateEntries.length > 1) {
        // Compare each entry with all others for the same date
        for (let i = 0; i < dateEntries.length; i++) {
          const entry1 = dateEntries[i];
          const start1 = entry1.startTime;
          const end1 = entry1.endTime;
          
          for (let j = i + 1; j < dateEntries.length; j++) {
            const entry2 = dateEntries[j];
            const start2 = entry2.startTime;
            const end2 = entry2.endTime;
            
            // Check if the time periods overlap
            if (
              (start1.isBefore(end2) && end1.isAfter(start2)) || 
              (start2.isBefore(end1) && end2.isAfter(start1)) ||
              (start1.isSame(start2) || end1.isSame(end2))
            ) {
              overlapDetails.push(
                `Overlap on ${dateKey}: ${start1.format('HH:mm')} - ${end1.format('HH:mm')} overlaps with ${start2.format('HH:mm')} - ${end2.format('HH:mm')}`
              );
            }
          }
        }
      }
    });
    
    return {
      hasOverlap: overlapDetails.length > 0,
      overlapDetails
    };
  };

  // Handle the form submission
  const handleFinish = (values: any) => {
    const updatedTimeEntries = values.timeEntries.map((entry: any) => ({
      ...entry,
      status: "requested",
    }));
    
    // Check for overlapping time entries
    const { hasOverlap, overlapDetails } = checkForOverlappingEntries(values.timeEntries);
    
    if (hasOverlap) {
      // Display modal warning with details of overlaps
      Modal.confirm({
        title: 'Warning: Overlapping Worklogs Detected',
        content: (
          <div>
            <p>The following worklogs overlap in time:</p>
            <ul>
              {overlapDetails.map((detail, index) => (
                <li key={index} style={{ color: 'red' }}>{detail}</li>
              ))}
            </ul>
            <p>Overlapping worklogs may cause time tracking issues. Do you want to proceed anyway?</p>
          </div>
        ),
        okText: 'Proceed Anyway',
        okButtonProps: { danger: true },
        cancelText: 'Go Back and Fix',
        onOk() {
          // User chose to proceed despite overlaps
          createWorklog(updatedTimeEntries, {
            onSuccess: () => {
              message.success("Worklog added successfully. Tasks are now marked as in progress.");
              navigate("/worklogs-all");
            },
            onError: (error: any) => {
              const errorMessage =
                error?.response?.data?.message ||
                "An error occurred while creating the worklog";
              message.error(errorMessage);
            },
          });
        },
      });
    } else {
      // No overlaps, proceed normally
      createWorklog(updatedTimeEntries, {
        onSuccess: () => {
          message.success("Worklog added successfully. Tasks are now marked as in progress.");
          navigate("/worklogs-all");
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            "An error occurred while creating the worklog";
          message.error(errorMessage);
        },
      });
    }
  };

  const timeFormat = "HH:mm";

  // Fetch tasks for a specific project
  const fetchProjectTasks = async (projectId: string, fieldName: string) => {
    setLoadingTasks(prev => ({ ...prev, [fieldName]: true }));
    
    try {
      // Import the service function directly
      const { fetchProjectTasks } = await import("@/service/task.service");
      const { fetchProject } = await import("@/service/project.service");
      
      // Fetch both tasks and project details
      const [tasksData, projectData] = await Promise.all([
        fetchProjectTasks({ id: projectId }),
        fetchProject({ id: projectId })
      ]);
      
      const userId = (user as any)?.id;
      let tasksList = tasksData || [];
      
      // Filter tasks where current user is assigned
      tasksList = tasksList.filter((task: any) => {
        if (!task.assignees || !Array.isArray(task.assignees)) return false;
        return task.assignees.some((assignee: any) => 
          assignee?.id?.toString() === userId?.toString()
        );
      });
      
      // Filter tasks based on project's allowSubtaskWorklog setting
      if (projectData && !projectData.allowSubtaskWorklog) {
        // If project doesn't allow subtask worklog, only show main tasks (stories) regardless of whether they have subtasks
        tasksList = tasksList.filter((task: any) => task.taskType === 'story');
      } else {
        // If project allows subtask worklog, show all tasks except parent tasks that have subtasks
        tasksList = tasksList.filter((task: any) => {
          if (task.taskType === 'story' && task.subTasks && task.subTasks.length > 0) {
            return false; // Don't show parent tasks that have subtasks
          }
          return true;
        });
      }
      
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
      <style>{`
        .quill-container .ql-container {
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
        .quill-container .ql-toolbar {
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        }
        .quill-container .ql-editor {
          min-height: 80px;
          max-height: 120px;
          overflow-y: auto;
        }
      `}</style>
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{
          timeEntries: [{ date: dateParam ? moment(dateParam) : moment() }],
        }}
      >
        <Form.List name="timeEntries">
          {(fields, { add, remove }) => (
            <>
              {/* Fixed header for the form items */}
              <Row className="bg-gray-100 p-2 mb-2 font-semibold rounded">
                <Col span={3}>Date</Col>
                <Col span={6}>Project</Col>
                <Col span={6}>Task</Col>
                <Col span={2}>Start Time</Col>
                <Col span={2}>End Time</Col>
                <Col span={3}>Request To</Col>
                <Col span={1} className="text-right">Action</Col>
              </Row>
              
              {fields.map((field) => (
                <Card 
                  key={field.key} 
                  style={{ 
                    marginBottom: "16px", 
                    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                    borderRadius: "8px",
                    transition: "all 0.2s ease-in-out",
                    border: hoveredItem === field.name ? "1px solid #1890ff" : "1px solid #f0f0f0",
                    overflow: "hidden"
                  }}
                  className="hover:shadow-md"
                  bodyStyle={{ padding: "16px", overflow: "visible" }}
                  onMouseEnter={() => handleMouseEnter(field.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div>
                    <Row gutter={12} align="middle">
                      {/* Date Field */}
                      <Col span={3}>
                        <Form.Item
                          name={[field.name, "date"]}
                          rules={[{ required: true, message: "Required!" }]}
                          style={{ marginBottom: 8 }}
                        >
                          <DatePicker
                            className="w-full"
                            disabled={!canEditWorklogDate}
                            format="YYYY-MM-DD"
                            placeholder="Select date"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Project Dropdown */}
                      <Col span={6}>
                        <Form.Item
                          name={[field.name, "projectId"]}
                          rules={[{ required: true, message: "Required!" }]}
                          style={{ marginBottom: 8 }}
                        >
                          <Select
                            placeholder="Select project"
                            onChange={(projectId) =>
                              handleProjectChange(projectId, field.name)
                            }
                            options={projects?.map((p: TaskTemplateType) => ({
                              label: p.name,
                              value: p.id,
                            }))}
                            showSearch
                            optionFilterProp="label"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Task Dropdown */}
                      <Col span={6}>
                        <Form.Item
                          name={[field.name, "taskId"]}
                          rules={[{ required: true, message: "Required!" }]}
                          style={{ marginBottom: 8 }}
                        >
                          <Select
                            placeholder="Select task"
                            loading={loadingTasks[field.name]}
                            options={filteredTasks[field.name]
                              ?.map((currentTask: TaskTemplateType) => {
                                // For stories without subtasks, show normally
                                if (currentTask.taskType === 'story') {
                                  return {
                                    label: currentTask.name,
                                    value: currentTask.id,
                                  };
                                }
                                
                                // For subtasks, show with parent name
                                if (currentTask.taskType === 'task') {
                                  const parentTask = filteredTasks[field.name]?.find((t: TaskTemplateType) => 
                                    t.subTasks && t.subTasks.some((sub: TaskTemplateType) => sub.id === currentTask.id)
                                  );
                                  
                                  const parentName = currentTask.parentTask?.name || parentTask?.name || 'Unknown Parent';
                                  return {
                                    label: `${parentName} (${currentTask.name})`,
                                    value: currentTask.id,
                                  };
                                }
                                
                                // Fallback
                                return {
                                  label: currentTask.name,
                                  value: currentTask.id,
                                };
                              })
                            }
                            disabled={loadingTasks[field.name] || !filteredTasks[field.name]?.length}
                            showSearch
                            optionFilterProp="label"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Start Time Field */}
                      <Col span={2}>
                        <Form.Item
                          name={[field.name, "startTime"]}
                          rules={[
                            { required: true, message: "Required!" },
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
                                  new Error("Start must be before end!")
                                );
                              },
                            }),
                          ]}
                          style={{ marginBottom: 8 }}
                        >
                          <TimePicker
                            format={timeFormat}
                            minuteStep={1}
                            placeholder="Start time"
                            style={{ width: '100%' }}
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
                      <Col span={2}>
                        <Form.Item
                          name={[field.name, "endTime"]}
                          rules={[
                            { required: true, message: "Required!" },
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
                                  new Error("End must be after start!")
                                );
                              },
                            }),
                          ]}
                          style={{ marginBottom: 8 }}
                        >
                          <TimePicker
                            format={timeFormat}
                            minuteStep={1}
                            placeholder="End time"
                            style={{ width: '100%' }}
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

                      {/* Request To Field */}
                      <Col span={3}>
                        <Form.Item
                          name={[field.name, "approvedBy"]}
                          rules={[{ required: true, message: "Required!" }]}
                          style={{ marginBottom: 8 }}
                        >
                          <Select
                            placeholder="Select approver"
                            options={users[field.name]?.map((t: UserType) => ({
                              label: t.name,
                              value: t.id,
                            }))}
                            disabled={!users[field.name]?.length}
                            showSearch
                            optionFilterProp="label"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Remove Button */}
                      <Col span={1} className="flex items-center justify-end">
                        <Button 
                          type="text" 
                          danger 
                          icon={<MinusCircleOutlined />}
                          onClick={() => {
                            remove(field.name);
                          }}
                          className="hover:bg-red-50 transition-colors duration-200"
                          style={{ padding: '4px' }}
                        />
                      </Col>
                    </Row>

                    {/* Description Field - Only shown when hovered */}
                    {hoveredItem === field.name && (
                      <Row style={{ marginTop: 12 }}>
                        <Col span={24}>
                          <Form.Item
                            name={[field.name, "description"]}
                            rules={[
                              {
                                required: true,
                                message: "Description is required!",
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <div className="quill-container" style={{ overflow: 'hidden' }}>
                              <ReactQuill
                                theme="snow"
                                style={{ 
                                  height: 120, 
                                  borderRadius: '6px',
                                  maxWidth: '100%'
                                }}
                                modules={{
                                  toolbar: [
                                    ['bold', 'italic', 'underline'],
                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                    ['clean']
                                  ]
                                }}
                                placeholder="Enter your worklog description here..."
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
                            </div>
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </div>
                </Card>
              ))}
              
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    // Add a new entry with today's date pre-filled
                    add({ date: moment() });
                  }}
                  icon={<PlusOutlined />}
                  block
                  className="hover:border-blue-400 hover:text-blue-500 transition-colors duration-300"
                  style={{ 
                    marginBottom: 24, 
                    height: "42px",
                    borderRadius: "6px"
                  }}
                >
                  Add New Worklog Entry
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <div className="flex justify-end">
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large"
            className="transition-all duration-300 hover:scale-105"
            style={{ 
              borderRadius: "6px", 
              height: "42px", 
              padding: "0 24px",
              fontWeight: 500
            }}
          >
            Submit All Entries
          </Button>
        </div>
      </Form>
    </>
  );
};

export default OWorklogForm;
