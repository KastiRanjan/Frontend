// src/ProjectDetail.tsx
import { ProjectType } from "@/types/project";
import { Table } from "antd";

interface ProjectDetailProps {
  project: ProjectType;
  id?: number;
}

const ProjectUserTable = ({ project }: ProjectDetailProps) => {
  const { users } = project;

  const userColumns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <>
      <Table dataSource={users} columns={userColumns} rowKey="username" />
    </>
  );
};

export default ProjectUserTable;
