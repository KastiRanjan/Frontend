import React, { useState, useEffect } from 'react';
import { Modal, Steps, Form, Select, Input, Button, message } from 'antd';
import { checkExistingTasksInProject, addTaskSuperToProject } from '@/service/taskSuper.service';
import { ProjectAssignmentModalProps, ProjectAssignmentFormValues, PreviewItemType } from '../types';
import ReviewScreen from './ReviewScreen';
import axios from 'axios';

const { Step } = Steps;

const ProjectAssignmentModal: React.FC<ProjectAssignmentModalProps & { onSuccess: (projectId: string) => void }> = ({
  visible,
  onCancel,
  taskSuperId,
  selectedGroups,
  selectedTemplateRows,
  selectedSubtaskRows,
  taskGroups,
  onSuccess
}) => {
  const [form] = Form.useForm<ProjectAssignmentFormValues>();
  const [currentStep, setCurrentStep] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  // We'll leave these variables for future use but mark them with underscore to avoid linting errors
  const [_existingProjectTasks, setExistingProjectTasks] = useState<any>({
    taskSupers: [],
    taskGroups: []
  });
  const [_loadingExistingTasks, setLoadingExistingTasks] = useState(false);
  const [projectAssignmentData, setProjectAssignmentData] = useState<any>({
    projectId: '',
    suffixTaskSuper: '',
    suffixTaskGroup: '',
    suffixTaskTemplate: '',
    items: []
  });
  const [submittingAddToProject, setSubmittingAddToProject] = useState(false);

  // Fetch projects when the component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const backendURI = import.meta.env.VITE_BACKEND_URI;
        
        console.log('Environment variables:', {
          VITE_BACKEND_URI: import.meta.env.VITE_BACKEND_URI,
          NODE_ENV: import.meta.env.NODE_ENV
        });
        
        console.log('Fetching projects from:', `${backendURI}/projects?status=active`);
        
        const response = await axios.get(`${backendURI}/projects?status=active`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Projects response status:', response.status);
        console.log('Projects response data type:', typeof response.data);
        console.log('Projects response data:', response.data);
        
        if (Array.isArray(response.data)) {
          setProjects(response.data);
          console.log('Projects set successfully:', response.data.length);
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

  // Reset the form and steps when the modal becomes visible
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      form.resetFields();
      setProjectAssignmentData({
        projectId: '',
        suffixTaskSuper: '',
        suffixTaskGroup: '',
        suffixTaskTemplate: '',
        items: []
      });
    }
  }, [visible, form]);

  // Handle project selection change
  const handleProjectChange = async (projectId: string) => {
    if (!projectId) return;
    
    try {
      setLoadingExistingTasks(true);
      const existingTasks = await checkExistingTasksInProject(projectId);
      setExistingProjectTasks(existingTasks);
      console.log('Existing tasks in project:', existingTasks);
    } catch (error) {
      console.error('Failed to fetch existing tasks in project:', error);
      message.error('Failed to check existing tasks in the project');
    } finally {
      setLoadingExistingTasks(false);
    }
  };

  // Get all selected templates and subtasks for adding to project
  const getAllSelectedItems = () => {
    console.log('Getting all selected items:', { 
      selectedTemplateRows, 
      selectedSubtaskRows,
      taskGroups: taskGroups.map(g => ({ id: g.id, name: g.name }))
    });
    
    // Log subtask selection data in a more readable format
    Object.entries(selectedSubtaskRows).forEach(([keyString, subtaskIds]) => {
      // Extract parts from key
      const keyParts = keyString.split(':');
      // Last part is template ID
      const templateIdShort = keyParts[1];
      // First part is the group ID
      const groupIdShort = keyParts[0];
      
      console.log(`Selected subtasks for key ${keyString} (groupId=${groupIdShort}, templateId=${templateIdShort}):`, subtaskIds);
    });
    
    const selectedTemplates: any[] = [];
    const selectedSubtasks: any[] = [];
    
    // Used to track parent templates that need to be added even if not explicitly selected
    const implicitTemplateMap = new Map<string, any>();

    // Collect all selected templates from the table
    Object.entries(selectedTemplateRows).forEach(([groupId, templateIds]) => {
      const group = taskGroups.find(g => g.id === groupId);
      if (group) {
        console.log(`Processing templates for group: ${group.name} (${groupId})`);
        const templates = group.tasktemplate || group.taskTemplates || [];
        templateIds.forEach(templateId => {
          const template = templates.find((t: any) => t.id === templateId);
          if (template) {
            // Check if this template appears as a subtask anywhere - if so, don't add it as a template
            const isSubtask = Object.entries(selectedSubtaskRows).some(([key, subtaskIds]) => {
              const keyParts = key.split(':');
              if (keyParts.length !== 2) return false;
              
              const [_, parentTemplateId] = keyParts;
              const isThisASubtask = subtaskIds.includes(templateId);
              
              // If this template is a subtask of another template, log it and return true
              if (isThisASubtask) {
                console.log(`Skipping template ${template.name} (${templateId}) as it's also a subtask of template ${parentTemplateId}`);
              }
              
              return isThisASubtask;
            });
            
            // Only add as a template if it's not also a subtask
            if (!isSubtask) {
              // Force top-level templates to be 'story' type
              console.log(`Adding template: ${template.name} (${templateId}) to group ${group.name} (${groupId})`);
              selectedTemplates.push({
                ...template,
                groupId,  // Explicitly set groupId from the parent group
                groupName: group.name,
                taskType: 'story', // Force top-level templates to be 'story' type (task)
                isTemplate: true   // Mark explicitly as a template for clarity
              });
            }
          } else {
            console.log(`Template ${templateId} not found in group ${groupId}`);
          }
        });
      } else {
        console.log(`Group ${groupId} not found for template selection`);
      }
    });

    // Collect all selected subtasks from expanded templates
    Object.entries(selectedSubtaskRows).forEach(([keyString, subtaskIds]) => {
      // The key format is now '{groupId}:{templateId}' using a colon as separator
      // This makes it easier to extract the UUIDs even though they contain dashes
      
      // Split by the colon separator
      const keyParts = keyString.split(':');
      if (keyParts.length !== 2) {
        console.log(`Invalid key format: ${keyString}, should be 'groupId:templateId', skipping`);
        return;
      }
      
      const [groupId, templateId] = keyParts;
      
      console.log(`Processing subtasks for key ${keyString}: extracted groupId=${groupId}, templateId=${templateId}`);
      
      if (!subtaskIds || subtaskIds.length === 0) {
        console.log(`No subtasks selected for key ${keyString}, skipping`);
        return;
      }
      
      // Find the group and template
      const group = taskGroups.find(g => g.id === groupId);
      if (group) {
        const templates = group.tasktemplate || group.taskTemplates || [];
        const template = templates.find((t: any) => t.id === templateId);
        
        if (template && template.subTasks) {
          console.log(`Found template ${template.name} with ${template.subTasks.length} subtasks, processing ${subtaskIds.length} selected subtasks`);
          
          // Make sure we also add the parent template if it's not already selected
          const isParentTemplateSelected = Object.entries(selectedTemplateRows).some(([gId, tIds]) => {
            return gId === groupId && templateId && tIds.includes(templateId as React.Key);
          });
          
          // If parent template is not explicitly selected but we have subtasks for it,
          // add it to an implicit template map for later processing
          if (!isParentTemplateSelected && templateId) {
            console.log(`Parent template ${template.name} (${templateId}) is not explicitly selected, but has selected subtasks - adding it implicitly`);
            
            // Add to implicit map if not already there or not in selected templates
            if (!implicitTemplateMap.has(templateId) && 
                !selectedTemplates.some(t => t.id === templateId)) {
              implicitTemplateMap.set(templateId, {
                ...template,
                groupId,
                groupName: group.name,
                taskType: 'story', // Force template (parent) to be 'story' type
                isImplicitParent: true // Mark as implicitly added parent
              });
            }
          }
          
          // Process only the explicitly selected subtasks (not all subtasks of the template)
          subtaskIds.forEach(subtaskId => {
            const subtask = template.subTasks.find((s: any) => s.id === subtaskId);
            if (subtask) {
              console.log(`Adding explicitly selected subtask: ${subtask.name} (${subtaskId}) to template ${template.name} (${templateId})`, {
                templateId,
                parentId: templateId, // Explicitly log the parent relationship
                subtaskId: subtask.id
              });
              
              // Make sure we create a complete relationship object for the subtask
              // This is crucial for ensuring subtasks appear under their parent templates in the review screen
              selectedSubtasks.push({
                ...subtask,
                templateId,         // The ID of the parent template - this is crucial for linking subtasks to templates
                templateName: template.name,
                parentId: templateId, // Explicitly set parentId to match templateId for consistency
                parentTemplateId: templateId, // Add an extra field to make the relationship even more explicit
                groupId: group.id,
                groupName: group.name,
                taskType: 'task', // Explicitly set to 'task' for subtasks
                parentTaskType: 'story', // Explicitly mark that the parent is a story/task template
                isSubtask: true,    // Mark explicitly as a subtask for clarity
                isExplicitlySelected: true // Mark that this was explicitly selected by the user
              });
              
              // Ensure the parent template is included somewhere
              if (!isParentTemplateSelected && templateId && !implicitTemplateMap.has(templateId)) {
                implicitTemplateMap.set(templateId, {
                  ...template,
                  groupId,
                  groupName: group.name,
                  taskType: 'story', // Force template (parent) to be 'story' type
                  isImplicitParent: true // Mark as implicitly added parent
                });
              }
            } else {
              console.log(`Subtask ${subtaskId} not found in template ${templateId}`);
            }
          });
        } else {
          console.log(`Template ${templateId} not found or has no subtasks in group ${groupId}`);
        }
      } else {
        console.log(`Group ${groupId} not found for subtask selection`);
      }
    });
    
    // Add any implicit parent templates that were not explicitly selected
    if (implicitTemplateMap.size > 0) {
      console.log(`Adding ${implicitTemplateMap.size} implicit parent templates`);
      
      // Convert map values to array and add to selectedTemplates
      implicitTemplateMap.forEach(template => {
        // Verify template is not already in selectedTemplates
        if (!selectedTemplates.some(t => t.id === template.id)) {
          console.log(`Adding implicit parent template: ${template.name} (${template.id})`);
          selectedTemplates.push(template);
        }
      });
    }
    
    // Add any implicit parent groups for selected templates/subtasks
    const implicitGroupMap = new Map<string, any>();
    selectedTemplates.forEach(template => {
      const groupId = template.groupId;
      if (groupId && !selectedGroups.includes(groupId) && !implicitGroupMap.has(groupId)) {
        const group = taskGroups.find(g => g.id === groupId);
        if (group) {
          implicitGroupMap.set(groupId, {
            ...group,
            isImplicitParent: true
          });
        }
      }
    });
    selectedSubtasks.forEach(subtask => {
      const groupId = subtask.groupId;
      if (groupId && !selectedGroups.includes(groupId) && !implicitGroupMap.has(groupId)) {
        const group = taskGroups.find(g => g.id === groupId);
        if (group) {
          implicitGroupMap.set(groupId, {
            ...group,
            isImplicitParent: true
          });
        }
      }
    });
    const implicitGroups = Array.from(implicitGroupMap.values());
    return { selectedTemplates, selectedSubtasks, implicitGroups };
  };

  // Helper function to find a template by ID
  const findTemplateById = (templateId: string) => {
    for (const group of taskGroups) {
      const templates = group.tasktemplate || group.taskTemplates || [];
      const template = templates.find((t: any) => t.id === templateId);
      if (template) {
        console.log(`Found template by ID ${templateId}:`, {
          templateId,
          template,
          groupId: group.id,
          groupName: group.name
        });
        return {
          ...template,
          groupId: group.id // Ensure the template has groupId
        };
      }
    }
    console.log(`Template not found for ID ${templateId}`);
    return null;
  };

  // Handle step 1 submission (project selection and suffixes)
  const handleStep1Submit = async () => {
    try {
      const values = await form.validateFields();
      
      // Prepare the preview data with selected items and applied suffixes
  const { selectedTemplates, selectedSubtasks, implicitGroups } = getAllSelectedItems();
      
      console.log('Processing selected items for review:', {
        templates: selectedTemplates.length,
        subtasks: selectedSubtasks.length,
        selectedSubtaskRows
      });
      
      // Create a list of all selected items with their modified names and budget hours
      const previewItems: PreviewItemType[] = [];
      
      // Add task super if any group is selected
      if (selectedGroups.length > 0) {
        const taskSuperItem: PreviewItemType = {
          id: taskSuperId,
          type: 'taskSuper',
          originalName: 'Task Super', // You might want to fetch the actual name
          name: `Task Super ${values.suffixTaskSuper || ''}`.trim(),
          budgetedHours: 0,
        };
        previewItems.push(taskSuperItem);
      }
      
      // Add selected groups
      selectedGroups.forEach(groupId => {
        if (typeof groupId === 'string') {
          const group = taskGroups.find(g => g.id === groupId);
          if (group) {
            previewItems.push({
              id: group.id,
              type: 'taskGroup',
              originalName: group.name,
              name: `${group.name} ${values.suffixTaskGroup || ''}`.trim(),
              budgetedHours: 0,
              taskSuperId: taskSuperId,
              parentId: taskSuperId  // Set parentId to the taskSuperId for hierarchy
            });
          }
        }
      });
      // Add implicit groups (for partial selection)
      implicitGroups.forEach(group => {
        previewItems.push({
          id: group.id,
          type: 'taskGroup',
          originalName: group.name,
          name: `${group.name} ${values.suffixTaskGroup || ''}`.trim(),
          budgetedHours: 0,
          taskSuperId: taskSuperId,
          parentId: taskSuperId,
          isImplicitParent: true
        });
      });
      
      // Add selected templates - ensure they have correct type (story)
      selectedTemplates.forEach(template => {
        previewItems.push({
          id: template.id,
          type: 'template',
          originalName: template.name,
          name: `${template.name} ${values.suffixTaskTemplate || ''}`.trim(),
          budgetedHours: template.budgetedHours || 0,
          description: template.description || '',
          groupId: template.groupId,  // Make sure groupId is set from the template
          taskSuperId: taskSuperId,
          taskType: 'story',  // Force all templates to be 'story' type (tasks)
          parentId: template.groupId,  // Set parentId to the groupId for hierarchy
          rank: template.rank || 0     // Preserve rank for ordering
        });
      });
      
      // Add selected subtasks - ensure they have the correct type (task)
      selectedSubtasks.forEach(subtask => {
        console.log('Adding subtask to preview items:', {
          id: subtask.id,
          name: subtask.name,
          templateId: subtask.templateId,
          parentTemplateId: subtask.parentTemplateId || subtask.templateId,
          parentId: subtask.parentId || subtask.templateId, // Use explicit parentId if set, otherwise fallback to templateId
          taskType: 'task' // Force task type to be 'task' for subtasks
        });
        
        // First, verify that the parent template is included
        const parentTemplateId = subtask.templateId || subtask.parentId;
        const parentTemplateIncluded = previewItems.some(item => 
          item.id === parentTemplateId && item.type === 'template'
        );
        
        if (!parentTemplateIncluded) {
          console.log(`Parent template ${parentTemplateId} for subtask ${subtask.id} is missing in preview items, something went wrong`);
        } else {
          console.log(`Parent template ${parentTemplateId} for subtask ${subtask.id} is properly included in preview items`);
        }
        
        previewItems.push({
          id: subtask.id,
          type: 'subtask',
          originalName: subtask.name,
          name: `${subtask.name} ${values.suffixTaskTemplate || ''}`.trim(),
          budgetedHours: subtask.budgetedHours || 0,
          description: subtask.description || '',
          templateId: subtask.templateId, // Ensure templateId is set for parent reference
          parentTemplateId: subtask.parentTemplateId || subtask.templateId, // Extra explicit parent reference
          parentId: subtask.parentId || subtask.templateId, // Ensure parentId matches templateId for consistency
          groupId: subtask.groupId,
          taskSuperId: taskSuperId,
          taskType: 'task',  // Always set subtasks to type 'task'
          parentTaskType: 'story', // Explicitly mark the parent's type
          isSubtask: true, // Explicitly mark as subtask
          rank: subtask.rank || 0 // Preserve rank for ordering
        });
      });
      
      // Ensure parent items are included for any selected items
      const updatedPreviewItems = ensureParentItemsIncluded(previewItems);
      
      // Validate parent-child relationships are correctly set
      validateParentChildRelationships(updatedPreviewItems);
      
      setProjectAssignmentData({
        ...values,
        items: updatedPreviewItems
      });
      
      setCurrentStep(1);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };
  
  // Validate that parent-child relationships are correctly set in the preview items
  const validateParentChildRelationships = (items: PreviewItemType[]) => {
    // Check subtasks have parent templates
    const subtasks = items.filter(item => item.type === 'subtask');
    const templates = items.filter(item => item.type === 'template');
    const groups = items.filter(item => item.type === 'taskGroup');
    
    console.log(`Validating parent-child relationships: ${subtasks.length} subtasks, ${templates.length} templates, ${groups.length} groups`);
    
    // Log detailed relationship information
    if (subtasks.length > 0) {
      console.log('Subtask relationship details:', subtasks.map(s => ({
        id: s.id,
        name: s.name,
        templateId: s.templateId,
        parentTemplateId: s.parentTemplateId,
        parentId: s.parentId,
        taskType: s.taskType,
        parentTaskType: s.parentTaskType
      })));
    }
    
    // Check each subtask has a parent template
    subtasks.forEach(subtask => {
      // Check all possible parent relationship fields
      const parentTemplateId = subtask.parentTemplateId || subtask.templateId || subtask.parentId;
      const hasParent = templates.some(t => t.id === parentTemplateId);
      
      if (!hasParent) {
        console.error(`❌ Subtask ${subtask.name} (${subtask.id}) is missing its parent template ${parentTemplateId}`);
      } else {
        const parentTemplate = templates.find(t => t.id === parentTemplateId);
        console.log(`✅ Subtask ${subtask.name} (${subtask.id}) correctly linked to parent template ${parentTemplate?.name} (${parentTemplateId})`);
      }
    });
    
    // Check each template has a parent group
    templates.forEach(template => {
      const groupId = template.groupId || template.parentId;
      const hasGroup = groups.some(g => g.id === groupId);
      
      if (!hasGroup) {
        console.error(`❌ Template ${template.name} (${template.id}) is missing its parent group ${groupId}`);
      } else {
        console.log(`✅ Template ${template.name} (${template.id}) correctly linked to parent group ${groupId}`);
      }
    });
  };
  
  // Ensure that parent items are included when child items are selected
  const ensureParentItemsIncluded = (items: PreviewItemType[]): PreviewItemType[] => {
    console.log('Ensuring parent items are included, starting with:', items.length, 'items');
    
    // Create a set of all IDs that are already included
    const includedIds = new Set(items.map(item => item.id));
    const result = [...items];
    
    // For each subtask, ensure its template is included
    items.forEach(item => {
      if (item.type === 'subtask') {
        // The parent ID should be the templateId
        const parentTemplateId = item.templateId || item.parentId;
        
        if (parentTemplateId && !includedIds.has(parentTemplateId)) {
          // Find the template in the original task groups data
          const template = findTemplateById(parentTemplateId);
          if (template) {
            const suffix = form.getFieldValue('suffixTaskTemplate') || '';
            const templateItem: PreviewItemType = {
              id: template.id,
              type: 'template' as 'template',
              originalName: template.name,
              name: `${template.name} ${suffix}`.trim(),
              budgetedHours: template.budgetedHours || 0,
              groupId: template.groupId || item.groupId,
              taskSuperId: taskSuperId,
              taskType: 'story',  // Force template to 'story' type
              parentId: template.groupId || item.groupId  // Set parent relationship to group
            };
            console.log('Adding missing template:', templateItem, {
              subtaskId: item.id,
              templateId: parentTemplateId,
              relationship: 'parent of subtask',
              template
            });
            result.push(templateItem);
            includedIds.add(template.id);
            
            // Also make sure the template's group is included
            if (template.groupId && !includedIds.has(template.groupId)) {
              const group = taskGroups.find(g => g.id === template.groupId);
              if (group) {
                const groupSuffix = form.getFieldValue('suffixTaskGroup') || '';
                const groupItem: PreviewItemType = {
                  id: group.id,
                  type: 'taskGroup' as 'taskGroup',
                  originalName: group.name,
                  name: `${group.name} ${groupSuffix}`.trim(),
                  budgetedHours: 0,
                  taskSuperId: taskSuperId,
                  parentId: taskSuperId  // Set parent relationship to taskSuper
                };
                console.log('Adding missing group for template:', groupItem);
                result.push(groupItem);
                includedIds.add(group.id);
              }
            }
          } else {
            console.log('Could not find template with ID:', parentTemplateId);
          }
        }
      }
      
      // For each template, ensure its group is included
      if ((item.type === 'template' || item.type === 'subtask') && item.groupId) {
        if (!includedIds.has(item.groupId)) {
          // Find the group in the task groups data
          const group = taskGroups.find(g => g.id === item.groupId);
          if (group) {
            const suffix = form.getFieldValue('suffixTaskGroup') || '';
            const groupItem: PreviewItemType = {
              id: group.id,
              type: 'taskGroup' as 'taskGroup',
              originalName: group.name,
              name: `${group.name} ${suffix}`.trim(),
              budgetedHours: 0,
              taskSuperId: taskSuperId,
              parentId: taskSuperId  // Set parent relationship to taskSuper
            };
            console.log('Adding missing task group:', groupItem);
            result.push(groupItem);
            includedIds.add(group.id);
          } else {
            console.log('Could not find group with ID:', item.groupId);
          }
        }
      }
      
      // For each group, ensure task super is included
      if (item.type === 'taskGroup' && taskSuperId) {
        if (!includedIds.has(taskSuperId)) {
          const suffix = form.getFieldValue('suffixTaskSuper') || '';
          const taskSuperItem: PreviewItemType = {
            id: taskSuperId,
            type: 'taskSuper' as 'taskSuper',
            originalName: 'Task Super', // You might want to fetch the actual name
            name: `Task Super ${suffix}`.trim(),
            budgetedHours: 0
            // Task Super is the root, so no parentId needed
          };
          console.log('Adding missing task super:', taskSuperItem);
          result.push(taskSuperItem);
          includedIds.add(taskSuperId);
        }
      }
    });
    
    console.log('Final items after ensuring parents:', result.length, 'items');
    return result;
  };

  // Go back to step 1
  const handleBackToStep1 = () => {
    setCurrentStep(0);
  };

  // Update the name or budget hours of an item in the preview
  const handleUpdatePreviewItem = (itemId: string, field: 'name' | 'budgetedHours', value: string | number) => {
    setProjectAssignmentData((prevData: any) => ({
      ...prevData,
      items: prevData.items.map((item: PreviewItemType) => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  // Handle final submission to add tasks to project
  const handleAddToProjectSubmit = async () => {
    try {
      setSubmittingAddToProject(true);
      
      // Validate projectId exists
      if (!projectAssignmentData.projectId) {
        message.error('Project ID is required');
        return;
      }
      
      // Log all items with their types before submission
      console.log('Final items for submission with types:', projectAssignmentData.items.map((item: PreviewItemType) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        taskType: item.taskType,
        parentId: item.parentId,
        templateId: item.templateId,
        parentTemplateId: item.parentTemplateId
      })));
      
      // Prepare data for backend - using a more simplified approach focused on IDs and relationships
      // Filter and organize items by type - we'll only send the necessary data to the backend
      const taskGroupsData = projectAssignmentData.items
        .filter((item: PreviewItemType) => item.type === 'taskGroup')
        .map((item: PreviewItemType) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          parentId: taskSuperId, // Always set parent to taskSuperId for groups
          taskSuperId: taskSuperId // Explicitly include taskSuperId
        }));
      
      // Only include real templates (not subtasks)
      const selectedTemplates = projectAssignmentData.items
        .filter((item: PreviewItemType) => {
          // Include only if it's a template and not marked as subtask
          return item.type === 'template' && (!item.isSubtask && !item.taskType || item.taskType === 'story');
        })
        .map((item: PreviewItemType) => {
          const groupId = item.groupId || item.parentId;
          return {
            id: item.id,
            name: item.name,
            groupId: groupId, // The group this template belongs to
            groupName: taskGroupsData.find((g: any) => g.id === groupId)?.name || '',
            description: item.description || '',
            budgetedHours: item.budgetedHours || 0,
            rank: item.rank || 0
          };
        });
      
      // Verify we have templates before proceeding
      if (selectedTemplates.length === 0) {
        console.error('No templates selected after filtering. This will cause the backend to reject the request.');
        message.error({
          content: 'No valid templates selected. Please select at least one template to add to the project.',
          key: 'addToProject'
        });
        setSubmittingAddToProject(false);
        return;
      }
      
      console.log(`Selected ${selectedTemplates.length} templates for processing`);
      
      // Get all subtasks
      const selectedSubtasks = projectAssignmentData.items
        .filter((item: PreviewItemType) => item.type === 'subtask' || (item.type === 'template' && item.taskType === 'task') || item.isSubtask)
        .map((item: PreviewItemType) => {
          // Find the parent template for this subtask
          const parentTemplateId = item.templateId || item.parentTemplateId || item.parentId;
          
          return {
            id: item.id,
            name: item.name,
            templateId: parentTemplateId, // This is the parent template ID
            templateName: projectAssignmentData.items.find((t: PreviewItemType) => t.id === parentTemplateId)?.name || '',
            groupId: item.groupId,
            groupName: taskGroupsData.find((g: any) => g.id === item.groupId)?.name || '',
            description: item.description || '',
            budgetedHours: item.budgetedHours || 0,
            rank: item.rank || 0
          };
        });
      
      // Sort by rank to preserve ordering
      const sortedTemplates = [...selectedTemplates].sort((a, b) => (a.rank || 0) - (b.rank || 0));
      const sortedSubtasks = [...selectedSubtasks].sort((a, b) => (a.rank || 0) - (b.rank || 0));
      
      // Create sets for fast lookup
      const subtaskIdSet = new Set(sortedSubtasks.map(s => s.id));
      const templateIdSet = new Set(sortedTemplates.map(t => t.id));
      
      // Find and remove any duplicates (items that appear as both templates and subtasks)
      const duplicateItems = sortedTemplates.filter(t => subtaskIdSet.has(t.id));
      
      if (duplicateItems.length > 0) {
        console.log(`Found ${duplicateItems.length} items that appear as both templates and subtasks:`, 
          duplicateItems.map(item => ({id: item.id, name: item.name})));
        
        // Remove these items from templates list since they're properly subtasks
        const filteredTemplates = sortedTemplates.filter(t => 
          !duplicateItems.some(d => d.id === t.id)
        );
        
        console.log(`Reduced templates from ${sortedTemplates.length} to ${filteredTemplates.length} after removing duplicates`);
        // Update the sorted templates
        sortedTemplates.length = 0;
        sortedTemplates.push(...filteredTemplates);
        
        // Update the templateIdSet to reflect the changes
        templateIdSet.clear();
        filteredTemplates.forEach(t => templateIdSet.add(t.id));
      }
      
      // Remove subtasks that might also be in templates list
      const processedSubtasks = sortedSubtasks.filter(s => !templateIdSet.has(s.id));
      
      // Verify parent-child relationships
      const subtasksWithoutParents = processedSubtasks.filter(subtask => {
        return !sortedTemplates.some(template => template.id === subtask.templateId);
      });
      
      if (subtasksWithoutParents.length > 0) {
        console.error('Error: Some subtasks have no valid parent templates in the final payload');
        message.error({
          content: `Cannot prepare payload: ${subtasksWithoutParents.length} subtasks have missing parent references`,
          key: 'addToProject'
        });
        throw new Error('Subtasks with missing parent references detected in payload preparation');
      }
      
      // Create a payload that only includes explicitly selected items
      const payload = {
        projectId: projectAssignmentData.projectId || null,
        taskSuperId,
        suffixTaskSuper: projectAssignmentData.suffixTaskSuper || '',
        suffixTaskGroup: projectAssignmentData.suffixTaskGroup || '',
        suffixTaskTemplate: projectAssignmentData.suffixTaskTemplate || '',
        selectedGroups: taskGroupsData.map((group: any) => ({
          id: group.id,
          name: group.name,
          description: group.description || '',
          rank: group.rank || 0
        })),
        selectedTemplates: sortedTemplates.map(template => ({
          id: template.id,
          name: template.name,
          groupId: template.groupId,
          groupName: template.groupName,
          description: template.description || '',
          budgetedHours: template.budgetedHours,
          rank: template.rank
        })),
        // Only include explicitly selected subtasks
        selectedSubtasks: processedSubtasks.map(subtask => ({
          id: subtask.id,
          name: subtask.name,
          templateId: subtask.templateId, // This is the parent template ID
          templateName: subtask.templateName,
          groupId: subtask.groupId,
          groupName: subtask.groupName,
          description: subtask.description || '',
          budgetedHours: subtask.budgetedHours,
          rank: subtask.rank
        })),
        // Additional metadata to help the backend understand the structure
        metadata: {
          hasSubtasks: processedSubtasks.length > 0,
          hasTaskGroups: taskGroupsData.length > 0,
          hierarchyType: 'full',
          debugMode: true,
          preserveBudgetAndRanking: true,
          parentChildValidated: true,
          explicitSelectionOnly: true, // Add flag to indicate only explicit selections are included
          // Template and subtask IDs by group for debugging
          groupTemplateMap: taskGroupsData.map((group: any) => ({
            groupId: group.id,
            groupName: group.name,
            templateIds: sortedTemplates
              .filter(t => t.groupId === group.id)
              .map(t => ({ id: t.id, name: t.name }))
          })),
          // List all template->subtask relationships
          templateSubtaskMap: sortedTemplates.map(template => ({
            templateId: template.id,
            templateName: template.name,
            subtaskIds: processedSubtasks
              .filter(s => s.templateId === template.id)
              .map(s => ({ id: s.id, name: s.name }))
          }))
        }
      };
      
      // Log detailed information about the payload
      console.log('Sending payload to add-to-project:', {
        ...payload,
        selectedTemplates: payload.selectedTemplates.map(t => ({ id: t.id, name: t.name })),
        selectedTemplatesCount: payload.selectedTemplates.length,
        selectedSubtasksCount: payload.selectedSubtasks.length,
        groupsCount: payload.selectedGroups.length
      });
      
      // Verify we have templates in the payload
      if (payload.selectedTemplates.length === 0) {
        console.error('Error: No templates in payload. This will cause the backend to reject the request.');
      }
      message.loading({ content: 'Adding tasks to project...', key: 'addToProject' });
      
      try {
        // Final validation before API call
        const templateIdMap = new Map(sortedTemplates.map(t => [t.id, t.name]));
        const missingParentSubtasks = processedSubtasks.filter(s => {
          const parentId = s.parentId || s.templateId || s.parentTaskId;
          
          // Check if parent template exists in the selected templates
          const parentExists = templateIdMap.has(parentId);
          
          if (!parentExists) {
            console.warn(`⚠️ Subtask validation: ${s.name} (${s.id}) has missing parent template: ${parentId}`);
          }
          
          return !parentExists;
        });
        
        if (missingParentSubtasks.length > 0) {
          console.error('Final validation: Subtasks with missing parents detected:', 
            missingParentSubtasks.map(s => ({
              id: s.id,
              name: s.name,
              parentId: s.parentId,
              parentName: templateIdMap.get(s.parentId) || 'MISSING'
            })));
          
          message.error({
            content: `Cannot proceed: ${missingParentSubtasks.length} subtasks have missing parent templates`,
            key: 'addToProject'
          });
          
          throw new Error(`Cannot proceed: ${missingParentSubtasks.length} subtasks have missing parent templates`);
        }
        
        // Verify backend payload structure is correct
        console.log('Final payload verification:', {
          projectId: payload.projectId,
          taskSuperId: payload.taskSuperId,
          groupCount: payload.selectedGroups.length,
          templateCount: sortedTemplates.length,
          subtaskCount: processedSubtasks.length,
          templateParentLinks: sortedTemplates.map(t => ({
            id: t.id,
            name: t.name,
            parentId: t.parentId,
            groupId: t.groupId
          })),
          subtaskParentLinks: processedSubtasks.map(s => ({
            id: s.id,
            name: s.name,
            parentId: s.parentId,
            templateId: s.templateId,
            parentTaskId: s.parentTaskId,
            validParent: templateIdMap.has(s.parentId || s.templateId || s.parentTaskId)
          }))
        });

        // Create an alternative payload in the new format
        const newFormatPayload = {
          projectId: payload.projectId,
          taskSuperId: payload.taskSuperId,
          items: [
            // First add the task super
            {
              id: taskSuperId,
              type: 'taskSuper',
              originalName: payload.suffixTaskSuper ? payload.suffixTaskSuper : 'Task Super',
              name: payload.suffixTaskSuper ? payload.suffixTaskSuper : 'Task Super',
            },
            // Then add all groups
            ...taskGroupsData.map((group: any) => ({
              id: group.id,
              type: 'taskGroup',
              originalName: group.name,
              name: group.name + (payload.suffixTaskGroup ? ` ${payload.suffixTaskGroup}` : ''),
              taskSuperId: taskSuperId
            })),
            // Then add all templates
            ...sortedTemplates.map(template => ({
              id: template.id,
              type: 'template',
              originalName: template.originalName || template.name,
              name: template.name, // Already has suffix from preview step
              budgetedHours: template.budgetedHours || 0,
              groupId: template.groupId,
              ...(template.parentId ? { parentId: template.parentId } : {})
            })),
            // Finally add all subtasks
            ...processedSubtasks.map(subtask => ({
              id: subtask.id,
              type: 'subtask',
              originalName: subtask.originalName || subtask.name,
              name: subtask.name, // Already has suffix from preview step
              budgetedHours: subtask.budgetedHours || 0,
              groupId: subtask.groupId,
              templateId: subtask.parentId || subtask.templateId || subtask.parentTaskId
            }))
          ]
        };
        
        // Log the new format payload for debugging
        console.log('Alternative payload in new format:', newFormatPayload);
        
        // Check if we should use the new format
        const useNewFormat = false; // Set to false to use the original format that works with the backend
        
      // Verify we have templates in the payload before making the API call
      if (sortedTemplates.length === 0) {
        message.error({
          content: 'At least one template must be selected before adding to project',
          key: 'addToProject'
        });
        throw new Error('No templates selected');
      }        console.log('Templates in payload:', {
          sortedTemplatesCount: sortedTemplates.length,
          firstFewTemplates: sortedTemplates.slice(0, 3).map(t => ({ id: t.id, name: t.name })),
          inPayload: payload.selectedTemplates.length,
          inNewFormatPayload: newFormatPayload.items.filter(item => item.type === 'template').length
        });

        // Make the API call to your backend using the service function
        const response = await addTaskSuperToProject(useNewFormat ? newFormatPayload : payload);
        
        console.log('Response from add-to-project:', response);
        
        // Additional tracing for successful response
        console.log('Task assignment successful. Response analysis:', {
          status: response.status,
          dataReceived: !!response.data,
          payloadFormat: useNewFormat ? 'newFormat' : 'originalFormat',
          timing: new Date().toISOString(),
          // Include the counts of items processed for verification
          itemCounts: {
            templates: sortedTemplates.length,
            subtasks: processedSubtasks.length,
            groups: taskGroupsData.length
          }
        });
        
        message.success({ content: 'Tasks added to project successfully', key: 'addToProject' });
        
        // Reset form and close modal
        form.resetFields();
        onCancel();
        setCurrentStep(0);
        
  // Notify parent component of success, pass projectId
  onSuccess(projectAssignmentData.projectId);
      } catch (error: any) {
        console.error('Failed to add tasks to project:', error);
        
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        
        // Check for duplicate name error specifically
        if (error.response?.data?.duplicates) {
          const duplicates = error.response?.data?.duplicates;
          
          // Create a user-friendly error message with the duplicates listed
          message.error({ 
            content: (
              <div>
                <div>Duplicate task names detected:</div>
                <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>
                  {duplicates.map((d: any, index: number) => (
                    <li key={index} style={{ color: 'red' }}>
                      <strong>{d.name}</strong> ({d.type})
                    </li>
                  ))}
                </ul>
                <div>Tasks with the same name cannot exist in the same project.</div>
              </div>
            ), 
            key: 'addToProject',
            duration: 10 // Longer duration so user can read the list
          });
          
          // Mark the duplicate items in the review screen
          const updatedItems = projectAssignmentData.items.map((item: any) => {
            const isDuplicate = duplicates.some((d: any) => 
              d.name.toLowerCase() === item.name.toLowerCase() && 
              (d.id === item.id || d.type === item.type)
            );
            
            return {
              ...item,
              isDuplicate: isDuplicate
            };
          });
          
          setProjectAssignmentData({
            ...projectAssignmentData,
            items: updatedItems
          });
          
          return; // Exit early to skip showing other errors
        }
        
        // Provide more specific guidance based on the error type
        let userFriendlyMessage = errorMessage;
        
        if (errorMessage.includes('At least one template must be selected')) {
          // Special case for no templates error
          userFriendlyMessage = 'At least one template must be selected. Please ensure you have selected valid templates, not just subtasks.';
          
          console.error('Template selection error analysis:', {
            templatesInPayload: payload.selectedTemplates.length,
            subtasksInPayload: payload.selectedSubtasks.length,
            firstFewTemplates: sortedTemplates.slice(0, 3).map((t: any) => ({ id: t.id, name: t.name }))
          });
        }
        // Handle the foreign key constraint error specifically
        else if (errorMessage.includes('FK_8bf6d736c49d48d91691ea0dfe5') || 
            errorMessage.includes('foreign key constraint') || 
            errorMessage.includes('parent task reference')) {
          
          // More specific user-friendly message with guidance on how to fix it
          userFriendlyMessage = 'Foreign key constraint error: Some subtasks are missing their parent tasks. Please ensure all subtasks have valid parent tasks properly selected, and that parent tasks are added to the project before their subtasks.';
          
          // Log detailed debugging information about the parent-child relationships
          console.error('Foreign key constraint violation detected. Detailed analysis:', {
            subtasks: processedSubtasks.map(s => ({
              id: s.id,
              name: s.name,
              parentId: s.parentId,
              templateId: s.templateId,
              parentTaskId: s.parentTaskId,
              groupId: s.groupId,
              // Calculate which field is being used as the parent reference
              effectiveParentId: s.parentId || s.templateId || s.parentTaskId,
              allParentReferences: [s.parentId, s.templateId, s.parentTaskId].filter(Boolean)
            })),
            templates: sortedTemplates.map(t => ({
              id: t.id,
              name: t.name,
              isSubtask: t.isSubtask,
              groupId: t.groupId
            })),
            // Cross-reference to find potential missing parents
            potentialMissingParents: processedSubtasks
              .map(s => {
                const parentId = s.parentId || s.templateId || s.parentTaskId;
                const parentExists = sortedTemplates.some(t => t.id === parentId);
                const parentTemplate = sortedTemplates.find(t => t.id === parentId);
                return {
                  subtaskId: s.id,
                  subtaskName: s.name,
                  parentId: parentId,
                  parentExists: parentExists,
                  parentName: parentTemplate?.name || 'MISSING',
                  potentialParentIsSubtask: parentTemplate?.isSubtask || false
                };
              })
              .filter(item => !item.parentExists)
          });
          
          // Add some more specific guidance if we can identify the issue
          const missingParents = processedSubtasks
            .map(s => {
              const parentId = s.parentId || s.templateId || s.parentTaskId;
              return {
                subtask: s,
                parentExists: sortedTemplates.some(t => t.id === parentId),
                parentId
              };
            })
            .filter(item => !item.parentExists);
            
          if (missingParents.length > 0) {
            console.error(`Found ${missingParents.length} subtasks with missing parent references:`, 
              missingParents.map(m => ({ 
                subtask: m.subtask.name, 
                missingParentId: m.parentId 
              }))
            );
            
            userFriendlyMessage += ` We identified ${missingParents.length} subtasks with invalid parent references. Please check the console for details.`;
          }
        }
        
        // Log more details about the error
        console.error('Detailed error information:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: errorMessage
        });
        
        message.error({ 
          content: `Failed to add tasks to project: ${userFriendlyMessage}`, 
          key: 'addToProject' 
        });
      }
      
    } catch (error) {
      console.error('Failed to add tasks to project:', error);
      message.error({ content: 'Failed to add tasks to project', key: 'addToProject' });
    } finally {
      setSubmittingAddToProject(false);
    }
  };

  return (
    <Modal
      title="Add to Project"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Steps current={currentStep} className="mb-6">
        <Step title="Project Selection" description="Select project and add suffixes" />
        <Step title="Preview & Customize" description="Review and edit before adding" />
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
              onChange={handleProjectChange}
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
            label="Task Super Suffix"
            tooltip="This will be added to the Task Super name"
          >
            <Input placeholder="e.g., - Project A" />
          </Form.Item>
          
          <Form.Item
            name="suffixTaskGroup"
            label="Task Group Suffix"
            tooltip="This will be added to the Task Group names"
          >
            <Input placeholder="e.g., - Project A" />
          </Form.Item>
          
          <Form.Item
            name="suffixTaskTemplate"
            label="Task Template Suffix"
            tooltip="This will be added to the Task Template names"
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
        <ReviewScreen 
          projectAssignmentData={projectAssignmentData}
          handleUpdatePreviewItem={handleUpdatePreviewItem}
          handleBackToStep1={handleBackToStep1}
          handleAddToProjectSubmit={handleAddToProjectSubmit}
          submittingAddToProject={submittingAddToProject}
        />
      )}
    </Modal>
  );
};

export default ProjectAssignmentModal;