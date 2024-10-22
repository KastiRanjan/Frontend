import React, { useState } from "react";
import {
  Layout, Typography, Button
} from "antd";
import ProjectTable from "@/components/project/ProjectTable";
import ProjectForm from "@/components/project/ProjectForm";
import { Project } from "./type";

const { Header} = Layout;
const { Title } = Typography;



// Main Component
const ProjectPage: React.FC = () => {
  const [showProjectForm, setShowProjectFrom] = useState<boolean>(false);
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const [editProjectData, setEditProjectData] = useState<Project>();
  const showEditModal = (record: Project) => {
    console.log("Editing record:", record);
    setShowProjectFrom(true);
    setEditProjectData(record);
    setIsFormEdit(true);
  };
  const handleCloseProjectForm = () => {
    setShowProjectFrom(false);
    setIsFormEdit(false);
  };

  return (
    <>
      <Header
        style={{
          backgroundColor: "#1890ff",
          borderRadius: "8px",
          color: "#fff",
        }}
      >
        <Title level={3} style={{ color: "#fff", margin: 0, padding: "15px" }}>
          Projects Overview
        </Title>
      </Header>
   
          <Button type="primary"   onClick={() => setShowProjectFrom(true)}>
            + Add Project
          </Button>
      

      <ProjectTable showEditModal={showEditModal} />

      <ProjectForm
        visible={showProjectForm}
        onCancel={handleCloseProjectForm}
        editProjectData={editProjectData}
        isformEdit={isFormEdit}
      />
    </>
  );
};

export default ProjectPage;
