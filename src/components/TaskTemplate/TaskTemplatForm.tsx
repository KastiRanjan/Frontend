import { useTaskGroupById } from "@/hooks/taskGroup/useTaskGroupById";
import { useCreateTaskTemplate } from "@/hooks/taskTemplate/useCreateTaskTemplate";
import { useEditTaskTemplate } from "@/hooks/taskTemplate/useEditTaskTemplate";
import { TaskTemplateType } from "@/types/taskTemplate";
import { Button, Col, Form, Input, Row, InputNumber, Tooltip, message } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";

interface TaskTemplateFormProps {
  editTaskTemplateData?: any;
  handleCancel: () => void;
  groupId?: string; // Add this prop
}
const TaskTemplateForm = ({
  editTaskTemplateData,
  handleCancel,
  groupId,
}: TaskTemplateFormProps) => {
  const [form] = Form.useForm();
  
  console.log('TaskTemplateForm props:', {
    editMode: !!editTaskTemplateData,
    editTaskTemplateId: editTaskTemplateData?.id,
    propsGroupId: groupId,
    editDataGroupId: editTaskTemplateData?.groupId,
    editDataGroupObjId: editTaskTemplateData?.group?.id
  });
  
  // We don't need URL parameters since we're getting groupId from props
  const { data: taskgroup } = useTaskGroupById({ id: groupId });
  const queryClient = useQueryClient();

  const { mutate } = useCreateTaskTemplate();
  const { mutate: mutateEdit } = useEditTaskTemplate();

  // Watch for changes to taskType
  const taskType = Form.useWatch('taskType', form);
  
  // Set initial values when editing
  useEffect(() => {
    if (editTaskTemplateData) {
      console.log('Setting form values for edit:', editTaskTemplateData);
      
      // Handle different possible parent task field structures
      let parentTaskId = null;
      if (editTaskTemplateData.parentTask?.id) {
        parentTaskId = editTaskTemplateData.parentTask.id;
      } else if (editTaskTemplateData.parentTaskId) {
        parentTaskId = editTaskTemplateData.parentTaskId;
      } else if (editTaskTemplateData.parentId) {
        parentTaskId = editTaskTemplateData.parentId;
      }
      
      // Get the correct groupId - prioritize group relationship over raw groupId
      let formGroupId = null;
      if (editTaskTemplateData.group?.id) {
        formGroupId = editTaskTemplateData.group.id;
        console.log('Found groupId from group relationship:', formGroupId);
      } else if (editTaskTemplateData.groupId) {
        formGroupId = editTaskTemplateData.groupId;
        console.log('Found groupId from groupId property:', formGroupId);
      } else {
        // Fallback to props, but this should be less common
        formGroupId = groupId;
        console.log('Using fallback groupId from props:', groupId);
      }
      
      // Make sure we have a valid groupId - important for edit mode
      if (!formGroupId && groupId) {
        formGroupId = groupId;
        console.log('Using groupId from props as no other groupId found:', groupId);
      }
      
      // Debug output for group ID
      console.log('Final groupId resolution:', {
        fromGroup: editTaskTemplateData.group?.id,
        fromGroupIdProp: editTaskTemplateData.groupId,
        fromProps: groupId,
        finalGroupId: formGroupId
      });
      
      // Direct budgetedHours usage without conversion - this is important
      const budgetedHours = editTaskTemplateData.budgetedHours || 0;
      
      const formValues = {
        name: editTaskTemplateData.name,
        description: editTaskTemplateData.description,
        taskType: editTaskTemplateData.taskType || 'story', // Default to 'story' if missing
        parentTaskId: parentTaskId,
        budgetedHours: budgetedHours,
        rank: editTaskTemplateData.rank || 0, // Add rank field with fallback to 0
        groupId: formGroupId // Use the properly determined groupId
      };
      
      console.log('Setting form values:', formValues, 'with groupId:', formGroupId);
      form.setFieldsValue(formValues);
      
      // Force set the groupId field directly to ensure it's properly set
      if (formGroupId) {
        setTimeout(() => {
          form.setFieldValue('groupId', formGroupId);
          console.log('Forced groupId field value to:', formGroupId);
        }, 100);
      }
    } else {
      // Reset form for create mode
      form.resetFields();
      // Set the groupId for the hidden field in create mode
      form.setFieldValue('groupId', groupId);
      // Set default rank value for new templates
      form.setFieldValue('rank', 0);
      // Set default budgetedHours value
      form.setFieldValue('budgetedHours', 0);
      console.log('Create mode: setting groupId to', groupId);
    }
  }, [editTaskTemplateData, form, groupId]);
  
  // Reset parentTaskId only when user manually changes taskType to "story" (not during initial load)
  useEffect(() => {
    // Only reset if this is not the initial load and taskType changed to "story"
    const currentValues = form.getFieldsValue();
    if (taskType === "story" && currentValues.parentTaskId) {
      form.setFieldValue("parentTaskId", undefined);
    }
  }, [taskType]);

  const handleFinish = (values: any) => {
    // Ensure groupId is set correctly from the form or props
    const finalGroupId = values.groupId || groupId;
    
    console.log('Form values before payload creation:', {
      formValues: values,
      propsGroupId: groupId,
      formGroupId: values.groupId,
      finalGroupId: finalGroupId
    });
    
    if (!finalGroupId) {
      console.error('ERROR: No groupId available for task template!');
      message.error('Group ID is missing. Cannot save template.');
      return;
    }
    
    const payload = {
      ...values,
      groupId: finalGroupId,  // First try to get from form, then props
      // Ensure parentTaskId is set correctly for tasks
      parentTaskId: values.taskType === 'task' ? values.parentTaskId : undefined,
      // Keep budgetedHours as is - no conversion needed
      budgetedHours: values.budgetedHours !== undefined ? values.budgetedHours : 0,
      // Include rank value
      rank: values.rank !== undefined ? values.rank : 0
    };
    
    console.log('Submitting task template:', payload);
    
    if (editTaskTemplateData?.id) {
      console.log(`Editing task template with ID ${editTaskTemplateData.id}:`, {
        endpoint: `/task-template/${editTaskTemplateData.id}`,
        method: 'PATCH',
        payload
      });
      
      mutateEdit(
        { id: editTaskTemplateData?.id, payload: payload },
        {
          onSuccess: (data) => {
            console.log('Edit task template success response:', data);
            handleCancel();
            // Invalidate both specific taskgroup query and the general taskGroups query
            // to ensure all views are updated
            if (groupId) {
              queryClient.invalidateQueries({ queryKey: ["taskgroup", groupId] });
            }
            queryClient.invalidateQueries({ queryKey: ["taskGroups"] });
          },
          onError: (error) => {
            console.error('Edit task template error:', error);
          }
        }
      );
    } else {
      console.log('Creating new task template:', {
        endpoint: '/task-template',
        method: 'POST',
        payload
      });
      
      mutate(payload, { 
        onSuccess: (data) => {
          console.log('Create task template success response:', data);
          handleCancel();
          queryClient.invalidateQueries({ queryKey: ["taskGroups"] });
        },
        onError: (error) => {
          console.error('Create task template error:', error);
        }
      });
    }
  };
  console.log(form.getFieldValue("taskType"));

  return (
    <Form
      key={editTaskTemplateData?.id || 'create'}
      form={form}
      onFinish={handleFinish}
      layout="vertical"
    >
      {/* Hidden field for groupId */}
      <Form.Item
        name="groupId"
        hidden
      >
        <Input type="hidden" />
      </Form.Item>
      
      {/* Task Group Info Display - Using the current form value for groupId to look up the group name */}
      <Form.Item
        label="Task Group"
      >
        <div style={{ marginBottom: '5px' }}>
          <Input 
            value={taskgroup?.name || 'Loading group...'}
            disabled
            style={{ backgroundColor: '#f5f5f5', color: '#666', marginBottom: '5px' }}
            suffix={
              <Tooltip title="This task template belongs to this task group. The group ID is saved in a hidden field.">
                <InfoCircleOutlined />
              </Tooltip>
            }
          />
          <div style={{ fontSize: '11px', color: '#666' }}>
            Group ID: {form.getFieldValue('groupId') || 'Not set'}
            {taskgroup && ` (${taskgroup.name})`}
          </div>
        </div>
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={24}>
          <FormInputWrapper
            id="name"
            name="name"
            label="Name"
            showCount={true}
            maxLength={100}
            placeholder="Enter task template name (max 100 characters)"
            rules={[
              { required: true, message: "Task template name is required" },
              { min: 1, message: "Task template name cannot be empty" },
              { max: 100, message: "Task template name cannot exceed 100 characters" }
            ]}
          />

          {/* Description (Optional) */}
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { type: "string", message: "Please input a valid description" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <FormSelectWrapper
            id="taskType"
            name="taskType"
            label="Task Type"
            rules={[{ required: true, message: "Please select the task type" }]}
            options={[
              { value: "story", label: "Task" },
              { value: "task", label: "Subtask" },
            ]}
          />

          <FormSelectWrapper
            id="parentId"
            name="parentTaskId"
            label="Parent Task Template"
            disabled={taskType === "story"}
            showSearch={true}
            filterOption={(input: string, option: any) => 
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            placeholder={taskType === "story" ? "Not applicable for main task templates" : "Search and select a parent task template"}
            rules={taskType === "task" ? [{ required: true, message: "Please select a parent task template for this subtask template" }] : []}
            options={
              taskgroup?.tasktemplate
                ?.filter((task: TaskTemplateType) => {
                  if (editTaskTemplateData?.id && task.id === editTaskTemplateData.id) {
                    return false;
                  }
                  // Only show story type tasks as potential parents and not completed (if status exists)
                  if (task.taskType !== "story") return false;
                  if (task.status && task.status === "done") return false;
                  return true;
                })
                ?.sort((a: TaskTemplateType, b: TaskTemplateType) => a.name.localeCompare(b.name))
                ?.map((template: TaskTemplateType) => ({
                  value: template.id,
                  label: template.name,
                })) || []
            }
          />

          {/* Budgeted Hours Field */}
          <Form.Item
            name="budgetedHours"
            label={
              <span>
                Budgeted Time (hours)&nbsp;
                <Tooltip title="Enter the estimated time for this task in hours">
                  <InfoCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              { type: "number", min: 0, message: "Time cannot be negative" },
              { type: "number", max: 168, message: "Time cannot exceed 7 days (168 hours)" }
            ]}
          >
            <InputNumber
              min={0}
              max={168} // 7 days in hours
              style={{ width: '100%' }}
              placeholder="Enter estimated time in hours"
              step={0.5} // Allow 0.5 hour increments
              precision={1} // Show one decimal place
              addonAfter="hours"
            />
          </Form.Item>

          {/* Rank Field */}
          <Form.Item
            name="rank"
            label={
              <span>
                Rank&nbsp;
                <Tooltip title="Enter the rank for this task. Lower values appear higher in the list. Tasks are sorted by rank.">
                  <InfoCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              { type: "number", min: 0, message: "Rank cannot be negative" }
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter rank (lower values appear higher in the list)"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default TaskTemplateForm;
