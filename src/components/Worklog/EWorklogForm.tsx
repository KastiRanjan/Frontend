import { TaskTemplateType } from "@/types/taskTemplate";
import { UserType } from "@/types/user";
import { Button, Card, Col, Form, Row, Select, TimePicker, DatePicker, message } from "antd";
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import dayjs from "dayjs";
import { getFilteredApprovers } from '@/utils/approver';
import { useWorklogSingle } from "@/hooks/worklog/useWorklogSingle";
import { useEditingWorklog } from "@/hooks/worklog/useEditingWorklog";

const EWorklogForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useSession();
  const user = profile;

  const { data: worklog, isLoading } = useWorklogSingle({ id });
  const { mutate: editingWorklog, isPending: isEditPending } = useEditingWorklog();

  const [projects, setProjects] = useState<TaskTemplateType[]>([]);
  const [tasks, setTasks] = useState<TaskTemplateType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isIncomingRequest, setIsIncomingRequest] = useState(false);

  // Permission check for editing worklog date (object-based)
  const permissions = (user as any)?.role?.permission || [];
  const canEditWorklogDate = Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "worklogs" &&
        perm.path === "/worklogs/:id/date" &&
        perm.method?.toLowerCase() === "patch"
    );

  // Fetch tasks for a specific project
  const fetchProjectTasks = async (projectId: string) => {
    setLoadingTasks(true);
    
    try {
      // Import the service function directly
      const { fetchUserProjectTasks } = await import("@/service/task.service");
      
      // Get the current user's ID
      const userId = (user as any)?.id;
      
      if (!userId || !projectId) {
        console.error("Missing user ID or project ID");
        return;
      }
        const tasksData = await fetchUserProjectTasks({ 
        projectId, 
        userId 
      });
      
      let tasksList = tasksData || [];
      
      // Ensure the current worklog's task is always included in the list
      // even if it doesn't meet the status filter (since it's already in use)
      if (worklog?.task && !tasksList.find((t: TaskTemplateType) => t.id === worklog.task.id)) {
        tasksList = [worklog.task, ...tasksList];
      }
      
      // Set the tasks in state - they are already filtered by the backend based on project settings and status
      setTasks(tasksList);
      
    } catch (error) {
      console.error("Error fetching user project tasks:", error);
      // If fetch fails, at least keep the current task
      if (worklog?.task) {
        setTasks([worklog.task]);
      } else {
        setTasks([]);
      }
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (worklog && worklog.task?.project) {
      let startDayjs = worklog.startTime;
      let endDayjs = worklog.endTime;
      // Defensive: ensure dayjs object
      if (!dayjs.isDayjs?.(startDayjs)) startDayjs = dayjs(startDayjs);
      if (!dayjs.isDayjs?.(endDayjs)) endDayjs = dayjs(endDayjs);
      
      // Auto-set requestTo to the current value or first user if not set
      let requestToValue = worklog.requestTo;
      if (!requestToValue && worklog.task.project.users?.length) {
        requestToValue = worklog.task.project.users[0].id;
      }

      // Check if this is an incoming request (current user is the approver/requestTo)
      const currentUserId = (user as any)?.id?.toString();
      const isIncoming = worklog.requestTo?.toString() === currentUserId;
      setIsIncomingRequest(isIncoming);

      // Set up project dropdown
      setProjects([worklog.task.project]);
      
      // Set up users dropdown with proper filtering
      const currentUserRole = (user as any)?.role?.name;
      const filteredUsers = getFilteredApprovers(worklog.task.project.users || [], currentUserRole, currentUserId);
      
      // If incoming request, ensure the requestToUser is in the users list
      if (isIncoming && worklog.requestToUser) {
        // Check if requestToUser is already in filteredUsers
        const userExists = filteredUsers.some((u: UserType) => u.id?.toString() === worklog.requestToUser.id?.toString());
        if (!userExists) {
          filteredUsers.unshift(worklog.requestToUser);
        }
      }
      
      setUsers(filteredUsers);
      
      // Set the current task immediately so it displays while fetching other tasks
      if (worklog.task) {
        setTasks([worklog.task]);
      }
      
      // Set form values after setting up the dropdowns - use setTimeout to ensure state is updated
      setTimeout(() => {
        form.setFieldsValue({
          date: startDayjs,
          projectId: worklog.task.project.id,
          taskId: worklog.task.id,
          startTime: startDayjs,
          endTime: endDayjs,
          approvedBy: worklog.approvedBy,
          description: worklog.description,
          requestTo: requestToValue,
        });
      }, 0);
      
      // Fetch all available tasks for the project
      fetchProjectTasks(worklog.task.project.id);
    }
  }, [worklog]);

  // Removed handleProjectChange as it's no longer needed since project and task are fixed

  const handleFinish = (values: any) => {
    const startTime = dayjs(values.date)
      .set("hour", values.startTime.hour())
      .set("minute", values.startTime.minute())
      .toISOString();
    const endTime = dayjs(values.date)
      .set("hour", values.endTime.hour())
      .set("minute", values.endTime.minute())
      .toISOString();
    const updatedWorklog = {
      id,
      description: values.description,
      startTime,
      endTime,
      requestTo: values.requestTo, // Use requestTo for approver
      projectId: worklog.task.project.id, // Fixed
      taskId: values.taskId, // Allow user to change task within the project
      status: "requested",
    };
    editingWorklog(updatedWorklog, {
      onSuccess: () => {
        message.success("Worklog updated successfully");
        navigate("/worklogs-all");
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          "An error occurred while updating the worklog";
        message.error(errorMessage);
      },
    });
  };

  const timeFormat = "HH:mm";

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card title="Edit Worklog">
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Row gutter={16}>
          <Col span={3}>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Please select a date!" }]}
            >
              <DatePicker
                className="w-full py-2"
                disabled={!canEditWorklogDate}
                allowClear={false}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Project"
              name="projectId"
              rules={[{ required: true, message: "Please select a project!" }]}
            >
              <Select
                className="h-[40px]"
                options={projects.map((p) => ({
                  label: p.name,
                  value: p.id,
                }))}
                disabled // Always disabled as per requirement
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Task"
              name="taskId"
              rules={[{ required: true, message: "Please select a task!" }]}
            >
              <Select
                className="h-[40px]"
                options={tasks.map((t) => ({
                  label: t.name,
                  value: t.id,
                }))}
                loading={loadingTasks}
                disabled={loadingTasks || !tasks.length}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Request To"
              name="requestTo"
              rules={[
                { required: true, message: "Please select an approver!" },
              ]}
            >
              <Select
                className="h-[40px]"
                options={users.map((u) => ({
                  label: u.name,
                  value: u.id,
                }))}
                disabled={isIncomingRequest || !users.length}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Start Time"
              name="startTime"
              rules={[
                { required: true, message: "Please select start time!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const endTime = getFieldValue("endTime");
                    if (!value || !endTime || value.isBefore(endTime)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Start time cannot be after end time!")
                    );
                  },
                }),
              ]}
            >
              <TimePicker
                className="w-full py-2"
                format={timeFormat}
                minuteStep={1}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="End Time"
              name="endTime"
              rules={[
                { required: true, message: "Please select end time!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue("startTime");
                    if (!value || !startTime || value.isAfter(startTime)) {
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
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please input the description!" },
              ]}
            >
              <ReactQuill theme="snow" />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" gutter={16}>
          <Col>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={isEditPending}
            >
              Update Worklog
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default EWorklogForm;