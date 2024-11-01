import PageTitle from "@/components/PageTitle";
import ProjectTable from "@/components/project/ProjectTable";
import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const ProjectPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Page title  */}
      <PageTitle
        title="Projects"
        description="Add, search, and manage your projects all in one place."
        element={
          <div className="flex gap-4">
            <Button type="primary" onClick={() => navigate("/project/new")}>
              Add
            </Button>
          </div>
        }
      />

      {/* Project table  */}
      <ProjectTable />
    </>
  );
};

export default ProjectPage;
