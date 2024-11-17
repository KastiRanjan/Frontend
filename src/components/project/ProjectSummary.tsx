import { Card, Col, Row, Tooltip } from "antd";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis } from "recharts";


const ProjectSummary = () => {
    return (
        <Row gutter={[16, 16]}>
            <Col span={12}>
                <Card title="Task By Due Date">
                    <BarChart width={300} height={200} data={[{ name: 'Completed', value: 4 }, { name: 'In Progress', value: 2 }, { name: 'Not Started', value: 1 }]}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="value" fill="#8884d8" />
                        <Tooltip />
                    </BarChart>
                </Card>
            </Col>
            <Col span={12}>
                <Card title="Milestone Due Date">
                    <PieChart width={300} height={200}>
                        <Pie
                            data={[{ name: 'Completed', value: 4 }, { name: 'In Progress', value: 2 }, { name: 'Not Started', value: 1 }]}
                            cx={50}
                            cy={50}
                            outerRadius={40}
                            fill="#8884d8"
                            label
                        />
                        <Tooltip />
                    </PieChart>

                </Card>
            </Col>
            <Col span={12}>
                <Card title="Task Completed">
                    jasjds
                </Card>
            </Col>
            <Col span={12}>
                <Card title="Milestone Completed">
                    jasjds
                </Card>
            </Col>
            <Col span={12}>
                <Card title="Task By Status">
                    jasjds
                </Card>
            </Col>
            <Col span={12}>
                <Card title="Milestone Status">
                    jasjds
                </Card>
            </Col>
        </Row>
    );
};
export default ProjectSummary;