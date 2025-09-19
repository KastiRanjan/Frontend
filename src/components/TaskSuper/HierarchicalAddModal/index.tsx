import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button, InputNumber, Collapse, Divider, Typography, Tree, Switch, Space, Tooltip } from 'antd';
import { PlusOutlined, MinusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { HierarchicalAddModalProps, TaskSuperEntity, TaskGroupEntity, TaskTemplateEntity, SubtaskTemplateEntity } from './types';
import { useFetchTaskSupers } from '@/hooks/taskSuper/useFetchTaskSupers';
import { useFetchTaskGroups } from '@/hooks/taskGroup/useFetchTaskGroups';
import { useTaskGroupById } from '@/hooks/taskGroup/useTaskGroupById';

const { Panel } = Collapse;
const { Title, Text } = Typography;
const { TreeNode } = Tree;

/**
 * HierarchicalAddModal Component
 * 
 * A modal that allows hierarchical selection and creation of TaskSuper, TaskGroup, TaskTemplate, and SubtaskTemplate
 * with controls for name, description, rank, and budget hours.
 */
const HierarchicalAddModal: React.FC<HierarchicalAddModalProps> = ({
  visible,
  onCancel,
  onAddToProject,
  initialTaskSuperId,
  initialTaskGroupId,
  initialTaskTemplateId
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // State for entity selection
  const [selectedTaskSuperId, setSelectedTaskSuperId] = useState<string | null>(initialTaskSuperId || null);
  const [selectedTaskGroupId, setSelectedTaskGroupId] = useState<string | null>(initialTaskGroupId || null);
  const [selectedTaskTemplateId, setSelectedTaskTemplateId] = useState<string | null>(initialTaskTemplateId || null);
  
  // State for creating new entities
  const [showNewTaskSuperForm, setShowNewTaskSuperForm] = useState(false);
  const [showNewTaskGroupForm, setShowNewTaskGroupForm] = useState(false);
  const [showNewTaskTemplateForm, setShowNewTaskTemplateForm] = useState(false);
  const [showNewSubtaskTemplateForm, setShowNewSubtaskTemplateForm] = useState(false);
  
  // State for selected entities
  const [selectedTaskSupers, setSelectedTaskSupers] = useState<TaskSuperEntity[]>([]);
  const [selectedTaskGroups, setSelectedTaskGroups] = useState<TaskGroupEntity[]>([]);
  const [selectedTaskTemplates, setSelectedTaskTemplates] = useState<TaskTemplateEntity[]>([]);
  const [selectedSubtaskTemplates, setSelectedSubtaskTemplates] = useState<SubtaskTemplateEntity[]>([]);
  
  // State for hierarchy view option
  const [showHierarchyView, setShowHierarchyView] = useState(false);
  
  // Fetch data using hooks
  const { data: taskSupers, isPending: isLoadingTaskSupers } = useFetchTaskSupers();
  const { data: taskGroups, isPending: isLoadingTaskGroups } = useFetchTaskGroups();
  
  // Fetch templates for a specific group
  const { data: selectedGroup, isPending: isLoadingSelectedGroup } = useTaskGroupById({
    id: selectedTaskGroupId || undefined
  });
  
  // Data loaders
  const [taskTemplates, setTaskTemplates] = useState<any[]>([]);
  const [subtaskTemplates, setSubtaskTemplates] = useState<any[]>([]);
  
  // Load task templates when a task group is selected
  useEffect(() => {
    if (selectedGroupId && selectedGroup?.tasktemplate) {
      // Filter for main templates (taskType === 'story')
      const templates = selectedGroup.tasktemplate.filter(
        (template: any) => template.taskType === 'story' || !template.taskType
      );
      setTaskTemplates(templates);
    } else {
      setTaskTemplates([]);
    }
  }, [selectedGroup]);
  
  // Load subtask templates when a task template is selected
  useEffect(() => {
    if (selectedTaskTemplateId && selectedGroup?.tasktemplate) {
      // Find the selected template
      const selectedTemplate = selectedGroup.tasktemplate.find(
        (template: any) => template.id === selectedTaskTemplateId
      );
      
      // Get subtasks for the selected template
      if (selectedTemplate && selectedTemplate.subTasks) {
        setSubtaskTemplates(selectedTemplate.subTasks);
      } else {
        setSubtaskTemplates([]);
      }
    } else {
      setSubtaskTemplates([]);
    }
  }, [selectedTaskTemplateId, selectedGroup]);
  
  // Reset form when modal becomes visible
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setCurrentStep(0);
      setSelectedTaskSuperId(initialTaskSuperId || null);
      setSelectedTaskGroupId(initialTaskGroupId || null);
      setSelectedTaskTemplateId(initialTaskTemplateId || null);
      setShowNewTaskSuperForm(false);
      setShowNewTaskGroupForm(false);
      setShowNewTaskTemplateForm(false);
      setShowNewSubtaskTemplateForm(false);
      setSelectedTaskSupers([]);
      setSelectedTaskGroups([]);
      setSelectedTaskTemplates([]);
      setSelectedSubtaskTemplates([]);
    }
  }, [visible, form, initialTaskSuperId, initialTaskGroupId, initialTaskTemplateId]);
  
  // Handle selection of a TaskSuper
  const handleTaskSuperSelect = (taskSuperId: string) => {
    setSelectedTaskSuperId(taskSuperId);
    setSelectedTaskGroupId(null);
    setSelectedTaskTemplateId(null);
    
    // Add the TaskSuper to selected list if not already there
    const taskSuper = taskSupers?.find(ts => ts.id === taskSuperId);
    if (taskSuper && !selectedTaskSupers.some(ts => ts.id === taskSuperId)) {
      setSelectedTaskSupers([...selectedTaskSupers, {
        id: taskSuper.id,
        name: taskSuper.name,
        description: taskSuper.description,
        rank: taskSuper.rank
      }]);
    }
  };
  
  // Handle selection of a TaskGroup
  const handleTaskGroupSelect = (taskGroupId: string) => {
    setSelectedTaskGroupId(taskGroupId);
    setSelectedTaskTemplateId(null);
    
    // Add the TaskGroup to selected list if not already there
    const taskGroup = taskGroups?.find(tg => tg.id === taskGroupId);
    if (taskGroup && !selectedTaskGroups.some(tg => tg.id === taskGroupId)) {
      setSelectedTaskGroups([...selectedTaskGroups, {
        id: taskGroup.id,
        name: taskGroup.name,
        description: taskGroup.description,
        rank: taskGroup.rank,
        taskSuperId: taskGroup.taskSuperId,
        taskSuperName: taskSupers?.find(ts => ts.id === taskGroup.taskSuperId)?.name
      }]);
    }
  };
  
  // Handle selection of a TaskTemplate
  const handleTaskTemplateSelect = (taskTemplateId: string) => {
    setSelectedTaskTemplateId(taskTemplateId);
    
    // Add the TaskTemplate to selected list if not already there
    const taskTemplate = taskTemplates?.find(tt => tt.id === taskTemplateId);
    if (taskTemplate && !selectedTaskTemplates.some(tt => tt.id === taskTemplateId)) {
      setSelectedTaskTemplates([...selectedTaskTemplates, {
        id: taskTemplate.id,
        name: taskTemplate.name,
        description: taskTemplate.description,
        rank: taskTemplate.rank,
        budgetedHours: taskTemplate.budgetedHours,
        taskType: 'story',
        groupId: selectedTaskGroupId!,
        groupName: selectedGroup?.name
      }]);
    }
  };
  
  // Handle selection of a SubtaskTemplate
  const handleSubtaskTemplateSelect = (subtaskTemplateId: string) => {
    // Add the SubtaskTemplate to selected list if not already there
    const subtaskTemplate = subtaskTemplates?.find(st => st.id === subtaskTemplateId);
    if (subtaskTemplate && !selectedSubtaskTemplates.some(st => st.id === subtaskTemplateId)) {
      setSelectedSubtaskTemplates([...selectedSubtaskTemplates, {
        id: subtaskTemplate.id,
        name: subtaskTemplate.name,
        description: subtaskTemplate.description,
        rank: subtaskTemplate.rank,
        budgetedHours: subtaskTemplate.budgetedHours,
        taskType: 'task',
        parentTaskId: selectedTaskTemplateId!,
        parentTaskName: taskTemplates?.find(tt => tt.id === selectedTaskTemplateId)?.name,
        groupId: selectedTaskGroupId!,
        groupName: selectedGroup?.name
      }]);
    }
  };
  
  // Handle creation of a new TaskSuper
  const handleCreateTaskSuper = (values: any) => {
    const newTaskSuper: TaskSuperEntity = {
      id: `new-task-super-${Date.now()}`,
      name: values.taskSuperName,
      description: values.taskSuperDescription,
      rank: values.taskSuperRank || 0,
      isNew: true
    };
    
    setSelectedTaskSupers([...selectedTaskSupers, newTaskSuper]);
    setSelectedTaskSuperId(newTaskSuper.id);
    setShowNewTaskSuperForm(false);
    form.resetFields(['taskSuperName', 'taskSuperDescription', 'taskSuperRank']);
  };
  
  // Handle creation of a new TaskGroup
  const handleCreateTaskGroup = (values: any) => {
    if (!selectedTaskSuperId) return;
    
    const newTaskGroup: TaskGroupEntity = {
      id: `new-task-group-${Date.now()}`,
      name: values.taskGroupName,
      description: values.taskGroupDescription,
      rank: values.taskGroupRank || 0,
      taskSuperId: selectedTaskSuperId,
      taskSuperName: selectedTaskSupers.find(ts => ts.id === selectedTaskSuperId)?.name,
      isNew: true
    };
    
    setSelectedTaskGroups([...selectedTaskGroups, newTaskGroup]);
    setSelectedTaskGroupId(newTaskGroup.id);
    setShowNewTaskGroupForm(false);
    form.resetFields(['taskGroupName', 'taskGroupDescription', 'taskGroupRank']);
  };
  
  // Handle creation of a new TaskTemplate
  const handleCreateTaskTemplate = (values: any) => {
    if (!selectedTaskGroupId) return;
    
    const newTaskTemplate: TaskTemplateEntity = {
      id: `new-task-template-${Date.now()}`,
      name: values.taskTemplateName,
      description: values.taskTemplateDescription,
      rank: values.taskTemplateRank || 0,
      budgetedHours: values.taskTemplateBudgetedHours || 0,
      taskType: 'story',
      groupId: selectedTaskGroupId,
      groupName: selectedTaskGroups.find(tg => tg.id === selectedTaskGroupId)?.name,
      isNew: true
    };
    
    setSelectedTaskTemplates([...selectedTaskTemplates, newTaskTemplate]);
    setSelectedTaskTemplateId(newTaskTemplate.id);
    setShowNewTaskTemplateForm(false);
    form.resetFields(['taskTemplateName', 'taskTemplateDescription', 'taskTemplateRank', 'taskTemplateBudgetedHours']);
  };
  
  // Handle creation of a new SubtaskTemplate
  const handleCreateSubtaskTemplate = (values: any) => {
    if (!selectedTaskTemplateId || !selectedTaskGroupId) return;
    
    const newSubtaskTemplate: SubtaskTemplateEntity = {
      id: `new-subtask-template-${Date.now()}`,
      name: values.subtaskTemplateName,
      description: values.subtaskTemplateDescription,
      rank: values.subtaskTemplateRank || 0,
      budgetedHours: values.subtaskTemplateBudgetedHours || 0,
      taskType: 'task',
      parentTaskId: selectedTaskTemplateId,
      parentTaskName: selectedTaskTemplates.find(tt => tt.id === selectedTaskTemplateId)?.name,
      groupId: selectedTaskGroupId,
      groupName: selectedTaskGroups.find(tg => tg.id === selectedTaskGroupId)?.name,
      isNew: true
    };
    
    setSelectedSubtaskTemplates([...selectedSubtaskTemplates, newSubtaskTemplate]);
    setShowNewSubtaskTemplateForm(false);
    form.resetFields(['subtaskTemplateName', 'subtaskTemplateDescription', 'subtaskTemplateRank', 'subtaskTemplateBudgetedHours']);
  };
  
  // Remove an entity from the selected list
  const handleRemoveEntity = (entityType: string, entityId: string) => {
    switch(entityType) {
      case 'taskSuper':
        setSelectedTaskSupers(selectedTaskSupers.filter(ts => ts.id !== entityId));
        if (selectedTaskSuperId === entityId) setSelectedTaskSuperId(null);
        break;
      case 'taskGroup':
        setSelectedTaskGroups(selectedTaskGroups.filter(tg => tg.id !== entityId));
        if (selectedTaskGroupId === entityId) setSelectedTaskGroupId(null);
        break;
      case 'taskTemplate':
        setSelectedTaskTemplates(selectedTaskTemplates.filter(tt => tt.id !== entityId));
        if (selectedTaskTemplateId === entityId) setSelectedTaskTemplateId(null);
        break;
      case 'subtaskTemplate':
        setSelectedSubtaskTemplates(selectedSubtaskTemplates.filter(st => st.id !== entityId));
        break;
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate that we have at least some selection
      if (
        selectedTaskSupers.length === 0 &&
        selectedTaskGroups.length === 0 &&
        selectedTaskTemplates.length === 0 &&
        selectedSubtaskTemplates.length === 0
      ) {
        throw new Error('Please select at least one entity to add to the project');
      }
      
      // Call the onAddToProject callback with all selected entities
      await onAddToProject({
        taskSupers: selectedTaskSupers,
        taskGroups: selectedTaskGroups,
        taskTemplates: selectedTaskTemplates,
        subtaskTemplates: selectedSubtaskTemplates
      });
      
      // Reset everything after successful submission
      setSelectedTaskSupers([]);
      setSelectedTaskGroups([]);
      setSelectedTaskTemplates([]);
      setSelectedSubtaskTemplates([]);
      
      onCancel();
    } catch (error) {
      console.error('Error adding to project:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render the hierarchy view (tree)
  const renderHierarchyTree = () => {
    return (
      <Tree defaultExpandAll>
        {selectedTaskSupers.map(taskSuper => (
          <TreeNode 
            title={
              <span>
                <strong>TaskSuper:</strong> {taskSuper.name} 
                <Button 
                  type="text" 
                  danger 
                  size="small"
                  icon={<MinusOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveEntity('taskSuper', taskSuper.id);
                  }}
                />
              </span>
            } 
            key={`super-${taskSuper.id}`}
          >
            {selectedTaskGroups
              .filter(group => group.taskSuperId === taskSuper.id)
              .map(group => (
                <TreeNode 
                  title={
                    <span>
                      <strong>TaskGroup:</strong> {group.name}
                      <Button 
                        type="text" 
                        danger 
                        size="small"
                        icon={<MinusOutlined />} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveEntity('taskGroup', group.id);
                        }}
                      />
                    </span>
                  } 
                  key={`group-${group.id}`}
                >
                  {selectedTaskTemplates
                    .filter(template => template.groupId === group.id)
                    .map(template => (
                      <TreeNode 
                        title={
                          <span>
                            <strong>Template:</strong> {template.name} ({template.budgetedHours || 0} hrs)
                            <Button 
                              type="text" 
                              danger 
                              size="small"
                              icon={<MinusOutlined />} 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveEntity('taskTemplate', template.id);
                              }}
                            />
                          </span>
                        } 
                        key={`template-${template.id}`}
                      >
                        {selectedSubtaskTemplates
                          .filter(subtask => subtask.parentTaskId === template.id)
                          .map(subtask => (
                            <TreeNode 
                              title={
                                <span>
                                  <strong>Subtask:</strong> {subtask.name} ({subtask.budgetedHours || 0} hrs)
                                  <Button 
                                    type="text" 
                                    danger 
                                    size="small"
                                    icon={<MinusOutlined />} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveEntity('subtaskTemplate', subtask.id);
                                    }}
                                  />
                                </span>
                              } 
                              key={`subtask-${subtask.id}`}
                            />
                          ))
                        }
                      </TreeNode>
                    ))
                  }
                </TreeNode>
              ))
            }
          </TreeNode>
        ))}
      </Tree>
    );
  };
  
  // Render the list view
  const renderListView = () => {
    return (
      <div>
        <Collapse defaultActiveKey={['1', '2', '3', '4']}>
          <Panel header="Task Supers" key="1">
            {selectedTaskSupers.length > 0 ? (
              selectedTaskSupers.map(taskSuper => (
                <div key={taskSuper.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>{taskSuper.name} {taskSuper.isNew && <Text type="success">(New)</Text>}</span>
                  <Button 
                    type="text" 
                    danger 
                    icon={<MinusOutlined />} 
                    onClick={() => handleRemoveEntity('taskSuper', taskSuper.id)}
                  />
                </div>
              ))
            ) : (
              <Text type="secondary">No task supers selected</Text>
            )}
          </Panel>
          
          <Panel header="Task Groups" key="2">
            {selectedTaskGroups.length > 0 ? (
              selectedTaskGroups.map(taskGroup => (
                <div key={taskGroup.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>
                    {taskGroup.name} 
                    <Text type="secondary"> (in {taskGroup.taskSuperName || 'Unknown'})</Text>
                    {taskGroup.isNew && <Text type="success"> (New)</Text>}
                  </span>
                  <Button 
                    type="text" 
                    danger 
                    icon={<MinusOutlined />} 
                    onClick={() => handleRemoveEntity('taskGroup', taskGroup.id)}
                  />
                </div>
              ))
            ) : (
              <Text type="secondary">No task groups selected</Text>
            )}
          </Panel>
          
          <Panel header="Task Templates" key="3">
            {selectedTaskTemplates.length > 0 ? (
              selectedTaskTemplates.map(template => (
                <div key={template.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>
                    {template.name} 
                    <Text type="secondary"> ({template.budgetedHours || 0} hrs, in {template.groupName || 'Unknown'})</Text>
                    {template.isNew && <Text type="success"> (New)</Text>}
                  </span>
                  <Button 
                    type="text" 
                    danger 
                    icon={<MinusOutlined />} 
                    onClick={() => handleRemoveEntity('taskTemplate', template.id)}
                  />
                </div>
              ))
            ) : (
              <Text type="secondary">No task templates selected</Text>
            )}
          </Panel>
          
          <Panel header="Subtask Templates" key="4">
            {selectedSubtaskTemplates.length > 0 ? (
              selectedSubtaskTemplates.map(subtask => (
                <div key={subtask.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>
                    {subtask.name} 
                    <Text type="secondary"> 
                      ({subtask.budgetedHours || 0} hrs, in {subtask.parentTaskName || 'Unknown'})
                    </Text>
                    {subtask.isNew && <Text type="success"> (New)</Text>}
                  </span>
                  <Button 
                    type="text" 
                    danger 
                    icon={<MinusOutlined />} 
                    onClick={() => handleRemoveEntity('subtaskTemplate', subtask.id)}
                  />
                </div>
              ))
            ) : (
              <Text type="secondary">No subtask templates selected</Text>
            )}
          </Panel>
        </Collapse>
      </div>
    );
  };
  
  return (
    <Modal
      title="Hierarchical Task Selection"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Add to Project
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <div style={{ marginBottom: '16px' }}>
          <Space align="center">
            <Text>View Mode:</Text>
            <Switch 
              checkedChildren="Hierarchy" 
              unCheckedChildren="List" 
              checked={showHierarchyView} 
              onChange={setShowHierarchyView} 
            />
            <Tooltip title="Switch between hierarchy view (tree) and list view">
              <QuestionCircleOutlined />
            </Tooltip>
          </Space>
        </div>
        
        <Divider>Selection Panel</Divider>
        
        {/* Selected Items Display */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5}>Selected Items:</Title>
          {showHierarchyView ? renderHierarchyTree() : renderListView()}
        </div>
        
        <Divider>Add Items</Divider>
        
        {/* TaskSuper Selection/Creation */}
        <Title level={5}>Task Super</Title>
        <div style={{ marginBottom: '16px' }}>
          {!showNewTaskSuperForm ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Select
                placeholder="Select a Task Super"
                style={{ width: '100%' }}
                loading={isLoadingTaskSupers}
                value={selectedTaskSuperId}
                onChange={handleTaskSuperSelect}
                options={taskSupers?.map(ts => ({ label: ts.name, value: ts.id }))}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowNewTaskSuperForm(true)}
              >
                New
              </Button>
            </div>
          ) : (
            <div>
              <Form.Item
                label="Task Super Name"
                name="taskSuperName"
                rules={[{ required: true, message: 'Please enter a name' }]}
              >
                <Input placeholder="Enter task super name" />
              </Form.Item>
              <Form.Item
                label="Description"
                name="taskSuperDescription"
              >
                <Input.TextArea rows={2} placeholder="Enter description" />
              </Form.Item>
              <Form.Item
                label="Rank"
                name="taskSuperRank"
              >
                <InputNumber min={0} placeholder="Rank (optional)" style={{ width: '100%' }} />
              </Form.Item>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button onClick={() => setShowNewTaskSuperForm(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    form.validateFields(['taskSuperName', 'taskSuperDescription', 'taskSuperRank'])
                      .then(values => handleCreateTaskSuper(values))
                      .catch(info => console.error('Validate Failed:', info));
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* TaskGroup Selection/Creation */}
        <Title level={5}>Task Group</Title>
        <div style={{ marginBottom: '16px' }}>
          {selectedTaskSuperId ? (
            !showNewTaskGroupForm ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Select
                  placeholder="Select a Task Group"
                  style={{ width: '100%' }}
                  loading={isLoadingTaskGroups}
                  value={selectedTaskGroupId}
                  onChange={handleTaskGroupSelect}
                  options={taskGroups
                    ?.filter(tg => tg.taskSuperId === selectedTaskSuperId)
                    .map(tg => ({ label: tg.name, value: tg.id }))}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowNewTaskGroupForm(true)}
                >
                  New
                </Button>
              </div>
            ) : (
              <div>
                <Form.Item
                  label="Task Group Name"
                  name="taskGroupName"
                  rules={[{ required: true, message: 'Please enter a name' }]}
                >
                  <Input placeholder="Enter task group name" />
                </Form.Item>
                <Form.Item
                  label="Description"
                  name="taskGroupDescription"
                >
                  <Input.TextArea rows={2} placeholder="Enter description" />
                </Form.Item>
                <Form.Item
                  label="Rank"
                  name="taskGroupRank"
                >
                  <InputNumber min={0} placeholder="Rank (optional)" style={{ width: '100%' }} />
                </Form.Item>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button onClick={() => setShowNewTaskGroupForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      form.validateFields(['taskGroupName', 'taskGroupDescription', 'taskGroupRank'])
                        .then(values => handleCreateTaskGroup(values))
                        .catch(info => console.error('Validate Failed:', info));
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )
          ) : (
            <Text type="secondary">Please select a Task Super first</Text>
          )}
        </div>
        
        {/* TaskTemplate Selection/Creation */}
        <Title level={5}>Task Template</Title>
        <div style={{ marginBottom: '16px' }}>
          {selectedTaskGroupId ? (
            !showNewTaskTemplateForm ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Select
                  placeholder="Select a Task Template"
                  style={{ width: '100%' }}
                  loading={isLoadingSelectedGroup}
                  value={selectedTaskTemplateId}
                  onChange={handleTaskTemplateSelect}
                  options={taskTemplates?.map(tt => ({ label: tt.name, value: tt.id }))}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowNewTaskTemplateForm(true)}
                >
                  New
                </Button>
              </div>
            ) : (
              <div>
                <Form.Item
                  label="Task Template Name"
                  name="taskTemplateName"
                  rules={[{ required: true, message: 'Please enter a name' }]}
                >
                  <Input placeholder="Enter task template name" />
                </Form.Item>
                <Form.Item
                  label="Description"
                  name="taskTemplateDescription"
                >
                  <Input.TextArea rows={2} placeholder="Enter description" />
                </Form.Item>
                <Form.Item
                  label="Budgeted Hours"
                  name="taskTemplateBudgetedHours"
                >
                  <InputNumber min={0} step={0.5} placeholder="Budgeted hours" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  label="Rank"
                  name="taskTemplateRank"
                >
                  <InputNumber min={0} placeholder="Rank (optional)" style={{ width: '100%' }} />
                </Form.Item>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button onClick={() => setShowNewTaskTemplateForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      form.validateFields(['taskTemplateName', 'taskTemplateDescription', 'taskTemplateBudgetedHours', 'taskTemplateRank'])
                        .then(values => handleCreateTaskTemplate(values))
                        .catch(info => console.error('Validate Failed:', info));
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )
          ) : (
            <Text type="secondary">Please select a Task Group first</Text>
          )}
        </div>
        
        {/* SubtaskTemplate Selection/Creation */}
        <Title level={5}>Subtask Template</Title>
        <div style={{ marginBottom: '16px' }}>
          {selectedTaskTemplateId ? (
            !showNewSubtaskTemplateForm ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Select
                  placeholder="Select a Subtask Template"
                  style={{ width: '100%' }}
                  value={null}
                  mode="multiple"
                  onChange={handleSubtaskTemplateSelect}
                  options={subtaskTemplates?.map(st => ({ label: st.name, value: st.id }))}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowNewSubtaskTemplateForm(true)}
                >
                  New
                </Button>
              </div>
            ) : (
              <div>
                <Form.Item
                  label="Subtask Template Name"
                  name="subtaskTemplateName"
                  rules={[{ required: true, message: 'Please enter a name' }]}
                >
                  <Input placeholder="Enter subtask template name" />
                </Form.Item>
                <Form.Item
                  label="Description"
                  name="subtaskTemplateDescription"
                >
                  <Input.TextArea rows={2} placeholder="Enter description" />
                </Form.Item>
                <Form.Item
                  label="Budgeted Hours"
                  name="subtaskTemplateBudgetedHours"
                >
                  <InputNumber min={0} step={0.5} placeholder="Budgeted hours" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  label="Rank"
                  name="subtaskTemplateRank"
                >
                  <InputNumber min={0} placeholder="Rank (optional)" style={{ width: '100%' }} />
                </Form.Item>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button onClick={() => setShowNewSubtaskTemplateForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      form.validateFields(['subtaskTemplateName', 'subtaskTemplateDescription', 'subtaskTemplateBudgetedHours', 'subtaskTemplateRank'])
                        .then(values => handleCreateSubtaskTemplate(values))
                        .catch(info => console.error('Validate Failed:', info));
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )
          ) : (
            <Text type="secondary">Please select a Task Template first</Text>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default HierarchicalAddModal;