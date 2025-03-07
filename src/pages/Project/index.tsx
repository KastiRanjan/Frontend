import ProjectForm from "@/components/project/ProjectForm";
import ProjectTable from "@/components/project/ProjectTable";
import { ProjectType } from "@/types/project";
import { Modal, Tabs } from "antd";
import React, { useCallback } from "react";

const ProjectPage: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [editTaskGroupData, setEditTaskGroupData] = React.useState<
    ProjectType | undefined
  >(undefined);

  const showModal = useCallback((project?: ProjectType) => {
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
      {/* <PageTitle
        title="Projects"
        description="Add, search, and manage your projects all in one place."
      /> */}

      {/* Project table  */}
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: `Active`,
            key: "1",
            children: <ProjectTable showModal={showModal} status="active" />,
          },
          {
            label: `Suspended`,
            key: "2",
            children: <ProjectTable showModal={showModal} status="suspended" />,
          },
          {
            label: `Signed Off`,
            key: "3",
            children: (
              <ProjectTable showModal={showModal} status="signed_off" />
            ),
          },
          {
            label: `Archived`,
            key: "4",
            children: (
              <ProjectTable showModal={showModal} status="archived" />
            ),
          },
        ]}
      />

      {open && (
        <Modal
          title={editTaskGroupData ? "Edit Project" : "Create New Project"}
          footer={null}
          open={open}
          onCancel={handleCancel}
          width={700}
        >
          <div className="max-h-[70vh] overflow-y-scroll">
            <ProjectForm
              editProjectData={editTaskGroupData}
              handleCancel={handleCancel}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProjectPage;