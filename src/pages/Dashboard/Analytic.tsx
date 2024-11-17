import { useProject } from "@/hooks/project/useProject";
import { useUser } from "@/hooks/user/useUser";
import { Card, Col, Row } from "antd";
import Title from "antd/es/typography/Title";
import Typography from "antd/es/typography/Typography";
import React from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const UserRoleChart: React.FC<{ data: any[] }> = ({ data }) => (
    <PieChart width={300} height={300}>
        <Pie
            data={data}
            cx={150}
            cy={150}
            innerRadius={60}
            outerRadius={80}
            // fill="#8884d8"
            dataKey="value"
        >
            {data.map((index) => (
                <Cell
                    key={`cell-${index}`}
                    fill={'red'}
                />
            ))}
        </Pie>
        <Tooltip />
    </PieChart>
);

const ProjectNatureChart: React.FC<{ data: any[] }> = ({ data }) => (
    <BarChart width={300} height={300} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
);


const Analytic = () => {

    const { data: users } = useUser({ status: "active", limit: 100, page: 1, keywords: "" })
    const { data: projects } = useProject({ status: "active" })

    return (<>
        <Row gutter={16} style={{ marginBottom: "20px" }}>
            <Col span={8}>
                <Card title="Total Users" bordered>
                    <Title level={4}>{users?.totalItems}</Title>
                    <Typography >{users?.results?.length / users?.totalItems * 100}%</Typography>

                </Card>
            </Col>
            <Col span={8}>
                <Card title="Active Users" bordered>
                    <Title level={4}>{users?.results?.length} </Title>
                    <Typography >{users?.results?.length / users?.totalItems * 100}%</Typography>
                </Card>
            </Col>
            <Col span={8}>
                <Card title="Inactive Users" bordered>
                    <Title level={4}>{users?.results?.length}</Title>
                    <Typography >{users?.results?.length / users?.totalItems * 100}%</Typography>

                </Card>
            </Col>
        </Row>
        <Row gutter={16}>
            <Col span={12}>
                <Card title="User Role Distribution" bordered>
                    <UserRoleChart data={[
                        { name: 'Super Admin', value: 4 },
                        { name: 'Audit Senior', value: 10 },
                        { name: 'Audit Junior', value: 2 },
                        { name: 'Project Manager', value: 2 }
                    ]} />
                </Card>
            </Col>
            <Col span={12}>
                <Card title="Project Nature Distribution" bordered>
                    <ProjectNatureChart data={[
                        { name: 'External Audit', value: 4 },
                        { name: 'Tax Compliance', value: 10 },
                        { name: 'Accounts Review', value: 2 },
                        { name: 'Legal Services', value: 2 },
                        { name: 'Financial Projection', value: 2 },
                        { name: 'Valuation', value: 2 },
                        { name: 'Internal Audit', value: 2 },
                        { name: 'Others', value: 2 }
                    ]} />
                </Card>
            </Col>
        </Row>
    </>)
}

export default Analytic