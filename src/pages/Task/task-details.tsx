import FormSelectWrapper from "@/components/FormSelectWrapper"
import { useProjectTaskDetail } from "@/hooks/task/useProjectTaskDetail"
import { UserType } from "@/hooks/user/type"
import { useUser } from "@/hooks/user/useUser"
import { Button, Col, Form, Row, Select } from "antd"
import TextArea from "antd/es/input/TextArea"
import Title from "antd/es/typography/Title"
import { useParams } from "react-router-dom"



const TaskDetails = () => {
    const { id, tid } = useParams()
    const [form] = Form.useForm()
    const { data: users } = useUser();
    const { data: selectedTask } = useProjectTaskDetail({ pid: id, tid })
    console.log(selectedTask)

    const onFinish = (values: any) => {
        console.log(values)
    }

    return (
        <div style={{ padding: "16px" }}>
            <p style={{ fontWeight: "bold", marginBottom: "8px" }}>PENG 326</p>
            <Title level={3} style={{ marginBottom: "16px" }}>
                {selectedTask?.name}
            </Title>
            <Form form={form} onFinish={onFinish}>
                <Row>
                    <Col span={4}>
                        <strong>Status: </strong>{" "}
                        <Form.Item name="status" initialValue={selectedTask?.status}>
                            <Select onChange={() => form.submit()} value={selectedTask?.status}>
                                <Select.Option value="open">Open</Select.Option>
                                <Select.Option value="in_progress">In Progress</Select.Option>
                                <Select.Option value="done">Done</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            <div className="py-3">
                <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                    Description
                </p>
                <Form form={form} onFinish={onFinish}>
                    <Form.Item id="asignees" name="description">
                        <TextArea defaultValue={selectedTask?.description} rows={6} />
                    </Form.Item>
                    <Button htmlType="submit" type="primary">
                        Save
                    </Button>
                </Form>
            </div>
            <p style={{ fontWeight: "bold", marginBottom: "8px" }}>Detail</p>
            <Row gutter={16}>
                <Col span={6}>
                    <strong>Assignee: </strong>
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
            <Row gutter={16} className="mb-4">
                <Col span={2}>
                    <strong>Reporter:</strong>
                </Col>
                <Col>
                    <ul>
                        <li>Ranjan</li>
                    </ul>
                </Col>
            </Row>
            <Row gutter={16} className="mb-4">
                <Col span={2}>
                    <strong>Due Date:</strong>
                </Col>
                <Col>{selectedTask?.dueDate}</Col>
            </Row>
        </div>
    )
}

export default TaskDetails