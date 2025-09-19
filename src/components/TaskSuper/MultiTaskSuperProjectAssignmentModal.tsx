import React, { useState, useEffect } from 'react';
import { Modal, Steps, Form, Select, Input, Button, message, List, Card, Collapse, Spin } from 'antd';
import { addTaskSuperToProject } from '@/service/taskSuper.service';
import axios from 'axios';
import { useFetchTaskGroups } from '@/hooks/taskGroup/useFetchTaskGroups';

const { Step } = Steps;
const { Panel } = Collapse;

interface MultiTaskSuperProjectAssignmentModalProps {
  visible: boolean;
  onCancel: () => void;
  selectedTaskSuperIds: string[];
  onSuccess: () => void;
}

interface MultiProjectAssignmentFormValues {
  projectId: string;
  suffixTaskSuper: string;
  suffixTaskGroup: string;
  suffixTaskTemplate: string;
}

const MultiTaskSuperProjectAssignmentModal: React.FC<MultiTaskSuperProjectAssignmentModalProps> = ({
  visible,
  onCancel,
  selectedTaskSuperIds,
  onSuccess
}) => {
  const [form] = Form.useForm<MultiProjectAssignmentFormValues>();
  const [currentStep, setCurrentStep] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [taskSuperDetails, setTaskSuperDetails] = useState<any[]>([]);
  const [loadingTaskSuperDetails, setLoadingTaskSuperDetails] = useState(false);

  const { data: allTaskGroups, isPending: isLoadingTaskGroups } = useFetchTaskGroups();

  // Fetch projects when the component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const backendURI = import.meta.env.VITE_BACKEND_URI;
        
        const response = await axios.get(`${backendURI}/projects?status=active`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (Array.isArray(response.data)) {
          setProjects(response.data);
        } else {
          console.error('Unexpected projects response format:', response.data);
          message.error('Projects data format is unexpected');
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        message.error('Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };
    
    if (visible) {
      fetchProjects();
    }
  }, [visible]);

  // Fetch details for selected TaskSupers
  useEffect(() => {
    const fetchTaskSuperDetails = async () => {
      if (!selectedTaskSuperIds.length) return;
      
      setLoadingTaskSuperDetails(true);
      try {
        const backendURI = import.meta.env.VITE_BACKEND_URI;
        const details = await Promise.all(
          selectedTaskSuperIds.map(async (id) => {
            try {
              const response = await axios.get(`${backendURI}/task-super/${id}`);
              return response.data;
            } catch (error) {
              console.error(`Failed to fetch task super details for ID ${id}:`, error);
              return null;
            }
          })
        );
        
        // Filter out any null responses
        const validDetails = details.filter(Boolean);
        setTaskSuperDetails(validDetails);
      } catch (error) {
        console.error('Error fetching task super details:', error);
        message.error('Failed to load task category details');
      } finally {
        setLoadingTaskSuperDetails(false);
      }
    };
    
    if (visible && selectedTaskSuperIds.length > 0) {
      fetchTaskSuperDetails();
    }
  }, [visible, selectedTaskSuperIds]);

  // Reset the form and steps when the modal becomes visible
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      form.resetFields();
    }
  }, [visible, form]);

  const handleStep1Submit = async () => {
    try {
      await form.validateFields();
      setCurrentStep(1);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(0);
  };

  const handleAddToProjectSubmit = async () => {
    try {
      setSubmitting(true);
      const values = form.getFieldsValue();
      
      if (!values.projectId) {
        message.error('Project ID is required');
        return;
      }
      
      const { projectId, suffixTaskSuper, suffixTaskGroup, suffixTaskTemplate } = values;
      
      // Create a separate request for each TaskSuper
      const results = await Promise.all(
        selectedTaskSuperIds.map(async (taskSuperId) => {
          try {
            // Get the TaskSuper details
            const taskSuper = taskSuperDetails.find(ts => ts.id === taskSuperId);
            if (!taskSuper) {
              console.error(`TaskSuper with ID ${taskSuperId} not found in details`);
              return { taskSuperId, success: false, error: 'TaskSuper details not found' };
            }
            
            // Get groups for this TaskSuper
            const groupsForTaskSuper = allTaskGroups?.filter(
              (group: any) => group.taskSuperId === taskSuperId
            ) || [];
            
            if (groupsForTaskSuper.length === 0) {
              console.warn(`TaskSuper ${taskSuper.name} has no task groups`);
              return { taskSuperId, success: false, error: 'No task groups found for this category' };
            }
            
            // Process each group to get their templates and subtasks
            const selectedGroups = groupsForTaskSuper.map((group: any) => group.id);
            
            // Get all templates for these groups
            const selectedTemplateRows: Record<string, any[]> = {};
            const selectedSubtaskRows: Record<string, any[]> = {};
            
            // For each group, select all its templates
            groupsForTaskSuper.forEach((group: any) => {
              const templates = group.tasktemplate || group.taskTemplates || [];
              if (templates.length > 0) {
                selectedTemplateRows[group.id] = templates.map((t: any) => t.id);
                
                // For each template, also get its subtasks if any
                templates.forEach((template: any) => {
                  if (template.subTasks && template.subTasks.length > 0) {
                    const key = `${group.id}:${template.id}`;
                    selectedSubtaskRows[key] = template.subTasks.map((s: any) => s.id);
                  }
                });
              }
            });
            
            // Create the payload
            const payload = {
              projectId,
              taskSuperId,
              suffixTaskSuper: suffixTaskSuper || '',
              suffixTaskGroup: suffixTaskGroup || '',
              suffixTaskTemplate: suffixTaskTemplate || '',
              selectedGroups,
              selectedTemplateRows,
              selectedSubtaskRows,
              metadata: {
                explicitSelectionOnly: true
              }
            };
            
            // Make the API call
            const response = await addTaskSuperToProject(payload);
            return { taskSuperId, success: true, response };
          } catch (error: any) {
            console.error(`Failed to add TaskSuper ${taskSuperId} to project:`, error);
            return { 
              taskSuperId, 
              success: false, 
              error: error.response?.data?.message || error.message || 'Unknown error' 
            };
          }
        })
      );
      
      // Check results
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful === selectedTaskSuperIds.length) {
        message.success('All categories successfully added to project');
        onSuccess();
        onCancel();
      } else if (successful > 0) {
        message.warning(
          `${successful} categories added to project, but ${failed} failed. Check console for details.`
        );
        onSuccess();
        onCancel();
      } else {
        message.error('Failed to add categories to project. Check console for details.');
      }
    } catch (error) {
      console.error('Failed to add task categories to project:', error);
      message.error('Failed to add categories to project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add Multiple Categories to Project"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Steps current={currentStep} className="mb-6">
        <Step title="Project Selection" description="Select project and add suffixes" />
        <Step title="Review & Submit" description="Review before adding to project" />
      </Steps>

      {currentStep === 0 ? (
        <Form 
          form={form}
          layout="vertical"
          onFinish={handleStep1Submit}
        >
          <Form.Item
            name="projectId"
            label="Select Project"
            rules={[{ required: true, message: 'Please select a project' }]}
          >
            <Select
              placeholder="Select a project"
              loading={loadingProjects}
              showSearch
              filterOption={(input, option) =>
                (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
              }
            >
              {projects.map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="suffixTaskSuper"
            label="Task Category Suffix"
            tooltip="This will be added to all Task Category names"
          >
            <Input placeholder="e.g., - Project A" />
          </Form.Item>
          
          <Form.Item
            name="suffixTaskGroup"
            label="Task Group Suffix"
            tooltip="This will be added to all Task Group names"
          >
            <Input placeholder="e.g., - Project A" />
          </Form.Item>
          
          <Form.Item
            name="suffixTaskTemplate"
            label="Task Template Suffix"
            tooltip="This will be added to all Task Template names"
          >
            <Input placeholder="e.g., - Project A" />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="default" 
              onClick={onCancel}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div>
          <div className="mb-4">
            <h3>Selected Categories to Add:</h3>
            {loadingTaskSuperDetails ? (
              <div className="flex justify-center my-4">
                <Spin />
              </div>
            ) : (
              <List
                dataSource={taskSuperDetails}
                renderItem={(taskSuper) => (
                  <List.Item>
                    <Card
                      title={taskSuper.name}
                      size="small"
                      style={{ width: '100%' }}
                    >
                      <p><strong>Description:</strong> {taskSuper.description || 'No description'}</p>
                      <p><strong>Rank:</strong> {taskSuper.rank || 'Not set'}</p>
                      
                      {!isLoadingTaskGroups && (
                        <Collapse ghost>
                          <Panel header={`View ${allTaskGroups?.filter(
                            (g: any) => g.taskSuperId === taskSuper.id
                          ).length || 0} Task Groups`} key="1">
                            <List
                              dataSource={allTaskGroups?.filter(
                                (g: any) => g.taskSuperId === taskSuper.id
                              ) || []}
                              renderItem={(group: any) => (
                                <List.Item>
                                  <div>
                                    <strong>{group.name}</strong>
                                    <div>Templates: {(group.tasktemplate || group.taskTemplates || []).length}</div>
                                  </div>
                                </List.Item>
                              )}
                              size="small"
                            />
                          </Panel>
                        </Collapse>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </div>
          
          <p className="text-gray-500 mb-4">
            All templates and their subtasks from these categories will be added to the selected project. 
            Each will have the specified suffixes added to their names.
          </p>
          
          <div className="flex justify-between mt-4">
            <Button onClick={handleBackToStep1}>
              Back
            </Button>
            <Button 
              type="primary"
              onClick={handleAddToProjectSubmit}
              loading={submitting}
            >
              Add to Project
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MultiTaskSuperProjectAssignmentModal;