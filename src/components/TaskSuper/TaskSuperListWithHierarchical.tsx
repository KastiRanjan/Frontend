import { useFetchTaskSupers } from "@/hooks/taskSuper/useFetchTaskSupers";
import { useDeleteTaskSuper } from "@/hooks/taskSuper/useDeleteTaskSuper";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, ProjectOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { Card, Checkbox, Col, Modal, Row, Button, Spin, Empty, Tooltip, message } from "antd";
import { useState } from "react";
import { TaskSuperType } from "@/types/taskSuper";
import { useNavigate } from "react-router-dom";
import { useFetchTaskGroups } from "@/hooks/taskGroup/useFetchTaskGroups";
import ProjectAssignmentModal from "../TaskGroup/components/ProjectAssignmentModal";

interface TaskSuperListProps {
  showModal: (taskSuper?: TaskSuperType) => void;
  onAddMultipleToProject?: (selectedTaskSupers: string[]) => void;
  onAddToProjectHierarchical?: (taskSuperId?: string) => void;
}

// Define a type for task group
interface TaskGroupType {
  id: string;
  name: string;
  description?: string;
  taskSuperId: string;
  rank?: number;
  tasktemplate?: any[];
  taskTemplates?: any[];
}

const TaskSuperList = ({ showModal, onAddMultipleToProject, onAddToProjectHierarchical }: TaskSuperListProps) => {
  const [modal, contextHolder] = Modal.useModal();
  const [checkedRows, setCheckedRows] = useState<string[]>([]);
  const [isProjectAssignmentModalVisible, setIsProjectAssignmentModalVisible] = useState(false);
  const [selectedTaskSuperId, setSelectedTaskSuperId] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<React.Key[]>([]);
  const [selectedTemplateRows, setSelectedTemplateRows] = useState<Record<string, React.Key[]>>({});
  const [selectedSubtaskRows, setSelectedSubtaskRows] = useState<Record<string, React.Key[]>>({});
  
  const navigate = useNavigate();
  
  const { data: taskSupers, isPending } = useFetchTaskSupers();
  const { data: taskGroups, isPending: isLoadingTaskGroups } = useFetchTaskGroups();
  const { mutate: deleteTaskSuper } = useDeleteTaskSuper();
  
  const handleCheckboxChange = (id: string) => {
    if (checkedRows.includes(id)) {
      setCheckedRows(checkedRows.filter((rowId) => rowId !== id));
    } else {
      setCheckedRows([...checkedRows, id]);
    }
  };
  
  const handleAddMultipleToProject = () => {
    if (checkedRows.length === 0) {
      message.warning('Please select at least one category to add to a project');
      return;
    }
    
    if (onAddMultipleToProject) {
      onAddMultipleToProject(checkedRows);
    } else {
      message.error('Add to Project functionality is not available');
    }
  };
  
  // New function for hierarchical add
  const handleAddToProjectHierarchical = (taskSuperId?: string) => {
    if (onAddToProjectHierarchical) {
      onAddToProjectHierarchical(taskSuperId);
    } else {
      message.error('Hierarchical Add to Project functionality is not available');
    }
  };
  
  // Handle multiple selection hierarchical add
  const handleAddMultipleToProjectHierarchical = () => {
    if (checkedRows.length === 0) {
      message.warning('Please select at least one category to add to a project');
      return;
    }
    
    // For simplicity, we'll just use the first selected item to initialize the hierarchical modal
    const firstSelectedTaskSuperId = checkedRows[0];
    handleAddToProjectHierarchical(firstSelectedTaskSuperId);
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Are you sure you want to delete this category?',
      content: 'This action cannot be undone and will also affect all associated task groups and templates.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteTaskSuper({ id });
      },
    });
  };

  const handleCardClick = (taskSuper: TaskSuperType) => {
    // Navigate to the TaskSuperDetails page using /task-template to match the route
    navigate(`/task-template/category/${taskSuper.id}`);
  };
  
  const handleAddToProject = (taskSuper: TaskSuperType) => {
    // Get all groups for this taskSuper
    const groupsForTaskSuper = taskGroups?.filter((group: TaskGroupType) => group.taskSuperId === taskSuper.id) || [];
    
    if (groupsForTaskSuper.length === 0) {
      message.warning('This category has no task groups. Add some task groups first.');
      return;
    }
    
    // Set the taskSuperId
    setSelectedTaskSuperId(taskSuper.id);
    
    // Pre-select all groups for this taskSuper
    setSelectedGroups(groupsForTaskSuper.map((group: TaskGroupType) => group.id));
    
    // Initialize empty selections for templates and subtasks
    setSelectedTemplateRows({});
    setSelectedSubtaskRows({});
    
    // Show the project assignment modal
    setIsProjectAssignmentModalVisible(true);
  };
  
  const handleProjectAssignmentModalCancel = () => {
    setIsProjectAssignmentModalVisible(false);
    setSelectedTaskSuperId(null);
    setSelectedGroups([]);
    setSelectedTemplateRows({});
    setSelectedSubtaskRows({});
  };
  
  const handleProjectAssignmentSuccess = () => {
    message.success('Tasks added to project successfully');
    setIsProjectAssignmentModalVisible(false);
    setSelectedTaskSuperId(null);
    setSelectedGroups([]);
    setSelectedTemplateRows({});
    setSelectedSubtaskRows({});
  };

  if (isPending || isLoadingTaskGroups) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!taskSupers || taskSupers.length === 0) {
    return (
      <Empty 
        description="No task categories found" 
        className="my-8"
      >
        <Button type="primary" onClick={() => showModal()}>
          Create New Category
        </Button>
      </Empty>
    );
  }

  return (
    <>
      {contextHolder}
      
      {/* Action buttons for selected items */}
      {checkedRows.length > 0 && (
        <div className="mb-4 p-2 bg-gray-50 rounded flex items-center justify-between">
          <div>
            <Button 
              type="primary"
              icon={<ProjectOutlined />}
              onClick={handleAddMultipleToProject}
              style={{ marginRight: '8px' }}
            >
              Add Selected to Project
            </Button>
            
            {onAddToProjectHierarchical && (
              <Button 
                type="primary"
                icon={<AppstoreAddOutlined />}
                onClick={handleAddMultipleToProjectHierarchical}
              >
                Add Selected (Hierarchical)
              </Button>
            )}
          </div>
        </div>
      )}
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card
            className="h-full flex justify-center items-center cursor-pointer"
            bordered={false}
            style={{ border: "2px dotted #ccc", minHeight: "200px" }}
            onClick={() => showModal()}
          >
            <div className="text-center">
              <PlusCircleOutlined key='plus' style={{ fontSize: '24px', marginBottom: '8px' }} />
              <div>Add Category</div>
            </div>
          </Card>
        </Col>
        {taskSupers?.map((taskSuper: TaskSuperType) => (
          <Col span={6} key={taskSuper.id}>
            <Card
              loading={isPending}
              title={taskSuper.name}
              extra={<Checkbox checked={checkedRows.includes(taskSuper.id)} onClick={(e) => e.stopPropagation()} onChange={() => handleCheckboxChange(taskSuper.id)} />}
              actions={[
                <Tooltip title="Edit category" key="edit-tooltip">
                  <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); showModal(taskSuper); }} />
                </Tooltip>,
                <Tooltip title="Delete category" key="delete-tooltip">
                  <DeleteOutlined key="delete" onClick={(e) => { e.stopPropagation(); handleDelete(taskSuper.id); }} />
                </Tooltip>,
                <Tooltip title="Add to project" key="project-tooltip">
                  <ProjectOutlined key="project" onClick={(e) => { e.stopPropagation(); handleAddToProject(taskSuper); }} />
                </Tooltip>,
                onAddToProjectHierarchical && (
                  <Tooltip title="Add to project (Hierarchical)" key="hierarchical-tooltip">
                    <AppstoreAddOutlined key="hierarchical" onClick={(e) => { 
                      e.stopPropagation(); 
                      handleAddToProjectHierarchical(taskSuper.id); 
                    }} />
                  </Tooltip>
                )
              ].filter(Boolean)}
              onClick={() => handleCardClick(taskSuper)}
              className={`cursor-pointer hover:shadow-md transition-shadow ${checkedRows.includes(taskSuper.id) ? 'border-blue-500 border-2' : ''}`}
              style={{ minHeight: "200px" }}
            >
              <Card.Meta
                description={
                  <>
                    <p className="mb-2">{taskSuper.description}</p>
                    <p className="mb-1"><strong>Rank:</strong> {taskSuper.rank}</p>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      <ProjectAssignmentModal
        visible={isProjectAssignmentModalVisible}
        onCancel={handleProjectAssignmentModalCancel}
        taskSuperId={selectedTaskSuperId || ''}
        selectedGroups={selectedGroups}
        selectedTemplateRows={selectedTemplateRows}
        selectedSubtaskRows={selectedSubtaskRows}
        taskGroups={taskGroups || []}
        onSuccess={handleProjectAssignmentSuccess}
      />
    </>
  );
};

export default TaskSuperList;