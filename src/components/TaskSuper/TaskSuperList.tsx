import { useFetchTaskSupers } from "@/hooks/taskSuper/useFetchTaskSupers";
import { useDeleteTaskSuper } from "@/hooks/taskSuper/useDeleteTaskSuper";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, ProjectOutlined } from '@ant-design/icons';
import { Card, Checkbox, Col, Modal, Row, Button, Spin, Empty, Tooltip, message } from "antd";
import React, { useState } from "react";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUpdateTaskSuperGlobalRankings } from '@/hooks/taskSuper/useUpdateTaskSuperGlobalRankings';
import { TaskSuperType } from "@/types/taskSuper";
import { useNavigate } from "react-router-dom";
import { useFetchTaskGroups } from "@/hooks/taskGroup/useFetchTaskGroups";
import ProjectAssignmentModal from "../TaskGroup/components/ProjectAssignmentModal";

interface TaskSuperListProps {
  showModal: (taskSuper?: TaskSuperType) => void;
  onAddMultipleToProject?: (selectedTaskSupers: string[]) => void;
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


const TaskSuperList = ({ showModal, onAddMultipleToProject }: TaskSuperListProps) => {
  const [modal, contextHolder] = Modal.useModal();
  const [checkedRows, setCheckedRows] = useState<string[]>([]);
  const [isProjectAssignmentModalVisible, setIsProjectAssignmentModalVisible] = useState(false);
  const [selectedTaskSuperId, setSelectedTaskSuperId] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<React.Key[]>([]);
  const [selectedTemplateRows, setSelectedTemplateRows] = useState<Record<string, React.Key[]>>({});
  const [selectedSubtaskRows, setSelectedSubtaskRows] = useState<Record<string, React.Key[]>>({});
  const [isEditOrder, setIsEditOrder] = useState(false);
  // Removed selectedProjectId for global reordering

  const navigate = useNavigate();

  const { data: taskSupers, isPending } = useFetchTaskSupers();
  const [taskSuperOrder, setTaskSuperOrder] = useState<string[]>([]);
  const { mutate: updateTaskSuperGlobalRankings } = useUpdateTaskSuperGlobalRankings();
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

  // Update local order when data loads
  React.useEffect(() => {
    if (taskSupers && taskSupers.length > 0) {
      setTaskSuperOrder(taskSupers.map((t: TaskSuperType) => t.id));
    }
  }, [taskSupers]);

  // Sort taskSupers by local order
  const orderedTaskSupers = React.useMemo(() => {
    if (!taskSupers) return [];
    return taskSuperOrder.map(id => taskSupers.find((t: TaskSuperType) => t.id === id)).filter(Boolean) as TaskSuperType[];
  }, [taskSupers, taskSuperOrder]);

  // DnD Kit Sortable wrapper for Card
  function SortableTaskSuperCard({ taskSuper, children }: { taskSuper: TaskSuperType, children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: taskSuper.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 100 : undefined,
      cursor: 'grab',
    };
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    );
  }

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = taskSuperOrder.indexOf(active.id);
      const newIndex = taskSuperOrder.indexOf(over.id);
      const newOrder = arrayMove(taskSuperOrder, oldIndex, newIndex);
      setTaskSuperOrder(newOrder);
      // Update backend ranks (global, no projectId)
      if (orderedTaskSupers.length > 0) {
        const rankings = newOrder.map((id, idx) => ({ id, rank: idx + 1 }));
        updateTaskSuperGlobalRankings(rankings);
      }
    }
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

      <div className="mb-4 flex items-center gap-2">
        {checkedRows.length > 0 && (
          <Button
            type="primary"
            icon={<ProjectOutlined />}
            onClick={handleAddMultipleToProject}
          >
            Add Selected to Project
          </Button>
        )}
      </div>

      {isEditOrder ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={taskSuperOrder} strategy={verticalListSortingStrategy}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Tooltip title="Add new Task Super">
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
                </Tooltip>
              </Col>
              <Col span={6}>
                <Tooltip title="Manage the order of the TaskSuper">
                  <Card
                    className="h-full flex justify-center items-center cursor-pointer"
                    bordered={false}
                    style={{ border: "2px dotted #1890ff", minHeight: "200px", background: isEditOrder ? '#e6f7ff' : undefined }}
                    onClick={() => setIsEditOrder(false)}
                  >
                    <div className="text-center">
                      <EditOutlined key='edit-order' style={{ fontSize: '24px', marginBottom: '8px', color: '#1890ff' }} />
                      <div>{isEditOrder ? 'Done' : 'Edit Order'}</div>
                    </div>
                  </Card>
                </Tooltip>
              </Col>
              {orderedTaskSupers.map((taskSuper: TaskSuperType) => (
                <Col span={6} key={taskSuper.id}>
                  <SortableTaskSuperCard taskSuper={taskSuper}>
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
                        </Tooltip>
                      ]}
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
                  </SortableTaskSuperCard>
                </Col>
              ))}
            </Row>
          </SortableContext>
        </DndContext>
      ) : (
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Tooltip title="Add new Task Super">
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
            </Tooltip>
          </Col>
          <Col span={6}>
            <Tooltip title="Manage the order of the TaskSuper">
              <Card
                className="h-full flex justify-center items-center cursor-pointer"
                bordered={false}
                style={{ border: "2px dotted #1890ff", minHeight: "200px", background: '#e6f7ff' }}
                onClick={() => setIsEditOrder(true)}
              >
                <div className="text-center">
                  <EditOutlined key='edit-order' style={{ fontSize: '24px', marginBottom: '8px', color: '#1890ff' }} />
                  <div>Edit Order</div>
                </div>
              </Card>
            </Tooltip>
          </Col>
          {orderedTaskSupers.map((taskSuper: TaskSuperType) => (
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
                  </Tooltip>
                ]}
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
      )}

      {/* Project Assignment Modal */}
      {selectedTaskSuperId && (
        <ProjectAssignmentModal
          visible={isProjectAssignmentModalVisible}
          onCancel={handleProjectAssignmentModalCancel}
          taskSuperId={selectedTaskSuperId}
          selectedGroups={selectedGroups}
          selectedTemplateRows={selectedTemplateRows}
          selectedSubtaskRows={selectedSubtaskRows}
          taskGroups={taskGroups || []}
          onSuccess={handleProjectAssignmentSuccess}
        />
      )}
    </>
  );
};

export default TaskSuperList;