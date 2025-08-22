
import AllTaskTable from "@/components/Task/AllTaskTable";
import TaskForm from "@/components/Task/TaskForm";
import { Button, Modal, Tabs, Select } from "antd";
import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useProject } from "@/hooks/project/useProject";


const AllTask = () => {
  const [open, setOpen] = useState(false);
  const { profile } = useSession();
  // Extract userRole and userId from profile (profile is UserType)
  const userRole = (profile as any)?.role?.name?.toLowerCase?.() || "";
  const userId = (profile as any)?.id;
  const hideAddTask = userRole === "auditsenior" || userRole === "auditjunior";
  const { data: projects } = useProject({ status: "active" });

  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [editTaskData, setEditTaskData] = useState<any>(undefined);
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalTasks, setModalTasks] = useState<any[]>([]);

  // Update users/tasks when project changes (for add)
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects?.find((p: any) => p.id?.toString() === projectId);
    setModalUsers(project?.users || []);
    setModalTasks(project?.tasks || []);
  };



  // For edit, get users/tasks from the task's project
  const getProjectForTask = (task: any) => {
    if (!task?.project?.id) return undefined;
    return projects?.find((p: any) => p.id?.toString() === task.project.id?.toString());
  };

  const handleAdd = () => {
    setEditTaskData(undefined);
    setSelectedProjectId(undefined);
    setModalUsers([]);
    setModalTasks([]);
    setOpen(true);
  };

  const handleEdit = (task: any) => {
    setEditTaskData(task);
    const projectId = task?.project?.id?.toString();
    setSelectedProjectId(projectId);
    // Find the project and set users/tasks for the modal
    const project = projects?.find((p: any) => p.id?.toString() === projectId);
    setModalUsers(project?.users || []);
    setModalTasks(project?.tasks || []);
    setOpen(true);
  };

  return (
    <div>
      {!hideAddTask && <Button onClick={handleAdd}>Add Task</Button>}
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: `TODO`,
            key: "1",
            children: <AllTaskTable status={"open"} userId={userId} userRole={userRole} onEdit={handleEdit} />,
          },
          {
            label: `DOING`,
            key: "2",
            children: <AllTaskTable status={"in_progress"} userId={userId} userRole={userRole} onEdit={handleEdit} />,
          },
          {
            label: `COMPLETED`,
            key: "3",
            children: <AllTaskTable status={"done"} userId={userId} userRole={userRole} onEdit={handleEdit} />,
          },
        ]}
      />
      <Modal
        title={editTaskData ? "Edit Task" : "Add Task"}
        open={open}
        width={800}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        {/* Project selection only for Add, not Edit */}
        {!editTaskData && (
          <Select
            style={{ width: "100%", marginBottom: 16 }}
            placeholder="Select Project"
            value={selectedProjectId}
            onChange={handleProjectChange}
            options={projects?.map((p: any) => ({ value: p.id?.toString(), label: p.name }))}
          />
        )}
        <TaskForm
          users={modalUsers}
          tasks={modalTasks}
          editTaskData={editTaskData}
          handleCancel={() => setOpen(false)}
          projectId={selectedProjectId}
        />
      </Modal>
    </div>
  );
};

export default AllTask;
