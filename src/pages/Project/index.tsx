import PageTitle from "@/components/PageTitle";
import ProjectTable from "@/components/project/ProjectTable";
import { useSession } from "@/context/SessionContext";
import { checkPermissionForComponent } from "@/utils/permission";
import { Button, Tabs } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const ProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { permissions } = useSession();


  return (
    <>
      {/* Page title  */}
      <PageTitle
        title="Projects"
        description="Add, search, and manage your projects all in one place."
        element={
          <>
            {checkPermissionForComponent(permissions, "project") && <div className="flex gap-4">
              <Button type="primary" onClick={() => navigate("/project/new")}>
                Create Project
              </Button>
            </div>}
          </>
        }
      />

      {/* Project table  */}
      <Tabs defaultActiveKey="1" items={[
        {
          label: `Active`,
          key: "1",
          children: <ProjectTable />,
        },
        {
          label: `Suspended`,
          key: "2",
          children: <></>,
        },
        {
          label: `Signed Off`,
          key: "3",
          children: <></>,
        },
      ]} />
    </>
  );
};

export default ProjectPage;
