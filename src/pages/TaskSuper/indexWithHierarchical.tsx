import { TaskSuperForm } from "@/components/TaskSuper";
import TaskSuperListWithHierarchical from "@/components/TaskSuper/TaskSuperListWithHierarchical";
import MultiTaskSuperProjectAssignmentModal from "@/components/TaskSuper/MultiTaskSuperProjectAssignmentModal";
import HierarchicalAddModal from "@/components/TaskSuper/HierarchicalAddModal";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, message } from "antd";
import { useState } from "react";
import { addTaskSuperToProject } from "@/service/taskSuper.service";

interface TaskSuperType {
  id: string;
  name: string;
  description: string;
  rank: number;
}

const TaskSuperPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskSuper, setSelectedTaskSuper] = useState<TaskSuperType | undefined>(undefined);
  const [selectedTaskSupers, setSelectedTaskSupers] = useState<string[]>([]);
  const [isMultiAssignModalOpen, setIsMultiAssignModalOpen] = useState(false);
  
  // New state for hierarchical modal
  const [isHierarchicalModalOpen, setIsHierarchicalModalOpen] = useState(false);
  const [hierarchicalInitialTaskSuperId, setHierarchicalInitialTaskSuperId] = useState<string | undefined>(undefined);

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
  
  // New handler for opening hierarchical modal
  const handleOpenHierarchicalModal = (taskSuperId?: string) => {
    setHierarchicalInitialTaskSuperId(taskSuperId);
    setIsHierarchicalModalOpen(true);
  };
  
  // Handle add to project from hierarchical modal
  const handleAddToProjectFromHierarchical = async (entities: any) => {
    try {
      console.log('Adding to project from hierarchical modal:', entities);
      
      // Process the selected entities and create a payload for the backend
      // This is a simplified version - you'll need to adapt this to your API
      const projectId = prompt('Enter Project ID:'); // Replace with proper project selection
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      // Example payload structure - adapt to your backend API
      const payload = {
        projectId,
        taskSupers: entities.taskSupers.map((ts: any) => ({
          id: ts.id,
          isNew: ts.isNew,
          name: ts.name,
          description: ts.description,
          rank: ts.rank,
          groups: entities.taskGroups
            .filter((tg: any) => tg.taskSuperId === ts.id)
            .map((tg: any) => ({
              id: tg.id,
              isNew: tg.isNew,
              name: tg.name,
              description: tg.description,
              rank: tg.rank,
              templates: entities.taskTemplates
                .filter((tt: any) => tt.groupId === tg.id)
                .map((tt: any) => ({
                  id: tt.id,
                  isNew: tt.isNew,
                  name: tt.name,
                  description: tt.description,
                  rank: tt.rank,
                  budgetedHours: tt.budgetedHours,
                  subtasks: entities.subtaskTemplates
                    .filter((st: any) => st.parentTaskId === tt.id)
                    .map((st: any) => ({
                      id: st.id,
                      isNew: st.isNew,
                      name: st.name,
                      description: st.description,
                      rank: st.rank,
                      budgetedHours: st.budgetedHours
                    }))
                }))
            }))
        }))
      };
      
      // Call the backend API
      await addTaskSuperToProject(payload);
      
      message.success('Successfully added to project');
    } catch (error) {
      console.error('Error adding to project:', error);
      message.error('Failed to add to project');
      throw error;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleOpenHierarchicalModal()}
          style={{ marginRight: '8px' }}
        >
          Add to Project
        </Button>
      </div>
      
      <TaskSuperListWithHierarchical 
        showModal={showModal} 
        onAddMultipleToProject={handleAddMultipleToProject}
        onAddToProjectHierarchical={handleOpenHierarchicalModal}
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
      
      {/* Hierarchical Add Modal */}
      <HierarchicalAddModal
        visible={isHierarchicalModalOpen}
        onCancel={() => setIsHierarchicalModalOpen(false)}
        onAddToProject={handleAddToProjectFromHierarchical}
        initialTaskSuperId={hierarchicalInitialTaskSuperId}
      />
    </div>
  );
};

export default TaskSuperPage;