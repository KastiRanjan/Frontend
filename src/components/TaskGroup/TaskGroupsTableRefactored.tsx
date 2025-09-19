import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Space, Modal, Empty, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { TaskGroupType } from "@/types/taskSuper";
import { TaskGroupsTableProps } from "./types";
import TaskGroupForm from "./TaskGroupForm";
import TaskTemplatForm from "../TaskTemplate/TaskTemplatForm";
import { deleteTaskTemplate } from "@/service/tasktemplate.service";
import TemplateExpandedView from "./components/TemplateExpandedView";
import ProjectAssignmentModal from "./components/ProjectAssignmentModal";

const TaskGroupsTable: React.FC<TaskGroupsTableProps> = ({ taskSuperId, onEdit, data }) => {
  const [taskGroups, setTaskGroups] = useState(data || []);
  const [modal, contextHolder] = Modal.useModal();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTaskGroup, setCurrentTaskGroup] = useState<TaskGroupType | undefined>(undefined);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [currentTaskGroupForTemplate, setCurrentTaskGroupForTemplate] = useState<TaskGroupType | undefined>(undefined);
  const [templateFormKey, setTemplateFormKey] = useState(Date.now()); // Add key for form reset
  const [selectedGroups, setSelectedGroups] = useState<React.Key[]>([]);
  const [editTemplateModalVisible, setEditTemplateModalVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(undefined);
  // Create state objects to store selected rows for each group and subtask
  const [selectedTemplateRows, setSelectedTemplateRows] = useState<Record<string, React.Key[]>>({});
  const [selectedSubtaskRows, setSelectedSubtaskRows] = useState<Record<string, React.Key[]>>({});
  
  // State for project assignment
  const [projectAssignModalVisible, setProjectAssignModalVisible] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Update taskGroups when data prop changes
  useEffect(() => {
    if (data) {
      setTaskGroups(data);
    }
  }, [data]);

  // Update selected templates and subtasks when groups are selected
  useEffect(() => {
    // Only process if we have task groups
    if (!taskGroups || taskGroups.length === 0) return;
    
    // REMOVED: Auto-selection of templates and subtasks when groups are selected
    // Templates and subtasks must be explicitly selected by the user
  }, [selectedGroups, taskGroups]);
  
  // REMOVED: Auto-selection of parent groups when templates are selected
  // Parent groups must be explicitly selected by the user

  // Helper function to check if there are any selected groups, templates or subtasks
  const hasSelectedItems = useMemo(() => {
    const hasGroups = selectedGroups.length > 0;
    const hasTemplates = Object.values(selectedTemplateRows).some(rows => rows.length > 0);
    const hasSubtasks = Object.values(selectedSubtaskRows).some(rows => rows.length > 0);
    return hasGroups || hasTemplates || hasSubtasks;
  }, [selectedGroups, selectedTemplateRows, selectedSubtaskRows]);

  // Open project assignment modal
  const handleOpenProjectAssignModal = () => {
    if (!hasSelectedItems) {
      message.warning('Please select at least one template or subtask to add to a project');
      return;
    }
    setProjectAssignModalVisible(true);
  };

  const handleDelete = (groupId: string) => {
    modal.confirm({
      title: "Are you sure you want to delete this task group?",
      content: "This action cannot be undone and will affect all associated task templates.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        // Call API to delete task group
        console.log("Deleting task group with ID:", groupId);
        // For now, just refresh the query to simulate deletion
        queryClient.invalidateQueries({ queryKey: ["taskGroups", taskSuperId] });
      },
    });
  };

  const handleEdit = (record: TaskGroupType) => {
    setCurrentTaskGroup(record);
    setEditModalVisible(true);
  };
  
  const handleEditModalCancel = () => {
    setEditModalVisible(false);
    setCurrentTaskGroup(undefined);
    // Refresh the task groups data
    queryClient.invalidateQueries({ queryKey: ["taskGroups", taskSuperId] });
  };
  
  // This function resets the form and opens the modal
  const handleAddTemplate = (record: TaskGroupType) => {
    setCurrentTaskGroupForTemplate(record);
    setTemplateFormKey(Date.now()); // Generate new key to force form reset
    setTemplateModalVisible(true);
  };
  
  const handleTemplateModalCancel = () => {
    setTemplateModalVisible(false);
    setCurrentTaskGroupForTemplate(undefined);
    // Refresh the task groups data
    queryClient.invalidateQueries({ queryKey: ["taskGroups", taskSuperId] });
  };
  
  const handleEditTemplate = (template: any) => {
    // Create a copy of the template with guaranteed groupId field
    // This ensures groupId is always available when the template is edited
    const templateWithGroup = {
      ...template,
      // If template already has groupId, use it, otherwise try to extract from parent record
      groupId: template.groupId || template.group?.id || 
        // Try to find the containing group from taskGroups array
        taskGroups.find(group => 
          (group.tasktemplate || group.taskTemplates || []).some((t: any) => t.id === template.id)
        )?.id
    };
    
    console.log('Editing template with enhanced data:', {
      originalTemplate: template,
      enhancedTemplate: templateWithGroup
    });
    
    setCurrentTemplate(templateWithGroup);
    setEditTemplateModalVisible(true);
  };
  
  const handleEditTemplateModalCancel = () => {
    setEditTemplateModalVisible(false);
    setCurrentTemplate(undefined);
    // Refresh the task groups data
    queryClient.invalidateQueries({ queryKey: ["taskGroups", taskSuperId] });
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    modal.confirm({
      title: "Are you sure you want to delete this task template?",
      content: "This action cannot be undone and will affect all associated subtasks.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        // Call API to delete task template
        deleteTaskTemplate({ id: templateId })
          .then(() => {
            message.success("Task template deleted successfully");
            // Refresh the task groups data
            queryClient.invalidateQueries({ queryKey: ["taskGroups", taskSuperId] });
          })
          .catch((error) => {
            message.error("Failed to delete task template: " + error.message);
          });
      },
    });
  };

  const handleProjectAssignmentSuccess = () => {
    // Clear selections
    setSelectedGroups([]);
    setSelectedTemplateRows({});
    setSelectedSubtaskRows({});
    
    // Refresh data
    queryClient.invalidateQueries({ queryKey: ['taskGroups', taskSuperId] });
  };

  const expandedRowRender = (record: TaskGroupType) => {
    return (
      <TemplateExpandedView
        record={record}
        selectedTemplateRows={selectedTemplateRows}
        setSelectedTemplateRows={setSelectedTemplateRows}
        selectedSubtaskRows={selectedSubtaskRows}
        setSelectedSubtaskRows={setSelectedSubtaskRows}
        handleAddTemplate={handleAddTemplate}
        handleEditTemplate={handleEditTemplate}
        handleDeleteTemplate={handleDeleteTemplate}
      />
    );
  };

  const columns = [
    {
      title: "Group Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      sorter: (a: TaskGroupType, b: TaskGroupType) => (a.rank || 0) - (b.rank || 0),
      defaultSortOrder: 'ascend' as 'ascend',
      width: 80,
      render: (rank: number) => rank !== undefined ? rank : '-',
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: TaskGroupType) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit Group"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            title="Delete Group"
          />
        </Space>
      ),
    },
  ];

  if (!taskGroups || taskGroups.length === 0) {
    return (
      <Empty description="No task groups found">
        {onEdit && <Button type="primary" onClick={() => onEdit("")}>Add Task Group</Button>}
      </Empty>
    );
  }

  return (
    <div>
      {contextHolder}
      {/* Add "Add to Project" button only when items are selected */}
      {hasSelectedItems && (
        <div className="mb-4">
          <Button 
            type="primary" 
            onClick={handleOpenProjectAssignModal}
            icon={<PlusOutlined />}
          >
            Add to Project
          </Button>
        </div>
      )}
      <Table 
        columns={columns} 
        dataSource={taskGroups.sort((a, b) => {
          // Primary sort by rank
          const rankDiff = (a.rank || 0) - (b.rank || 0);
          if (rankDiff !== 0) return rankDiff;
          // Secondary sort by name
          return (a.name || '').localeCompare(b.name || '');
        })} 
        rowKey="id" 
        pagination={{ pageSize: 5 }}
        rowSelection={{
          selectedRowKeys: selectedGroups,
          onChange: (selectedRowKeys) => {
            setSelectedGroups(selectedRowKeys);
          }
        }}
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
        }}
      />
      
      <Modal
        title={currentTaskGroup ? "Edit Task Group" : "Add Task Group"}
        open={editModalVisible}
        onCancel={handleEditModalCancel}
        footer={null}
        width={600}
      >
        <TaskGroupForm 
          handleCancel={handleEditModalCancel} 
          fixedTaskSuperId={taskSuperId}
          editTaskGroupData={currentTaskGroup}
        />
      </Modal>

      <Modal
        title="Add Task Template"
        open={templateModalVisible}
        onCancel={handleTemplateModalCancel}
        footer={null}
        width={600}
        destroyOnClose={true}
      >
        <TaskTemplatForm 
          key={templateFormKey}
          handleCancel={handleTemplateModalCancel}
          groupId={currentTaskGroupForTemplate?.id}
        />
      </Modal>

      <Modal
        title="Edit Task Template"
        open={editTemplateModalVisible}
        onCancel={handleEditTemplateModalCancel}
        footer={null}
        width={600}
        destroyOnClose={true}
      >
        <TaskTemplatForm 
          key={`edit-template-${currentTemplate?.id || 'unknown'}`}
          handleCancel={handleEditTemplateModalCancel}
          groupId={currentTemplate?.groupId}
          editTaskTemplateData={currentTemplate}
        />
      </Modal>
      
      {/* Project Assignment Modal */}
      <ProjectAssignmentModal
        visible={projectAssignModalVisible}
        onCancel={() => setProjectAssignModalVisible(false)}
        taskSuperId={taskSuperId}
        selectedGroups={selectedGroups}
        selectedTemplateRows={selectedTemplateRows}
        selectedSubtaskRows={selectedSubtaskRows}
        taskGroups={taskGroups}
        onSuccess={handleProjectAssignmentSuccess}
      />
    </div>
  );
};

export default TaskGroupsTable;