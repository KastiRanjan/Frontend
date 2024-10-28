import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout, Typography, Spin, Row, Col, Card, List } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import PageTitle from "@/components/PageTitle";

const { Title } = Typography;

const UserRoleChart: React.FC<{ data: any[] }> = ({ data }) => (
  <PieChart width={300} height={300}>
    <Pie
      data={data}
      cx={150}
      cy={150}
      innerRadius={60}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {data.map((index) => (
        <Cell
          key={`cell-${index}`}
          fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
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

const Dashboard: React.FC = () => {
  const [roleData, setRoleData] = useState<any[]>([]);
  const [natureData, setNatureData] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [inactiveUsers, setInactiveUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersResponse = await axios.get("http://localhost:7777/users");
        const projectsResponse = await axios.get(
          "http://localhost:7777/projects"
        );

        // Process user data for roles
        const roleCounts: { [key: string]: number } = {};
        usersResponse.data.results.forEach((user: any) => {
          const roleName = user.role.name;
          roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
        });
        setRoleData(
          Object.entries(roleCounts).map(([name, value]) => ({ name, value }))
        );

        // Set user statistics
        setTotalUsers(usersResponse.data.results.length);
        setActiveUsers(
          usersResponse.data.results.filter(
            (user: any) => user.status === "active"
          ).length
        );
        setInactiveUsers(
          usersResponse.data.results.filter(
            (user: any) => user.status === "inactive"
          ).length
        );

        // Process project data for nature
        const natureCounts: { [key: string]: number } = {};
        projectsResponse.data.forEach((project: any) => {
          const nature = project.natureOfWork; // Updated property name
          natureCounts[nature] = (natureCounts[nature] || 0) + 1;
        });
        setNatureData(
          Object.entries(natureCounts).map(([name, value]) => ({ name, value }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Row gutter={16}>
      <Col span={17}>
        <PageTitle title="Welcome to Artha Task" />
        {loading ? (
          <Spin size="large" />
        ) : (
          <>
            <Row gutter={16} style={{ marginBottom: "20px" }}>
              <Col span={8}>
                <Card title="Total Users" bordered>
                  <Title level={4}>{totalUsers}</Title>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Active Users" bordered>
                  <Title level={4}>{activeUsers}</Title>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Inactive Users" bordered>
                  <Title level={4}>{inactiveUsers}</Title>
                </Card>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="User Role Distribution" bordered>
                  <UserRoleChart data={roleData} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Project Nature Distribution" bordered>
                  <ProjectNatureChart data={natureData} />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Col>
      <Col span={7}>
        <PageTitle title="Notifications" />
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Col>
    </Row>
  );
};

export default Dashboard;

const notifications = [
  {
    title: "Project 1",
    description: "Project 1 has been created",
  },
  {
    title: "Project 2",
    description: "Project 2 has been created",
  },
  {
    title: "Project 3",
    description: "Project 3 has been created",
  },
  {
    title: "Project 1",
    description: "Project 1 has been created",
  },
  {
    title: "Project 2",
    description: "Project 2 has been created",
  },
  {
    title: "Project 3",
    description: "Project 3 has been created",
  },
];
