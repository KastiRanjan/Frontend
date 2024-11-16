import PageTitle from "@/components/PageTitle";
import ProjectForm from "@/components/project/ProjectForm";
import ProjectTable from "@/components/project/ProjectTable";
import { useSession } from "@/context/SessionContext";
import { checkPermissionForComponent } from "@/utils/permission";
import { Button, Card, Modal, Tabs } from "antd";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "./type";

const ProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { permissions } = useSession();
  const [open, setOpen] = React.useState(false);
  const [editTaskGroupData, setEditTaskGroupData] = React.useState<Project | undefined>(undefined);

  const showModal = useCallback((project?: Project) => {
    setEditTaskGroupData(project);
    setOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditTaskGroupData(undefined);
    setOpen(false);
  }, []);


  return (
    <>
      {/* Page title  */}
      <PageTitle
        title="Projects"
        description="Add, search, and manage your projects all in one place."
      />

      {/* Project table  */}
   
        <Tabs defaultActiveKey="1" items={[
          {
            label: `Active`,
            key: "1",
            children: <ProjectTable  showModal={showModal} status="active" />,
          },
          {
            label: `Suspended`,
            key: "2",
            children: <ProjectTable showModal={showModal} status="suspended" />,
          },
          {
            label: `Signed Off`,
            key: "3",
            children: <ProjectTable showModal={showModal} status="signed_off" />,
          },
        ]} />
   


      {open && (
        <Modal title="Add Task Template" footer={null} open={open} onCancel={handleCancel} width={700}>
          <div className="max-h-[70vh] overflow-y-scroll">
            <ProjectForm editProjectData={editTaskGroupData} handleCancel={handleCancel} />
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProjectPage;
