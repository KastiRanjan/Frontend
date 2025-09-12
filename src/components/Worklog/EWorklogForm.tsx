import { TaskTemplateType } from "@/types/taskTemplate";
import { UserType } from "@/types/user";
import { Button, Card, Col, Form, Row, Select, TimePicker, DatePicker, message } from "antd";
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import moment from "moment";
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

  const isManagerOrAdmin =
    (user as any)?.role?.name === "manager" ||
    (user as any)?.role?.name === "admin" ||
    (user as any)?.role?.name === "superuser";

  useEffect(() => {
    if (worklog) {
      const startMoment = moment(worklog.startTime);
      const endMoment = moment(worklog.endTime);

      form.setFieldsValue({
        date: startMoment,
        projectId: worklog.task?.project?.id,
        taskId: worklog.task?.id,
        startTime: startMoment,
        endTime: endMoment,
        approvedBy: worklog.approvedBy,
        description: worklog.description,
      });

      if (worklog.task?.project) {
        setProjects([worklog.task.project]);
        setTasks([worklog.task]);
        setUsers(worklog.task.project.users || []);
      }
    }
  }, [worklog, form]);

  // Removed handleProjectChange as it's no longer needed since project and task are fixed

  const handleFinish = (values: any) => {
    const startTime = moment(values.date)
      .set({
        hour: values.startTime.hour(),
        minute: values.startTime.minute(),
      })
      .toISOString();
    
    const endTime = moment(values.date)
      .set({
        hour: values.endTime.hour(),
        minute: values.endTime.minute(),
      })
      .toISOString();

    const updatedWorklog = {
      id,
      description: values.description,
      startTime,
      endTime,
      approvedBy: values.approvedBy, // Only this can be changed
      projectId: worklog.task.project.id, // Fixed
      taskId: worklog.task.id, // Fixed
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
                disabled={!isManagerOrAdmin}
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
                disabled // Always disabled as per requirement
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Request To"
              name="approvedBy"
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
                disabled={!users.length}
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