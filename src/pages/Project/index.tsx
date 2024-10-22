import PageTitle from "@/components/PageTitle";
import ProjectForm from "@/components/project/ProjectForm";
import ProjectTable from "@/components/project/ProjectTable";
import React, { useState } from "react";
import { Project } from "./type";

const ProjectPage: React.FC = () => {
  const [showProjectForm, setShowProjectFrom] = useState<boolean>(false);
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const [editProjectData, setEditProjectData] = useState<Project>();
  const showEditModal = (record: Project) => {
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
      {/* Page title  */}
      <PageTitle title="Projects" />

      {/* Project table  */}
      <ProjectTable showEditModal={showEditModal} />

      {/* Project form  */}
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
