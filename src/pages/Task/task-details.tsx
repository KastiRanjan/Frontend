import { useProjectTaskDetail } from "@/hooks/task/useProjectTaskDetail";
import { Card, Col, Divider, Form, Row, Tabs, Typography } from "antd";
import { useParams } from "react-router-dom";
import Worklog from "../Worklog";

const { Title, Text } = Typography;

const TaskDetails = () => {
    const { pid, tid } = useParams()
    const [form] = Form.useForm()
    const { data: task, isPending } = useProjectTaskDetail({ pid, tid })

    const onFinish = (values: any) => {
        console.log(values)
    }
    return (
        <Row gutter={8}>
            <Col span={16}>
                <Card title={task?.name} >
                    <Tabs defaultActiveKey="1" items={[
                        {
                            label: 'Task Details', key: '1',
                            children: <>sahbj</>
                        },
                        {
                            label: 'Sub Tasks', key: '2',
                        },
                        {
                            label: 'Worklogs', key: '3',
                            children: <Worklog />
                        },
                        {
                            label: 'History', key: '4',
                        },
                    ]}
                    />
                </Card>
            </Col>
            <Col span={8}>
                <Card>
                    <Row gutter={16} className='py-1'>
                        <Col flex="100px"><Text>Task Id</Text></Col>
                        <Col><Text>{task?.tcode}</Text></Col>
                    </Row>
                    <Row gutter={16} className='py-1'>
                        <Col flex="100px"><Text>Status</Text></Col>
                        <Col><Text >{task?.status}</Text></Col>
                    </Row>
                    <Row gutter={16} className='py-1'>
                        <Col flex="100px"><Text>Priority</Text></Col>
                        <Col><Text >{task?.priority}</Text></Col>
                    </Row>
                    <Row gutter={16} className='py-1'>
                        <Col flex="100px"><Text>Task Group</Text></Col>
                        <Col><Text >{task?.group?.name}</Text></Col>
                    </Row>
                    <Row gutter={16} className='py-1'>
                        <Col flex="100px"><Text>Task Type</Text></Col>
                        <Col><Text >{task?.taskType}</Text></Col>
                    </Row>
                    <Row gutter={16} className='py-1'>
                        <Col flex="100px"><Text>Due Date</Text></Col>
                        <Col><Text >{''}</Text></Col>
                    </Row>
                    <Divider />
                    <Row gutter={16} className='py-1'>
                        <Col span={24}><Text>Associated Project</Text></Col>
                        <Col><Text >{task?.project?.name}</Text></Col>
                    </Row>

                </Card>
            </Col>
        </Row>
    )
}

export default TaskDetails