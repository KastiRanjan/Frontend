import { useProject } from "@/hooks/project/useProject";
import { useCreateWorklog } from "@/hooks/worklog/useCreateWorklog";
import { TaskTemplateType } from "@/pages/TaskTemplate/type";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Row, Select, TimePicker } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const OWorklogForm = () => {
  const [tasks, setTasks] = useState<{ [fieldName: string]: TaskTemplateType[] }>({});
  const { data: projects } = useProject();
  const { mutate: createWorklog } = useCreateWorklog();
  const navigate = useNavigate();

  // Handle the form submission
  const handleFinish = (values: any) => {
    console.log(values.timeEntries);
    createWorklog(values.timeEntries, {
      onSuccess: () => {
        navigate("/worklogs-all");
      },
    });
  };

  // Handle project change for a specific form entry
  const handleProjectChange = (projectId: string, fieldName: any) => {
    const selectedProject = projects?.find((project: any) => project.id === projectId);
    if (selectedProject) {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [fieldName]: selectedProject.tasks || [],
      }));
    }
  };

  return (
    <>
      <Form onFinish={handleFinish} layout="vertical">
        <Row gutter={16} className="mb-2">
          <Col span={3}>Project</Col>
          <Col span={5}>Task</Col>
          <Col span={7}>Description</Col>
          <Col span={3}>StartTime</Col>
          <Col span={3}>EndTime</Col>
        </Row>

        <Form.List name="timeEntries">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row gutter={16} key={field.key}>
                  {/* Project Dropdown */}
                  <Col span={3}>
                    <Form.Item
                      name={[field.name, "projectId"]}
                      rules={[{ required: true, message: "Please select a project!" }]}
                    >
                      <Select
                        className="h-[48px]"
                        onChange={(projectId) => handleProjectChange(projectId, field.name )}
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
                      name={[field.name, "taskId"]}
                      rules={[{ required: true, message: "Please select a task!" }]}
                    >
                      <Select
                        className="h-[48px]"
                        options={tasks[field.name]?.map((t: TaskTemplateType) => ({
                          label: t.name,
                          value: t.id,
                        }))}
                        disabled={!tasks[field.name]?.length} // Disable task dropdown if no tasks available
                      />
                    </Form.Item>
                  </Col>


                  {/* Description Field */}
                  <Col span={7}>
                    <Form.Item
                      name={[field.name, "description"]}
                      rules={[
                        {
                          required: true,
                          message: "Please input the worklog message!",
                        },
                      ]}
                    >
                      <TextArea
                        placeholder="Worklog description"
                        className="ant-input"
                      />
                    </Form.Item>
                  </Col>

                  {/* Start Time Field */}
                  <Col span={3}>
                    <Form.Item
                      name={[field.name, "startTime"]}
                      rules={[
                        {
                          required: true,
                          message: "Please select start time!",
                        },
                      ]}
                    >
                      <TimePicker className="py-3" />
                    </Form.Item>
                  </Col>

                  {/* End Time Field */}
                  <Col span={3}>
                    <Form.Item
                      name={[field.name, "endTime"]}
                      rules={[
                        {
                          required: true,
                          message: "Please select end time!",
                        },
                      ]}
                    >
                      <TimePicker className="py-3" />
                    </Form.Item>
                  </Col>

                  {/* Remove Field */}
                  <Col span={1}>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Col>
                </Row>
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
