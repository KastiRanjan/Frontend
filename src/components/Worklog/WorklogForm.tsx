import { useProjectById } from "@/hooks/project/useProjectById";
import { useProjectTask } from "@/hooks/task/useTask";
import { useCreateWorklog } from "@/hooks/worklog/useCreateWorklog";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Row, Table } from "antd";
import { useParams } from "react-router-dom";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { TaskTemplateType } from "@/pages/TaskTemplate/type";

const WorklogForm = () => {
  const { id } = useParams();
  const { data: task, isPending: isPendingTask } = useProjectTask({ id });
  const { data: project, isPending: isPendingProject } = useProjectById({ id });
  const { mutate: createWorklog } = useCreateWorklog();

  const handleFinish = (values: any) => {
    console.log(values.timeEntries);
    // Implement the worklog submission logic here.
    createWorklog(values.timeEntries);
  };

  return (
    <>
      <Form onFinish={handleFinish} layout="vertical">
        <Row gutter={16} className="mb-2">
          <Col span={4}>Task</Col>
          <Col span={4}>Approver</Col>
          <Col span={7}>Description</Col>
          <Col span={4}>StartTime</Col>
          <Col span={3}>EndTime</Col>
        </Row>

        <Form.List name="timeEntries">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row gutter={16} key={field.key}>
                  <Col span={4} >
                    <FormSelectWrapper
                      id="Task"
                      name={[field.name, "taskId"]}
                      options={task?.map((task: TaskTemplateType) => ({
                        label: task.name,
                        value: task.id,
                      }))}
                    />
                  </Col>
                  <Col span={4}>
                    <FormSelectWrapper
                      id="User"
                      name={[field.name, "userId"]}
                      options={project?.users?.map((user: any) => ({
                        label: user.name,
                        value: user.id,
                      }))}
                    />
                  </Col>
                  <Col span={7}>
                    <FormInputWrapper
                      id="Description"
                      name={[field.name, "description"]}
                      rules={[
                        {
                          required: true,
                          message: "Please input the worklog message!",
                        },
                      ]}
                    />
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name={[field.name, "startTime"]}
                      rules={[
                        {
                          required: true,
                          message: "Please select start time!",
                        },
                      ]}
                    >
                      <DatePicker showTime />
                    </Form.Item>
                  </Col>
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
                      <DatePicker showTime />
                    </Form.Item>
                  </Col>
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

export default WorklogForm;
