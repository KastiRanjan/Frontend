import React from 'react';
import { Table, Button, Space, Empty, Typography, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TemplateExpandedViewProps } from '../types';

const { Text } = Typography;

const TemplateExpandedView: React.FC<TemplateExpandedViewProps> = ({
  record,
  selectedTemplateRows,
  setSelectedTemplateRows,
  selectedSubtaskRows,
  setSelectedSubtaskRows,
  handleAddTemplate,
  handleEditTemplate,
  handleDeleteTemplate,
}) => {
  // Handle both taskTemplates and tasktemplate property naming
  // First check if we have an array at either property
  let templates: any[] = [];
  
  if (record.tasktemplate && Array.isArray(record.tasktemplate)) {
    templates = record.tasktemplate;
  } else if (record.taskTemplates && Array.isArray(record.taskTemplates)) {
    templates = record.taskTemplates;
  }
  
  // Ensure we're working with template objects that are tasks (stories), not subtasks
  templates = templates.filter(t => t.taskType === 'story' || !t.taskType);
  
  // Log the templates for this specific record
  console.log(`Rendering row for TaskGroup ${record.name} (ID: ${record.id}):`, {
    taskTemplatesProp: record.taskTemplates,
    tasktemplateProp: record.tasktemplate,
    filteredTemplates: templates,
    templatesLength: templates.length,
    templatesArray: Array.isArray(templates),
    recordType: typeof record,
    allKeys: Object.keys(record)
  });

  // Filter out main stories (not subtasks)
  // Preserve existing taskType if present, otherwise default to 'story'
  const storyTemplates = templates.map(template => ({
    ...template,
    taskType: template.taskType || 'story' // Preserve original taskType or default to 'story'
  })).sort((a: any, b: any) => (a.rank || 0) - (b.rank || 0));
  
  // Use the centralized state for this group's selected rows
  const selectedRowKeys = selectedTemplateRows[record.id] || [];
  
  // Define template columns
  const templateColumns = [
    {
      title: 'Template Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text || 'Unnamed Template'}</Text>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Budget',
      dataIndex: 'budgetedHours',
      key: 'budgetedHours',
      width: 100,
      render: (hours: number) => {
        if (!hours && hours !== 0) return '-';
        // Format hours with up to 1 decimal place if needed
        return hours % 1 === 0 ? `${Math.floor(hours)}h` : `${hours.toFixed(1)}h`;
      },
      sorter: (a: any, b: any) => (a.budgetedHours || 0) - (b.budgetedHours || 0),
    },
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      sorter: (a: any, b: any) => (a.rank || 0) - (b.rank || 0),
      defaultSortOrder: 'ascend' as 'ascend',
      render: (rank: number) => rank !== undefined ? rank : '-',
    },
    {
      title: 'Type',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 100,
      render: (type: string) => {
        let displayType = 'N/A';
        let color = 'blue';
        
        if (type === 'story') {
          displayType = 'Task';
        } else if (type === 'task') {
          displayType = 'Subtask';
          color = 'purple';
        } else {
          displayType = type || 'N/A';
        }
        
        return <Tag color={color}>{displayType}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, template: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditTemplate({
              ...template,
              // Explicitly add the groupId if not already present
              groupId: template.groupId || record.id
            })}
            title="Edit Template"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTemplate(template.id)}
            title="Delete Template"
          />
        </Space>
      ),
    },
  ];
  
  // Function to determine if a row has expandable data (subtasks)
  const hasExpandableData = (record: any) => {
    return record.subTasks && record.subTasks.length > 0;
  };
  
  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <Button 
          type="primary" 
          size="small" 
          onClick={(e) => {
            e.stopPropagation();
            handleAddTemplate(record);
          }}
        >
          Add Template
        </Button>
      </div>
      
      {!templates || templates.length === 0 ? (
        <Empty description="No task templates found in this group" />
      ) : (
        <div className="mb-4">
          <Table 
            rowSelection={{
              selectedRowKeys: selectedRowKeys.filter(id => 
                storyTemplates.some(t => t.id === id)
              ),
              onChange: (newSelectedRowKeys, selectedRows) => {
                // Smart selection: selecting a template selects all its subtasks
                const updatedTemplateRows = {
                  ...selectedTemplateRows,
                  [record.id]: newSelectedRowKeys
                };
                const updatedSubtaskRows = { ...selectedSubtaskRows };
                // For each selected template, select all its subtasks
                storyTemplates.forEach(template => {
                  const subtaskKey = `${record.id}:${template.id}`;
                  if (newSelectedRowKeys.includes(template.id)) {
                    // Select all subtasks for this template
                    if (template.subTasks && template.subTasks.length > 0) {
                      updatedSubtaskRows[subtaskKey] = template.subTasks.map((s: any) => s.id);
                    }
                  } else {
                    // Deselect all subtasks for this template
                    if (template.subTasks && template.subTasks.length > 0) {
                      updatedSubtaskRows[subtaskKey] = [];
                    }
                  }
                });
                setSelectedTemplateRows(updatedTemplateRows);
                setSelectedSubtaskRows(updatedSubtaskRows);
              }
            }}
            dataSource={storyTemplates.sort((a, b) => {
              // Primary sort by rank
              const rankDiff = (a.rank || 0) - (b.rank || 0);
              if (rankDiff !== 0) return rankDiff;
              // Secondary sort by budgetedHours if ranks are equal
              return (a.budgetedHours || 0) - (b.budgetedHours || 0);
            })} 
            columns={templateColumns}
            rowKey="id"
            size="small"
            pagination={false}
            expandable={{
              expandedRowRender: (template) => {
                // Only show subtasks table if there are subtasks
                if (!template.subTasks || template.subTasks.length === 0) {
                  return <Empty description="No subtasks found" />;
                }
                
                // Use centralized state for subtask selection
                // Use a special separator that won't appear in UUIDs
                const subtaskKey = `${record.id}:${template.id}`;
                const subtaskSelectedKeys = selectedSubtaskRows[subtaskKey] || [];
                
                return (
                  <Table 
                    dataSource={template.subTasks.map((subtask: any) => ({
                      ...subtask,
                      taskType: 'task', // Ensure all subtasks have taskType 'task'
                      groupId: record.id, // Explicitly set the groupId for subtasks
                      parentTemplateId: template.id, // Explicitly set parent template ID for clear parent-child relationship
                      parentId: template.id, // Also set parentId to match the template
                      isSubtask: true // Explicitly mark as subtask for filtering
                    })).sort((a: any, b: any) => {
                      // Primary sort by rank
                      const rankDiff = (a.rank || 0) - (b.rank || 0);
                      if (rankDiff !== 0) return rankDiff;
                      // Secondary sort by budgetedHours if ranks are equal
                      return (a.budgetedHours || 0) - (b.budgetedHours || 0);
                    })}
                    pagination={false}
                    size="small"
                    rowKey="id"
                    showHeader={true} // Show the table header/title so rank column is visible
                    rowSelection={{
                      selectedRowKeys: subtaskSelectedKeys,
                      onChange: (selectedKeys) => {
                        // Smart selection: selecting a subtask partially selects its parent template
                        const updatedSubtaskRows = {
                          ...selectedSubtaskRows,
                          [subtaskKey]: selectedKeys
                        };
                        // If any subtask is selected, parent template should be partially selected
                        const templateRowKeys = selectedTemplateRows[record.id] ? [...selectedTemplateRows[record.id]] : [];
                        const templateIndex = templateRowKeys.indexOf(template.id);
                        if (selectedKeys.length > 0) {
                          if (templateIndex === -1) {
                            templateRowKeys.push(template.id);
                          }
                        } else {
                          // If no subtasks selected, remove parent template from selection
                          if (templateIndex !== -1) {
                            templateRowKeys.splice(templateIndex, 1);
                          }
                        }
                        setSelectedSubtaskRows(updatedSubtaskRows);
                        setSelectedTemplateRows({
                          ...selectedTemplateRows,
                          [record.id]: templateRowKeys
                        });
                      }
                    }}
                    columns={templateColumns.map(col => {
                      // Use the same columns as the parent table but customize the type renderer
                      if (col.dataIndex === 'taskType') {
                        return {
                          ...col,
                          render: (_: string) => <Tag color="purple">Subtask</Tag>
                        };
                      }
                      if (col.key === 'actions') {
                        return {
                          ...col,
                          render: (_: any, subtask: any) => (
                            <Space size="small">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEditTemplate({
                                  ...subtask,
                                  // Explicitly set both groupId and parentId
                                  groupId: subtask.groupId || record.id,
                                  parentId: template.id,
                                  parentTaskId: template.id,
                                  parentTemplateId: template.id, // Add explicit parent template ID
                                  taskType: subtask.taskType || 'task', // Ensure task type is set
                                  parentTaskType: template.taskType || 'story' // Record parent's task type
                                })}
                                title="Edit Subtask"
                              />
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteTemplate(subtask.id)}
                                title="Delete Subtask"
                              />
                            </Space>
                          )
                        };
                      }
                      return col;
                    })}
                  />
                );
              },
              rowExpandable: hasExpandableData,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TemplateExpandedView;