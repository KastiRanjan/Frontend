import { TaskSuperForm, TaskSuperList } from "@/components/TaskSuper";
import MultiTaskSuperProjectAssignmentModal from "@/components/TaskSuper/MultiTaskSuperProjectAssignmentModal";
import { ProjectOutlined } from "@ant-design/icons";
import { Button, Modal, Typography } from "antd";
import { useState } from "react";

interface TaskSuperType {
  id: string;
  name: string;
  description: string;
  rank: number;
}

const { Title } = Typography;

const TaskSuperPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskSuper, setSelectedTaskSuper] = useState<TaskSuperType | undefined>(undefined);
  const [selectedTaskSupers, setSelectedTaskSupers] = useState<string[]>([]);
  const [isMultiAssignModalOpen, setIsMultiAssignModalOpen] = useState(false);

  const showModal = (taskSuper?: TaskSuperType) => {
    setSelectedTaskSuper(taskSuper);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedTaskSuper(undefined);
  };
  
  const handleAddMultipleToProject = (selectedIds: string[]) => {
    setSelectedTaskSupers(selectedIds);
    setIsMultiAssignModalOpen(true);
  };
  
  const handleMultiAssignSuccess = () => {
    setIsMultiAssignModalOpen(false);
    setSelectedTaskSupers([]);
  };

  return (
    <div>
      <TaskSuperList 
        showModal={showModal} 
        onAddMultipleToProject={handleAddMultipleToProject}
      />

      <Modal
        title={selectedTaskSuper ? "Edit Category" : "Add Category"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <TaskSuperForm
          editTaskSuperData={selectedTaskSuper}
          handleCancel={handleCancel}
        />
      </Modal>
      
      <MultiTaskSuperProjectAssignmentModal
        visible={isMultiAssignModalOpen}
        onCancel={() => setIsMultiAssignModalOpen(false)}
        selectedTaskSuperIds={selectedTaskSupers}
        onSuccess={handleMultiAssignSuccess}
      />
    </div>
  );
};

export default TaskSuperPage;