import { useWorklogById } from "@/hooks/worklog/useWorklogById"; // You'll need to create this hook
import { useEditWorklog } from "@/hooks/worklog/useEditWorklog";
import { useProject } from "@/hooks/project/useProject";
import { TaskTemplateType } from "@/types/taskTemplate";
import { UserType } from "@/types/user";
import { Button, Card, Col, Form, Row, Select, TimePicker, DatePicker, message } from "antd";
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import moment from "moment";

const EWorklogForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // Get the worklog ID from URL
  const { profile } = useSession();
  const user = profile;
  

  // Hooks for data fetching and mutations
  const { data: worklog, isLoading } = useWorklogById({ id: id});
  console.log(worklog);
  const { data: projects } = useProject({ status: "active" });
  const { mutate: editWorklog, isPending: isEditPending } = useEditWorklog();

  // State for tasks and users
  const [tasks, setTasks] = useState<TaskTemplateType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  // Check if user is manager or admin
  const isManagerOrAdmin =
    user?.role?.name === "manager" ||
    user?.role === "admin" ||
    user?.role?.name === "superuser";

  // Set form initial values when worklog data is loaded
  useEffect(() => {
    if (worklog) {
      form.setFieldsValue({
        date: moment(worklog.date),
        projectId: worklog.projectId,
        taskId: worklog.taskId,
        startTime: moment(worklog.startTime),
        endTime: moment(worklog.endTime),
        approvedBy: worklog.approvedBy,
        description: worklog.description,
      });

      // Load tasks and users for the selected project
      const selectedProject = projects?.find((p) => p.id === worklog.projectId);
      if (selectedProject) {
        setTasks(selectedProject.tasks || []);
        setUsers(selectedProject.users || []);
      }
    }
  }, [worklog, projects, form]);

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects?.find((project) => project.id === projectId);
    if (selectedProject) {
      setTasks(selectedProject.tasks || []);
      setUsers(selectedProject.users || []);
      form.setFieldsValue({ taskId: undefined }); // Reset task when project changes
    }
  };

  // Handle form submission
  const handleFinish = (values: any) => {
    const updatedWorklog = {
      id,
      ...values,
      status: "requested", // Preserve current status or modify based on your needs
    };

    editWorklog(updatedWorklog, {
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
          {/* Date Field */}
          <Col span={6}>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Please select a date!" }]}
            >
              <DatePicker
                className="w-full py-2"
                disabled={!isManagerOrAdmin}
              />
            </Form.Item>
          </Col>

          {/* Project Dropdown */}
          <Col span={6}>
            <Form.Item
              label="Project"
              name="projectId"
              rules={[{ required: true, message: "Please select a project!" }]}
            >
              <Select
                className="h-[40px]"
                onChange={handleProjectChange}
                options={projects?.map((p: TaskTemplateType) => ({
                  label: p.name,
                  value: p.id,
                }))}
              />
            </Form.Item>
          </Col>

          {/* Task Dropdown */}
          <Col span={6}>
            <Form.Item
              label="Task"
              name="taskId"
              rules={[{ required: true, message: "Please select a task!" }]}
            >
              <Select
                className="h-[40px]"
                options={tasks.map((t: TaskTemplateType) => ({
                  label: t.name,
                  value: t.id,
                }))}
                disabled={!tasks.length}
              />
            </Form.Item>
          </Col>

          {/* Request To */}
          <Col span={6}>
            <Form.Item
              label="Request To"
              name="approvedBy"
              rules={[
                { required: true, message: "Please select an approver!" },
              ]}
            >
              <Select
                className="h-[40px]"
                options={users.map((u: UserType) => ({
                  label: u.name,
                  value: u.id,
                }))}
                disabled={!users.length}
              />
            </Form.Item>
          </Col>

          {/* Start Time */}
          <Col span={6}>
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
                onSelect={(time) => {
                  form.setFieldsValue({ startTime: time });
                  form.validateFields(["startTime"]);
                }}
                onChange={(time) => {
                  if (time) {
                    form.setFieldsValue({ startTime: time });
                  }
                }}
              />
            </Form.Item>
          </Col>

          {/* End Time */}
          <Col span={6}>
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
                onSelect={(time) => {
                  form.setFieldsValue({ endTime: time });
                  form.validateFields(["endTime"]);
                }}
                onChange={(time) => {
                  if (time) {
                    form.setFieldsValue({ endTime: time });
                  }
                }}
              />
            </Form.Item>
          </Col>

          {/* Description */}
          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please input the description!" },
              ]}
            >
              <ReactQuill
                theme="snow"
                onChange={(value) => {
                  form.setFieldValue("description", value);
                }}
                value={form.getFieldValue("description")}
              />
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