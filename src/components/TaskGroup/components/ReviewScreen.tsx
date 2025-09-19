import React from 'react';
import { Typography, Table, Input, InputNumber, Button, Empty, Tag, Alert } from 'antd';
import { PlusOutlined, MinusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ReviewScreenProps, PreviewItemType } from '../types';

const { Text } = Typography;

const ReviewScreen: React.FC<ReviewScreenProps> = ({
  projectAssignmentData,
  handleUpdatePreviewItem,
  handleBackToStep1,
  handleAddToProjectSubmit,
  submittingAddToProject
}) => {
  console.log('ReviewScreen data:', projectAssignmentData);
  
  // Log parent-child relationships for better debugging
  const templates = projectAssignmentData.items.filter((item) => item.type === 'template');
  const subtasks = projectAssignmentData.items.filter((item) => item.type === 'subtask');
  
  console.log('Template-Subtask Relationships:');
  templates.forEach(template => {
    const relatedSubtasks = subtasks.filter(subtask => 
      subtask.parentId === template.id || 
      subtask.templateId === template.id || 
      subtask.parentTemplateId === template.id
    );
    console.log(`Template ${template.name} (${template.id}) has ${relatedSubtasks.length} subtasks:`, 
      relatedSubtasks.map(s => s.name))
  });
  
  // Validation: Check if all subtasks have valid parent references
  const subtasksWithoutParents = subtasks.filter(subtask => {
    const parentTemplateId = subtask.parentId || subtask.templateId || subtask.parentTemplateId;
    return !templates.some(template => template.id === parentTemplateId);
  });

  const hasHierarchyIssues = subtasksWithoutParents.length > 0;
  
  // Check for items marked as duplicates (from backend validation)
  const duplicateItems = projectAssignmentData.items.filter(item => item.isDuplicate);
  const hasDuplicateIssues = duplicateItems.length > 0;
  
  return (
    <div>
      <Typography.Title level={4}>Review and Customize Tasks</Typography.Title>
      <Typography.Paragraph>
        Review the tasks below. You can edit the names and budget hours before adding them to the project.
      </Typography.Paragraph>

      {hasHierarchyIssues && (
        <Alert
          message="Hierarchy Warning"
          description={
            <div>
              <p>Some subtasks may not have valid parent tasks. This could cause errors when adding to the project.</p>
              <p>Affected subtasks: {subtasksWithoutParents.map(s => s.name).join(', ')}</p>
            </div>
          }
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}
      
      {hasDuplicateIssues && (
        <Alert
          message="Duplicate Task Names"
          description={
            <div>
              <p>The following tasks have duplicate names. Tasks with the same name cannot exist in the same project:</p>
              <ul>
                {duplicateItems.map((item, index) => (
                  <li key={index}>
                    <strong style={{ color: 'red' }}>{item.name}</strong> - {item.type}
                  </li>
                ))}
              </ul>
              <p>Please modify the task names to make them unique before submitting.</p>
            </div>
          }
          type="error"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Task Super section */}
      <Typography.Title level={5}>Task Super</Typography.Title>
      <Table
        dataSource={projectAssignmentData.items.filter((item: PreviewItemType) => item.type === 'taskSuper')}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: 'Original Name',
            dataIndex: 'originalName',
            key: 'originalName',
          },
          {
            title: 'Name in Project',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: PreviewItemType) => (
              <Input
                value={text}
                onChange={(e) => handleUpdatePreviewItem(record.id, 'name', e.target.value)}
              />
            ),
          }
        ]}
      />

      {/* Task Groups organized by TaskSuper */}
      {projectAssignmentData.items
        .filter((item: PreviewItemType) => item.type === 'taskSuper')
        .map((taskSuper: PreviewItemType) => {
          // Get all task groups for this task super
          const taskGroups = projectAssignmentData.items.filter(
            (item: PreviewItemType) => item.type === 'taskGroup' && item.parentId === taskSuper.id
          );

          return (
            <div key={taskSuper.id} className="mt-6">
              <Typography.Title level={5}>Task Groups for {taskSuper.name}</Typography.Title>
              <Table
                dataSource={taskGroups}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: 'Original Name',
                    dataIndex: 'originalName',
                    key: 'originalName',
                  },
                  {
                    title: 'Name in Project',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text: string, record: PreviewItemType) => (
                      <Input
                        value={text}
                        onChange={(e) => handleUpdatePreviewItem(record.id, 'name', e.target.value)}
                        style={{ 
                          borderColor: record.isDuplicate ? 'red' : undefined,
                          background: record.isDuplicate ? '#fff2f0' : undefined
                        }}
                      />
                    ),
                  }
                ]}
                expandable={{
                  expandIcon: ({ expanded, onExpand, record }) => (
                    expanded ? (
                      <MinusOutlined onClick={e => onExpand(record, e)} />
                    ) : (
                      <PlusOutlined onClick={e => onExpand(record, e)} />
                    )
                  ),
                  expandedRowRender: (taskGroup) => {
                    // Get templates for this task group - preserve their original taskType
                    // Only get story-type templates (tasks) at this level
                    // Explicitly filter out any items that are also subtasks using multiple criteria
                    // Get main templates for this task group (exclude any that are also subtasks)
                    const templates = projectAssignmentData.items.filter(
                      (item: PreviewItemType) => 
                        item.type === 'template' && 
                        (item.parentId === taskGroup.id || item.groupId === taskGroup.id) && 
                        (item.taskType === 'story') && // Only include story-type templates at this level
                        (!item.templateId && !item.parentTemplateId) && // Exclude subtasks (which would have these properties set)
                        (!item.isSubtask) // Exclude items explicitly marked as subtasks
                    );
                    
                    // Further filter out any template that also appears as a subtask somewhere else
                    const filteredTemplates = templates.filter(template => {
                      const appearsAsSubtask = projectAssignmentData.items.some(item => 
                        item.type === 'subtask' && item.id === template.id
                      );
                      return !appearsAsSubtask;
                    });

                    console.log(`ReviewScreen: Templates for group ${taskGroup.name} (${taskGroup.id}):`, {
                      taskGroupId: taskGroup.id,
                      initialTemplatesFound: templates.length,
                      finalTemplatesAfterFiltering: filteredTemplates.length,
                      filteredOut: templates.length - filteredTemplates.length,
                      templates: filteredTemplates.map(t => ({
                        id: t.id,
                        name: t.name,
                        groupId: t.groupId,
                        parentId: t.parentId,
                        taskType: t.taskType,
                        isSubtask: t.isSubtask
                      })),
                      removedTemplates: templates
                        .filter(t => !filteredTemplates.includes(t))
                        .map(t => ({
                          id: t.id,
                          name: t.name,
                          reason: "Appears as subtask elsewhere"
                        })),
                      allItems: projectAssignmentData.items
                        .filter(item => item.type === 'template' || item.type === 'subtask')
                        .map(item => ({
                          id: item.id,
                          name: item.name,
                          type: item.type,
                          parentId: item.parentId,
                          templateId: item.templateId,
                          parentTemplateId: item.parentTemplateId,
                          groupId: item.groupId,
                          taskType: item.taskType,
                          isSubtask: item.isSubtask
                        }))
                    });

                    return (
                      <div>
                        <Typography.Title level={5}>Templates for {taskGroup.name}</Typography.Title>
                        {templates.length === 0 ? (
                          <Empty description="No templates found in this group" />
                        ) : (
                          <Table
                            dataSource={filteredTemplates}
                            rowKey="id"
                            pagination={false}
                            columns={[
                              {
                                title: 'Original Name',
                                dataIndex: 'originalName',
                                key: 'originalName',
                              },
                              {
                                title: 'Name in Project',
                                dataIndex: 'name',
                                key: 'name',
                                render: (text: string, record: PreviewItemType) => (
                                  <Input
                                    value={text}
                                    onChange={(e) => handleUpdatePreviewItem(record.id, 'name', e.target.value)}
                                    style={{ 
                                      borderColor: record.isDuplicate ? 'red' : undefined,
                                      background: record.isDuplicate ? '#fff2f0' : undefined
                                    }}
                                  />
                                ),
                              },
                              {
                                title: 'Type',
                                dataIndex: 'taskType',
                                key: 'taskType',
                                render: (_taskType: string) => {
                                  // Always show as "Task Template" for top-level templates (type 'story')
                                  const typeLabel = "Task Template";
                                  const typeColor = "#1890ff"; // Blue for tasks
                                  
                                  return (
                                    <span 
                                      style={{ color: typeColor, fontWeight: 'bold' }}
                                      title={`Original Type: story (task)`}
                                    >
                                      {typeLabel}
                                    </span>
                                  );
                                },
                              },
                              {
                                title: 'Budget Hours',
                                dataIndex: 'budgetedHours',
                                key: 'budgetedHours',
                                render: (hours: number, record: PreviewItemType) => (
                                  <InputNumber
                                    value={hours}
                                    min={0}
                                    step={0.5}
                                    onChange={(value) => handleUpdatePreviewItem(record.id, 'budgetedHours', value || 0)}
                                  />
                                ),
                              }
                            ]}
                            expandable={{
                              expandIcon: ({ expanded, onExpand, record }) => (
                                expanded ? (
                                  <MinusOutlined onClick={e => onExpand(record, e)} />
                                ) : (
                                  <PlusOutlined onClick={e => onExpand(record, e)} />
                                )
                              ),
                              expandedRowRender: (template) => {
                                // Get subtasks for this template - preserve their taskType
                                // Use multiple properties to ensure we find all subtasks that belong to this template
                                const subtasks = projectAssignmentData.items.filter(
                                  (item: PreviewItemType) => 
                                    item.type === 'subtask' && 
                                    (item.parentId === template.id || 
                                     item.templateId === template.id || 
                                     item.parentTemplateId === template.id)
                                );
                                
                                // Always log information about the template and any potential subtasks
                                console.log(`ReviewScreen: Looking for subtasks for template ${template.name} (${template.id}):`, {
                                  templateId: template.id,
                                  foundSubtasks: subtasks.length,
                                  subtasks: subtasks.map(s => ({
                                    id: s.id,
                                    name: s.name,
                                    parentId: s.parentId,
                                    templateId: s.templateId,
                                    parentTemplateId: s.parentTemplateId
                                  }))
                                });
                                
                                if (subtasks.length === 0) {
                                  // Extended debugging to check why subtasks aren't found
                                  const allSubtasks = projectAssignmentData.items.filter(item => item.type === 'subtask');
                                  console.log(`DEBUG: No subtasks found for template ${template.name} (${template.id}), details:`, {
                                    templateId: template.id,
                                    allSubtasksCount: allSubtasks.length,
                                    templateParentId: template.parentId,
                                    templateGroupId: template.groupId,
                                    templateTaskType: template.taskType,
                                    allSubtasks: allSubtasks.map(s => ({
                                      id: s.id, 
                                      name: s.name,
                                      parentId: s.parentId,
                                      templateId: s.templateId,
                                      parentTemplateId: s.parentTemplateId,
                                      taskType: s.taskType
                                    }))
                                  });
                                }

                                // Calculate total budget hours for this template including all subtasks
                                const templateTotalHours = subtasks.reduce(
                                  (total, subtask) => total + (subtask.budgetedHours || 0), 
                                  template.budgetedHours || 0
                                );

                                console.log(`ReviewScreen: Subtasks for template ${template.name} (${template.id}):`, {
                                  templateId: template.id,
                                  subtasksFound: subtasks.length,
                                  totalHours: templateTotalHours,
                                  subtasks: subtasks.map(s => ({
                                    id: s.id,
                                    name: s.name,
                                    templateId: s.templateId,
                                    parentId: s.parentId,
                                    parentTemplateId: s.parentTemplateId,
                                    taskType: s.taskType
                                  })),
                                  allSubtasks: projectAssignmentData.items
                                    .filter(item => item.type === 'subtask')
                                    .map(item => ({
                                      id: item.id,
                                      name: item.name,
                                      type: item.type,
                                      parentId: item.parentId,
                                      templateId: item.templateId,
                                      parentTemplateId: item.parentTemplateId,
                                      taskType: item.taskType
                                    }))
                                });

                                return (
                                  <div>
                                    <Typography.Title level={5}>Subtasks for {template.name}</Typography.Title>
                                    {subtasks.length === 0 ? (
                                      <Empty description="No subtasks found for this template" />
                                    ) : (
                                      <Table
                                        dataSource={subtasks}
                                        rowKey="id"
                                        pagination={false}
                                        columns={[
                                          {
                                            title: 'Original Name',
                                            dataIndex: 'originalName',
                                            key: 'originalName',
                                            render: (text: string, record: PreviewItemType) => (
                                              <div>
                                                <Text>
                                                  {text} {record.parentTemplateId && (
                                                    <Tag color="blue">
                                                      Child of {
                                                        projectAssignmentData.items.find(
                                                          item => item.id === record.parentTemplateId
                                                        )?.name || 'Unknown'
                                                      }
                                                    </Tag>
                                                  )}
                                                </Text>
                                              </div>
                                            )
                                          },
                                          {
                                            title: 'Name in Project',
                                            dataIndex: 'name',
                                            key: 'name',
                                            render: (text: string, record: PreviewItemType) => (
                                              <Input
                                                value={text}
                                                onChange={(e) => handleUpdatePreviewItem(record.id, 'name', e.target.value)}
                                              />
                                            ),
                                          },
                                          {
                                            title: 'Type',
                                            dataIndex: 'taskType',
                                            key: 'taskType',
                                            render: (taskType: string) => {
                                              // For subtasks, we always display as "Subtask Template" regardless of the stored taskType
                                              const typeLabel = "Subtask";
                                              const typeColor = "#52c41a"; // Green for subtasks
                                              
                                              return (
                                                <span 
                                                  style={{ color: typeColor, fontWeight: 'bold' }}
                                                  title={`Original Type: ${taskType || 'task'}`}
                                                >
                                                  {typeLabel}
                                                </span>
                                              );
                                            },
                                          },
                                          {
                                            title: 'Budget Hours',
                                            dataIndex: 'budgetedHours',
                                            key: 'budgetedHours',
                                            render: (hours: number, record: PreviewItemType) => (
                                              <InputNumber
                                                value={hours}
                                                min={0}
                                                step={0.5}
                                                onChange={(value) => handleUpdatePreviewItem(record.id, 'budgetedHours', value || 0)}
                                              />
                                            ),
                                          }
                                        ]}
                                      />
                                    )}
                                  </div>
                                );
                              },
                              rowExpandable: (record) => {
                                // Check if this template has any subtasks using multiple fields
                                const hasSubtasks = projectAssignmentData.items.some(
                                  (item: PreviewItemType) => 
                                    item.type === 'subtask' && 
                                    (item.parentId === record.id || 
                                     item.templateId === record.id || 
                                     item.parentTemplateId === record.id)
                                );

                                // More detailed logging about expandable state
                                console.log(`Template ${record.name} (${record.id}) expandable check:`, {
                                  hasSubtasks,
                                  subtasks: projectAssignmentData.items
                                    .filter(item => 
                                      item.type === 'subtask' && 
                                      (item.parentId === record.id || 
                                       item.templateId === record.id || 
                                       item.parentTemplateId === record.id)
                                    )
                                    .map(s => ({ 
                                      id: s.id, 
                                      name: s.name, 
                                      parentId: s.parentId, 
                                      templateId: s.templateId,
                                      parentTemplateId: s.parentTemplateId 
                                    })),
                                  allSubtasks: projectAssignmentData.items
                                    .filter(item => item.type === 'subtask')
                                    .map(s => ({ 
                                      id: s.id, 
                                      name: s.name, 
                                      parentId: s.parentId, 
                                      templateId: s.templateId,
                                      parentTemplateId: s.parentTemplateId
                                    }))
                                });

                                return hasSubtasks;
                              }
                            }}
                          />
                        )}
                      </div>
                    );
                  },
                  rowExpandable: (record) => {
                    const hasTemplates = projectAssignmentData.items.some(
                      (item: PreviewItemType) => 
                        item.type === 'template' && 
                        (item.parentId === record.id || item.groupId === record.id)
                    );
                    return hasTemplates;
                  }
                }}
              />
            </div>
          );
        })}

      <div style={{ marginTop: 24 }}>
        <Button 
          onClick={handleBackToStep1}
          style={{ marginRight: 8 }}
        >
          Back
        </Button>
        <Button 
          type="primary" 
          onClick={handleAddToProjectSubmit}
          loading={submittingAddToProject}
        >
          Add to Project
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;