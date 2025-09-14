import { useEditTask } from "@/hooks/task/useEditTask";
import { useDeleteTask } from "@/hooks/task/useDeleteTask";
import { useBulkUpdateTasks } from "@/hooks/task/useBulkUpdateTasks";
import { useMarkTasksComplete } from "@/hooks/task/useMarkTasksComplete";
import { useFirstVerifyTasks, useSecondVerifyTasks } from "@/hooks/task/useVerifyTasks";
import { UserType } from "@/hooks/user/type";
import { TaskType } from "@/types/task";
import { EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Form, Table, TableProps, Tooltip, DatePicker, Select, Modal, message, Popconfirm, Space, Input, Card, notification, Tag } from "antd";
import { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useSession } from "@/context/SessionContext";
import Highlighter from 'react-highlight-words';
import _ from "lodash";

interface ExtendedTaskType extends TaskType {
  first?: boolean;
  last?: boolean;
  projectId: string;
  key?: string;
  children?: ExtendedTaskType[];
  isSubTask?: boolean;
  isStandalone?: boolean;
}

interface TaskTableProps {
  data: TaskType[];
  showModal: (task?: ExtendedTaskType) => void;
  project: {
    id: string;
    users: UserType[];
    projectLead: UserType;
  };
  onRefresh?: () => void;
  loading?: boolean;
}

const TaskTable = ({ data, showModal, project, onRefresh, loading }: TaskTableProps) => {
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { mutate: editTask, isPending: isUpdating } = useEditTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: bulkUpdateTasks } = useBulkUpdateTasks();
  const { mutate: markTasksComplete, isPending: isMarkingComplete } = useMarkTasksComplete();
  const { mutate: firstVerifyTasks, isPending: isFirstVerifying } = useFirstVerifyTasks();
  const { mutate: secondVerifyTasks, isPending: isSecondVerifying } = useSecondVerifyTasks();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isDueDateModalVisible, setIsDueDateModalVisible] = useState(false);
  const [isAssigneeModalVisible, setIsAssigneeModalVisible] = useState(false);
  const { permissions, profile } = useSession(); // Get permissions and profile from session context
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({ 
    columnKey: 'name', 
    order: 'ascend' 
  });
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [globalSearchText, setGlobalSearchText] = useState('');
  const searchInput = useRef<any>(null);

  // Check if user has task delete permission
  const canDeleteTask = useMemo(() => {
    // Check if permissions is an array of strings or objects
    if (permissions && permissions.length > 0) {
      if (typeof permissions[0] === 'string') {
        return permissions.includes('Delete task by id');
      } else if (typeof permissions[0] === 'object') {
        // Check for task delete permission based on resource, path and method
        return permissions.some((perm: any) => 
          (perm.resource === 'tasks' && perm.path === '/tasks/:id' && perm.method === 'delete') ||
          perm.name === 'Delete task by id'
        );
      }
    }
    return false;
  }, [permissions]);

  // Check if user has permission for first verification
  const hasFirstVerifyPermission = (profile as any)?.role?.permission?.includes("first-verify-task");

  // Check if user has permission for second verification
  const hasSecondVerifyPermission = (profile as any)?.role?.permission?.includes("second-verify-task");

  // Check if user is project lead
  const isProjectLead = useMemo(() => {
    return (profile as any)?.id === project?.projectLead?.id;
  }, [(profile as any)?.id, project?.projectLead?.id]);

  // Check if user can mark tasks complete (has permission OR is project lead)
  const canMarkComplete = useMemo(() => {
    const hasMarkCompletePermission = (profile as any)?.role?.permission?.includes("mark-complete-task");
    return hasMarkCompletePermission || isProjectLead;
  }, [profile, isProjectLead]);

  // Memoized data processing for hierarchical structure
  const { processedData, filteredData } = useMemo(() => {
    // Transform the data to have proper parent-child relationships
    console.log('Original taskList:', data);
    
    // Transform the data to have proper parent-child relationships using actual parentTask relations
    console.log('Original taskList:', data);
    
    const expandedData: any = _.chain(data)
      .filter((task: any) => task.taskType === 'story') // Only get stories (which display as Tasks) as main tasks
      .map((story: any) => {
        // Use the subTasks relation directly from backend if available
        const subTasks = story.subTasks || [];
        
        // If no subTasks relation, find child tasks manually using parentTask relationship
        const manualSubTasks = subTasks.length === 0 
          ? data.filter((task: any) => task.parentTask?.id === story.id)
          : [];
        
        const allSubTasks = [...subTasks, ...manualSubTasks];
        
        console.log(`Task "${story.name}" has ${allSubTasks.length} subtasks:`, allSubTasks);
        
        // Sort subtasks alphabetically by name and map to proper format
        const children = allSubTasks
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
          .map((subTask: any) => ({
            ...subTask,
            key: `${story.id}-${subTask.id}`, // Unique key for subtask
            isSubTask: true,
            projectId: project.id
          }));
        
        // Return task (story type) with its subtasks as children
        return {
          ...story,
          key: story.id,
          projectId: project.id,
          children: children.length > 0 ? children : undefined
        };
      })
      .value();
    
    // Also add any standalone tasks with taskType 'task' that have no parent
    const standaloneTasks = data
      .filter((task: any) => 
        task.taskType === 'task' && !task.parentTask
      )
      .map((task: any) => ({
        ...task,
        key: task.id,
        projectId: project.id,
        isStandalone: true
      }));
    
    console.log('Standalone tasks:', standaloneTasks);
    
    // Combine stories with their subtasks and standalone tasks
    const finalData = [...expandedData, ...standaloneTasks];
    
    // Apply sorting if specifically requested, otherwise maintain default order
    const sortedData = finalData.sort((a: any, b: any) => {
      if (sortedInfo.columnKey === 'name') {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return sortedInfo.order === 'descend' 
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      } else if (sortedInfo.columnKey === 'taskType') {
        const typeA = a.taskType || '';
        const typeB = b.taskType || '';
        return sortedInfo.order === 'descend'
          ? typeB.localeCompare(typeA)
          : typeA.localeCompare(typeB);
      }
      // Default to name sorting 
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
    
    // Apply global search filter
    const filtered = globalSearchText ? 
      sortedData.filter((record: any) => {
        const searchValue = globalSearchText.toLowerCase();
        
        // Check parent task fields
        const fieldsToSearch = ['name', 'description', 'tcode'];
        const parentMatches = fieldsToSearch.some(field => 
          record[field] && record[field].toString().toLowerCase().includes(searchValue)
        );
        
        // Check task type display value
        const taskTypeDisplay = record?.taskType === 'story' ? 'Task' : 'Subtask';
        const taskTypeMatches = taskTypeDisplay.toLowerCase().includes(searchValue);
        
        // Check group name
        const groupMatches = record.group?.name && record.group.name.toLowerCase().includes(searchValue);
        
        // Check status
        const statusMatches = record.status && record.status.toLowerCase().includes(searchValue);
        
        if (parentMatches || taskTypeMatches || groupMatches || statusMatches) {
          return true;
        }
        
        // If parent doesn't match, check if any children match
        if (record.children && Array.isArray(record.children)) {
          const hasMatchingChild = record.children.some((child: any) => {
            const childMatches = fieldsToSearch.some(field => 
              child[field] && child[field].toString().toLowerCase().includes(searchValue)
            );
            const childTaskTypeDisplay = child?.taskType === 'story' ? 'Task' : 'Subtask';
            const childTaskTypeMatches = childTaskTypeDisplay.toLowerCase().includes(searchValue);
            const childGroupMatches = child.group?.name && child.group.name.toLowerCase().includes(searchValue);
            const childStatusMatches = child.status && child.status.toLowerCase().includes(searchValue);
            return childMatches || childTaskTypeMatches || childGroupMatches || childStatusMatches;
          });
          
          return hasMatchingChild;
        }
        
        return false;
      }) : sortedData;
    
    console.log('Final processed data:', filtered);
    console.log('Data should show parent-child relationships based on parentTask relation');
    
    return {
      processedData: sortedData,
      filteredData: filtered
    };
  }, [data, sortedInfo, globalSearchText, project.id]);

  const enhancedData: ExtendedTaskType[] = useMemo(
    () => filteredData,
    [filteredData]
  );

  // Get selected tasks data for conditional rendering of bulk actions
  const selectedTasks = enhancedData.filter((task: ExtendedTaskType) => 
    selectedRowKeys.includes(task.id)
  );

  // Check if any selected tasks are open (hide bulk actions for open status)
  const hasOpenTasks = selectedTasks.some((task: ExtendedTaskType) => 
    task.status === 'open'
  );

  // Check if any selected tasks are in_progress (show only mark complete for these)
  const hasInProgressTasks = selectedTasks.some((task: ExtendedTaskType) => 
    task.status === 'in_progress'
  );

  // Check if any selected tasks are done (show verification options for these)
  const hasDoneTasks = selectedTasks.some((task: ExtendedTaskType) => 
    task.status === 'done'
  );

  // Check if current data contains any done tasks (for column visibility)
  const dataHasDoneTasks = enhancedData.some((task: ExtendedTaskType) => 
    task.status === 'done'
  );

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    
    // Clear global search when using column-specific search
    if (selectedKeys[0] && selectedKeys[0].trim()) {
      setGlobalSearchText('');
    }
    
    // Auto-expand rows that have matching children OR matching names
    if (selectedKeys[0]) {
      const searchValue = selectedKeys[0].toLowerCase();
      const keysToExpand: string[] = [];
      
      // Use the memoized processed data for search expansion
      const currentData = processedData;
      
      currentData.forEach((record: any) => {
        let shouldExpand = false;
        
        // Check if the parent task itself matches the search
        if (dataIndex.includes('.')) {
          const keys = dataIndex.split('.');
          let val = record;
          for (const key of keys) {
            if (!val) break;
            val = val[key];
          }
          if (val && val.toString().toLowerCase().includes(searchValue)) {
            shouldExpand = true;
          }
        } else if (record[dataIndex] && record[dataIndex].toString().toLowerCase().includes(searchValue)) {
          shouldExpand = true;
        }
        
        // Also check if any child matches (existing logic)
        if (record.children && Array.isArray(record.children)) {
          const hasMatchingChild = record.children.some((child: any) => {
            if (dataIndex.includes('.')) {
              const keys = dataIndex.split('.');
              let val = child;
              for (const key of keys) {
                if (!val) return false;
                val = val[key];
              }
              return val ? val.toString().toLowerCase().includes(searchValue) : false;
            }
            return child[dataIndex]
              ? child[dataIndex].toString().toLowerCase().includes(searchValue)
              : false;
          });
          
          if (hasMatchingChild) {
            shouldExpand = true;
          }
        }
        
        // If parent matches or has matching children, expand it
        if (shouldExpand && record.children && record.children.length > 0) {
          keysToExpand.push(record.key.toString());
        }
      });
      
      setExpandedRowKeys(keysToExpand);
    } else {
      setExpandedRowKeys([]);
    }
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
    setSearchedColumn('');
    setExpandedRowKeys([]);
  };

  const handleGlobalSearch = (value: string) => {
    setGlobalSearchText(value);
    
    // Clear column-specific search when using global search
    if (value && value.trim()) {
      setSearchText('');
      setSearchedColumn('');
    }
    
    if (value && value.trim()) {
      const searchValue = value.toLowerCase();
      const keysToExpand: string[] = [];
      
      // Use the memoized processed data for search expansion
      const currentData = processedData;
      
      currentData.forEach((record: any) => {
        let shouldExpand = false;
        
        // Check if the parent task matches in any searchable field
        const fieldsToSearch = ['name', 'description', 'tcode'];
        const parentMatches = fieldsToSearch.some(field => 
          record[field] && record[field].toString().toLowerCase().includes(searchValue)
        );
        
        // Also check task type display value
        const taskTypeDisplay = record?.taskType === 'story' ? 'Task' : 'Subtask';
        const taskTypeMatches = taskTypeDisplay.toLowerCase().includes(searchValue);
        
        // Check group and status
        const groupMatches = record.group?.name && record.group.name.toLowerCase().includes(searchValue);
        const statusMatches = record.status && record.status.toLowerCase().includes(searchValue);
        
        if (parentMatches || taskTypeMatches || groupMatches || statusMatches) {
          shouldExpand = true;
        }
        
        // Check if any child matches
        if (record.children && Array.isArray(record.children)) {
          const hasMatchingChild = record.children.some((child: any) => {
            const childMatches = fieldsToSearch.some(field => 
              child[field] && child[field].toString().toLowerCase().includes(searchValue)
            );
            const childTaskTypeDisplay = child?.taskType === 'story' ? 'Task' : 'Subtask';
            const childTaskTypeMatches = childTaskTypeDisplay.toLowerCase().includes(searchValue);
            const childGroupMatches = child.group?.name && child.group.name.toLowerCase().includes(searchValue);
            const childStatusMatches = child.status && child.status.toLowerCase().includes(searchValue);
            return childMatches || childTaskTypeMatches || childGroupMatches || childStatusMatches;
          });
          
          if (hasMatchingChild) {
            shouldExpand = true;
          }
        }
        
        // If parent matches or has matching children, expand it
        if (shouldExpand && record.children && record.children.length > 0) {
          keysToExpand.push(record.key.toString());
        }
      });
      
      setExpandedRowKeys(keysToExpand);
    } else {
      setExpandedRowKeys([]);
    }
  };

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  const getColumnSearchProps = (dataIndex: string, title: string): any => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: string, record: any) => {
      const searchValue = value.toLowerCase();
      
      // Helper function to check if a record matches the search
      const recordMatches = (rec: any) => {
        if (dataIndex.includes('.')) {
          const keys = dataIndex.split('.');
          let val = rec;
          for (const key of keys) {
            if (!val) return false;
            val = val[key];
          }
          return val ? val.toString().toLowerCase().includes(searchValue) : false;
        }
        
        // Special handling for taskType - search the display value instead of stored value
        if (dataIndex === 'taskType') {
          const displayType = rec?.taskType === 'story' ? 'Task' : 'Subtask';
          return displayType.toLowerCase().includes(searchValue);
        }
        
        return rec[dataIndex]
          ? rec[dataIndex].toString().toLowerCase().includes(searchValue)
          : false;
      };

      // Check if the current record (parent) matches the search
      const parentMatches = recordMatches(record);
      
      // If parent matches, show the entire row (parent + all children)
      if (parentMatches) {
        return true;
      }

      // Check if any child/subtask matches (for parent tasks)
      if (record.children && Array.isArray(record.children)) {
        const hasMatchingChild = record.children.some((child: any) => recordMatches(child));
        // If any child matches, show the parent row (which includes all children)
        if (hasMatchingChild) {
          return true;
        }
      }

      // For child/subtask rows, check if they match individually
      // This handles the case where we're filtering subtask rows directly
      if (record.isSubTask) {
        return recordMatches(record);
      }

      return false;
    },
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: string) => {
      const searchWords = [];
      if (searchedColumn === dataIndex && searchText) {
        searchWords.push(searchText);
      }
      if (globalSearchText && (dataIndex === 'name' || dataIndex === 'description' || dataIndex === 'tcode')) {
        searchWords.push(globalSearchText);
      }

      return searchWords.length > 0 ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={searchWords}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      );
    },
  });

  const isEditing = (record: ExtendedTaskType) => String(record.id) === editingKey;

  const handleEditClick = (task: ExtendedTaskType) => {
    form.setFieldsValue({
      ...task,
      assineeId: (task.assignees as any[])?.map(user => user.id),
      dueDate: task.dueDate ? moment(task.dueDate) : null,
    });
    showModal(task);
  };

  const startEditing = (record: ExtendedTaskType) => {
    setEditingKey(String(record.id));
    form.setFieldsValue({
      dueDate: record.dueDate ? moment(record.dueDate) : null,
      assineeId: (record.assignees as any[])?.map(user => user.id),
      first: record.first,
      last: record.last,
    });
  };

  // Used for saving changes directly from the table
  const saveEdit = async (key: string) => {
    try {
      const values = await form.validateFields();
      
      const taskData = {
        dueDate: values.dueDate?.toISOString(),
        assineeId: values.assineeId,
        first: values.first,
        last: values.last,
        projectId: project.id,
        name: enhancedData.find(item => String(item.id) === key)?.name,
        description: enhancedData.find(item => String(item.id) === key)?.description,
        groupId: enhancedData.find(item => String(item.id) === key)?.group?.id,
        status: enhancedData.find(item => String(item.id) === key)?.status,
      };

      editTask(
        { id: key, payload: taskData },
        {
          onSuccess: () => {
            message.success("Task updated successfully");
            setEditingKey(null);
            if (onRefresh) onRefresh();
          },
          onError: (error: any) => {
            message.error(error.response?.data?.message || "Failed to update task");
          },
        }
      );
    } catch (err) {
      console.log('Validation Failed:', err);
    }
  };

  const handleSetDueDate = () => {
    if (selectedRowKeys.length > 0) {
      setIsDueDateModalVisible(true);
    }
  };

  const handleAssign = () => {
    if (selectedRowKeys.length > 0) {
      setIsAssigneeModalVisible(true);
    }
  };

  const handleDueDateOk = async () => {
    try {
      const values = await bulkForm.validateFields();
      bulkUpdateTasks({
        taskIds: selectedRowKeys.map(String),
        dueDate: values.dueDate?.toISOString(),
      },
      {
        onSuccess: () => {
          message.success("Tasks updated successfully");
          if (onRefresh) onRefresh();
        },
        onError: (error: any) => {
          message.error(error.response?.data?.message || "Failed to update tasks");
        },
      });
      setIsDueDateModalVisible(false);
      bulkForm.resetFields();
    } catch (err) {
      console.log('Bulk Due Date Update Failed:', err);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(
      { id: taskId },
      {
        onSuccess: () => {
          message.success("Task deleted successfully");
          if (onRefresh) onRefresh();
        },
        onError: (error: any) => {
          message.error(error.response?.data?.message || "Failed to delete task");
        },
      }
    );
  };

  const handleAssigneeOk = async () => {
    try {
      const values = await bulkForm.validateFields();
      bulkUpdateTasks({
        taskIds: selectedRowKeys.map(String),
        assigneeIds: values.assigneeIds,
      },
      {
        onSuccess: () => {
          message.success("Tasks assigned successfully");
          if (onRefresh) onRefresh();
        },
        onError: (error: any) => {
          message.error(error.response?.data?.message || "Failed to assign tasks");
        },
      });
      setIsAssigneeModalVisible(false);
      bulkForm.resetFields();
    } catch (err) {
      console.log('Bulk Assignee Update Failed:', err);
    }
  };

  const handleMarkComplete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one task to mark as complete");
      return;
    }

    const userId = (profile as any)?.id;
    if (!userId) {
      message.error("Unable to identify current user");
      return;
    }

    // Check if user can mark complete (has permission OR is project lead)
    if (!canMarkComplete) {
      message.error("You don't have permission to mark tasks as complete");
      return;
    }

    // Filter selected tasks to only include those that are in_progress
    const selectedTasks = enhancedData.filter(task => 
      selectedRowKeys.includes(task.id)
    );

    const eligibleTasks = selectedTasks.filter(task => 
      task.status === 'in_progress'
    );

    if (eligibleTasks.length === 0) {
      message.warning("No eligible tasks selected. Tasks must be in progress status to be marked complete.");
      return;
    }

    if (eligibleTasks.length < selectedTasks.length) {
      const eligibleCount = eligibleTasks.length;
      const totalSelected = selectedTasks.length;
      message.info(`Only ${eligibleCount} out of ${totalSelected} selected tasks are eligible to be marked complete`);
    }

    markTasksComplete({
      taskIds: eligibleTasks.map(task => task.id),
      completedBy: userId
    }, {
      onSuccess: (data) => {
        console.log("Mark complete response:", data);
        
        // Handle success cases
        if (data?.success && data.success.length > 0) {
          message.success(`${data.success.length} task(s) marked as complete`);
        }
        
        // Handle errors - these are validation errors, not API errors
        if (data?.errors && data.errors.length > 0) {
          console.log("Validation errors found:", data.errors);
          
          // Show a notification for multiple errors or use individual messages for single errors
          if (data.errors.length > 1) {
            notification.error({
              message: `${data.errors.length} Task(s) Failed to Complete`,
              description: (
                <div>
                  {data.errors.map((error: any, index: number) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      <strong>{error.taskName}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              ),
              duration: 8,
              placement: 'topRight',
            });
          } else {
            // Single error - use message for simpler display
            const error = data.errors[0];
            message.error(`${error.taskName}: ${error.error}`, 6);
          }
        }
        
        // Show summary if no success but also no errors (edge case)
        if (!data?.success?.length && !data?.errors?.length) {
          message.info("No tasks were processed");
        }
        
        setSelectedRowKeys([]);
        if (onRefresh) onRefresh();
      },
      onError: (error: any) => {
        console.error("Mark complete API error:", error);
        // This handles actual HTTP/network errors
        const errorMessage = error.response?.data?.message || "Failed to mark tasks as complete";
        message.error(errorMessage);
      },
    });
  };

  const handleSingleMarkComplete = (task: ExtendedTaskType) => {
    const userId = (profile as any)?.id;
    if (!userId) {
      message.error("Unable to identify current user");
      return;
    }

    if (task.status !== 'in_progress') {
      message.warning("Only tasks that are in progress can be marked as complete");
      return;
    }

    // Check if user can mark complete (has permission OR is project lead)
    if (!canMarkComplete) {
      message.error("You don't have permission to mark tasks as complete");
      return;
    }

    markTasksComplete({
      taskIds: [task.id],
      completedBy: userId
    }, {
      onSuccess: (data) => {
        console.log("Single mark complete response:", data);
        
        // Handle success cases
        if (data?.success && data.success.length > 0) {
          message.success(`Task "${task.name}" marked as complete`);
        }
        
        // Handle validation errors
        if (data?.errors && data.errors.length > 0) {
          console.log("Single task validation errors:", data.errors);
          const error = data.errors[0];
          notification.error({
            message: 'Task Completion Failed',
            description: `${error.taskName}: ${error.error}`,
            duration: 6,
            placement: 'topRight',
          });
        }
        
        // Show info if no processing occurred
        if (!data?.success?.length && !data?.errors?.length) {
          message.info("Task was not processed");
        }
        
        if (onRefresh) onRefresh();
      },
      onError: (error: any) => {
        console.error("Single mark complete API error:", error);
        const errorMessage = error.response?.data?.message || "Failed to mark task as complete";
        message.error(errorMessage);
      },
    });
  };

  const handleFirstVerify = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one task to verify");
      return;
    }

    const userId = (profile as any)?.id;
    if (!userId) {
      message.error("Unable to identify current user");
      return;
    }

    const selectedTasks = enhancedData.filter(task => 
      selectedRowKeys.includes(task.id)
    );

    const eligibleTasks = selectedTasks.filter(task => 
      task.status === 'done' && !task.firstVerifiedBy
    );

    if (eligibleTasks.length === 0) {
      message.warning("No eligible tasks selected. Tasks must be completed and not already verified.");
      return;
    }

    if (eligibleTasks.length < selectedTasks.length) {
      const eligibleCount = eligibleTasks.length;
      const totalSelected = selectedTasks.length;
      message.info(`Only ${eligibleCount} out of ${totalSelected} selected tasks are eligible for first verification`);
    }

    firstVerifyTasks({
      taskIds: eligibleTasks.map(task => task.id),
      firstVerifiedBy: userId
    }, {
      onSuccess: (data) => {
        if (data?.success && data.success.length > 0) {
          message.success(`${data.success.length} task(s) first verified`);
        }
        
        if (data?.errors && data.errors.length > 0) {
          if (data.errors.length > 1) {
            notification.error({
              message: `${data.errors.length} Task(s) Failed First Verification`,
              description: (
                <div>
                  {data.errors.map((error: any, index: number) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      <strong>{error.taskName}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              ),
              duration: 8,
              placement: 'topRight',
            });
          } else {
            const error = data.errors[0];
            message.error(`${error.taskName}: ${error.error}`, 6);
          }
        }
        
        setSelectedRowKeys([]);
        if (onRefresh) onRefresh();
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to verify tasks";
        message.error(errorMessage);
      },
    });
  };

  const handleSecondVerify = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one task for second verification");
      return;
    }

    const userId = (profile as any)?.id;
    if (!userId) {
      message.error("Unable to identify current user");
      return;
    }

    const selectedTasks = enhancedData.filter(task => 
      selectedRowKeys.includes(task.id)
    );

    const eligibleTasks = selectedTasks.filter(task => 
      task.firstVerifiedBy && !task.secondVerifiedBy
    );

    if (eligibleTasks.length === 0) {
      message.warning("No eligible tasks selected. Tasks must be first verified and not already second verified.");
      return;
    }

    if (eligibleTasks.length < selectedTasks.length) {
      const eligibleCount = eligibleTasks.length;
      const totalSelected = selectedTasks.length;
      message.info(`Only ${eligibleCount} out of ${totalSelected} selected tasks are eligible for second verification`);
    }

    secondVerifyTasks({
      taskIds: eligibleTasks.map(task => task.id),
      secondVerifiedBy: userId
    }, {
      onSuccess: (data) => {
        if (data?.success && data.success.length > 0) {
          message.success(`${data.success.length} task(s) second verified`);
        }
        
        if (data?.errors && data.errors.length > 0) {
          if (data.errors.length > 1) {
            notification.error({
              message: `${data.errors.length} Task(s) Failed Second Verification`,
              description: (
                <div>
                  {data.errors.map((error: any, index: number) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      <strong>{error.taskName}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              ),
              duration: 8,
              placement: 'topRight',
            });
          } else {
            const error = data.errors[0];
            message.error(`${error.taskName}: ${error.error}`, 6);
          }
        }
        
        setSelectedRowKeys([]);
        if (onRefresh) onRefresh();
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to verify tasks";
        message.error(errorMessage);
      },
    });
  };

  const handleSingleFirstVerify = (task: ExtendedTaskType) => {
    const userId = (profile as any)?.id;
    if (!task.id || !userId) {
      message.error("Missing task ID or user ID");
      return;
    }

    if (task.status !== 'done') {
      message.warning("Only completed tasks can be first verified");
      return;
    }

    if (task.firstVerifiedBy) {
      message.warning("Task is already first verified");
      return;
    }

    if (!hasFirstVerifyPermission) {
      message.error("You don't have permission to verify tasks");
      return;
    }

    firstVerifyTasks({
      taskIds: [task.id],
      firstVerifiedBy: userId
    }, {
      onSuccess: (data: any) => {
        console.log("First verify response:", data);
        
        if (data && data.success && data.success.length > 0) {
          message.success(`Task first verified successfully`);
        }
        
        if (data && data.errors && data.errors.length > 0) {
          data.errors.forEach((error: any) => {
            notification.error({
              message: "First Verification Failed",
              description: error.error,
              duration: 5
            });
          });
        }
      },
      onError: (error: any) => {
        console.error("First verify API error:", error);
        
        const errorMessage = error.response?.data?.message || "Failed to first verify task";
        notification.error({
          message: "First Verification Failed",
          description: errorMessage,
          duration: 5
        });
      }
    });
  };

  const handleSingleSecondVerify = (task: ExtendedTaskType) => {
    const userId = (profile as any)?.id;
    if (!task.id || !userId) {
      message.error("Missing task ID or user ID");
      return;
    }

    if (task.status !== 'done') {
      message.warning("Only completed tasks can be second verified");
      return;
    }

    if (!task.firstVerifiedBy) {
      message.warning("Task must be first verified before second verification");
      return;
    }

    if (task.secondVerifiedBy) {
      message.warning("Task is already second verified");
      return;
    }

    if (!hasSecondVerifyPermission) {
      message.error("You don't have permission to second verify tasks");
      return;
    }

    secondVerifyTasks({
      taskIds: [task.id],
      secondVerifiedBy: userId
    }, {
      onSuccess: (data: any) => {
        console.log("Second verify response:", data);
        
        if (data && data.success && data.success.length > 0) {
          message.success(`Task second verified successfully`);
        }
        
        if (data && data.errors && data.errors.length > 0) {
          data.errors.forEach((error: any) => {
            notification.error({
              message: "Second Verification Failed",
              description: error.error,
              duration: 5
            });
          });
        }
      },
      onError: (error: any) => {
        console.error("Second verify API error:", error);
        
        const errorMessage = error.response?.data?.message || "Failed to second verify task";
        notification.error({
          message: "Second Verification Failed",
          description: errorMessage,
          duration: 5
        });
      }
    });
  };

  const columns = useMemo(
    () => [
      { 
        title: "ID", 
        dataIndex: "tcode", 
        key: "id",
        sorter: (a: ExtendedTaskType, b: ExtendedTaskType) => (a.tcode?.localeCompare(b.tcode || '') || 0),
        sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
        ...getColumnSearchProps('tcode', 'ID'),
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: (a: ExtendedTaskType, b: ExtendedTaskType) => a.name.localeCompare(b.name),
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        ...getColumnSearchProps('name', 'Name'),
        render: (name: string, record: ExtendedTaskType) => {
          const searchWords = [];
          if (searchedColumn === 'name' && searchText) {
            searchWords.push(searchText);
          }
          if (globalSearchText) {
            searchWords.push(globalSearchText);
          }

          const content = searchWords.length > 0 ? (
            <Highlighter
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={searchWords}
              autoEscape
              textToHighlight={name ? name.toString() : ''}
            />
          ) : name;

          return (
            <div className="flex items-center justify-between gap-2">
              <span style={{ 
                fontWeight: record.isSubTask ? 'normal' : '500',
                fontSize: record.isSubTask ? '0.9em' : '1em',
                color: record.isSubTask ? '#666' : '#000',
                paddingLeft: record.isSubTask ? '16px' : '0'
              }}>
                {record.isSubTask && <span style={{ color: '#999', marginRight: '4px' }}>↳</span>}
                <Link to={`/projects/${record.projectId}/tasks/${record.id}`} className="text-blue-600">
                  {content}
                </Link>
              </span>
              {record.subTasks?.length > 0 && (
                <span>
                  <svg fill="none" width={16} height={16} viewBox="0 0 16 16" role="presentation">
                    <path
                      stroke="currentcolor"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 8h10c.69 0 1.25.56 1.25 1.25V13c0 .69-.56 1.25-1.25 1.25H9.25C8.56 14.25 8 13.69 8 13V3c0-.69-.56-1.25-1.25-1.25H3c-.69 0-1.25.56-1.25 1.25v3.75C1.75 7.44 2.31 8 3 8Z"
                    />
                  </svg>
                </span>
              )}
            </div>
          );
        },
      },
      {
        title: "Task Type",
        dataIndex: "taskType",
        key: "taskType",
        sorter: (a: any, b: any) => {
          const typeA = a.taskType || '';
          const typeB = b.taskType || '';
          return typeA.localeCompare(typeB);
        },
        sortOrder: sortedInfo.columnKey === 'taskType' && sortedInfo.order,
        ...getColumnSearchProps('taskType', 'Task Type'),
        render: (_: any, record: any) => {
          // Display mapping: story -> Task, task -> Subtask
          const displayType = record?.taskType === 'story' ? 'Task' : 'Subtask';
          const badgeColor = record?.taskType === 'story' ? 'blue' : 'green';
          const badgeText = record?.taskType === 'story' ? 'T' : 'S';
          
          const searchWords = [];
          if (searchedColumn === 'taskType' && searchText) {
            searchWords.push(searchText);
          }
          if (globalSearchText) {
            searchWords.push(globalSearchText);
          }

          const content = searchWords.length > 0 ? (
            <Highlighter
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={searchWords}
              autoEscape
              textToHighlight={displayType}
            />
          ) : displayType;
          
          return (
            <>
              <Badge color={badgeColor} count={badgeText} /> &nbsp;
              {content}
            </>
          );
        },
      },
      {
        title: "Group",
        dataIndex: "group",
        key: "group",
        sorter: (a: ExtendedTaskType, b: ExtendedTaskType) => {
          const groupNameA = a.group?.name || '';
          const groupNameB = b.group?.name || '';
          return groupNameA.localeCompare(groupNameB);
        },
        sortOrder: sortedInfo.columnKey === 'group' && sortedInfo.order,
        render: (group: ExtendedTaskType["group"]) => group?.name ?? "---",
        ...getColumnSearchProps('group.name', 'Group'),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        sorter: (a: ExtendedTaskType, b: ExtendedTaskType) => {
          const statusA = a.status || '';
          const statusB = b.status || '';
          return statusA.localeCompare(statusB);
        },
        sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
        ...getColumnSearchProps('status', 'Status'),
        render: (status: string) => (
          <Badge count={status} color="#52c41a" style={{ cursor: "pointer" }} />
        ),
      },
      {
        title: "Assignee",
        dataIndex: "assignees",
        key: "assignees",
        editable: true,
        render: (assignees: UserType[], record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item name="assineeId" style={{ margin: 0 }} rules={[{ required: false }]}>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select assignees"
                options={project.users.map(user => ({
                  label: user.username,
                  value: user.id,
                }))}
                optionFilterProp="label"
                showSearch
              />
            </Form.Item>
          ) : (
            <Avatar.Group
              max={{
                count: 2,
                style: { color: "#f56a00", backgroundColor: "#fde3cf", cursor: "pointer" },
                popover: { trigger: "click" },
              }}
            >
              {assignees?.map((user) => (
                <Tooltip key={user.id} title={user.username} placement="top">
                  <Avatar style={{ backgroundColor: "#87d068" }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>
          );
        },
      },
      {
        title: "Due date",
        dataIndex: "dueDate",
        key: "dueDate",
        editable: true,
        sorter: (a: ExtendedTaskType, b: ExtendedTaskType) => {
          if (!a.dueDate) return -1;
          if (!b.dueDate) return 1;
          return moment(a.dueDate).unix() - moment(b.dueDate).unix();
        },
        sortOrder: sortedInfo.columnKey === 'dueDate' && sortedInfo.order,
        render: (dueDate: string | null, record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item name="dueDate" style={{ margin: 0 }} rules={[{ required: false }]}>
              <DatePicker />
            </Form.Item>
          ) : (
            dueDate ? new Date(dueDate).toLocaleDateString() : "---"
          );
        },
      },
      // Conditionally include verification columns only when data has done tasks
      ...(dataHasDoneTasks ? [
        // First Verification column  
        {
          title: "1st Verify",
          key: "firstVerify",
          render: (_: any, record: ExtendedTaskType) => {
            // Don't show verification for TODO (open) or Doing (in_progress) status
            if (record.status === 'open' || record.status === 'in_progress') {
              return null;
            }
            
            const canFirstVerify = record.status === 'done' && !record.firstVerifiedBy;
            const isFirstVerified = record.firstVerifiedBy;
            const isSecondVerified = record.secondVerifiedBy;
            
            if (isSecondVerified) {
              return (
                <Tooltip title={`First verified by ${record.firstVerifiedBy || 'Unknown'} at ${record.firstVerifiedAt ? new Date(record.firstVerifiedAt).toLocaleString() : 'Unknown time'}, Second verified by ${record.secondVerifiedBy || 'Unknown'} at ${record.secondVerifiedAt ? new Date(record.secondVerifiedAt).toLocaleString() : 'Unknown time'}`}>
                  <Tag color="blue" style={{ fontSize: '11px' }}>
                    ✓✓ 2nd Done
                  </Tag>
                </Tooltip>
              );
            }
            
            if (isFirstVerified) {
              return (
                <Tooltip title={`First verified by ${record.firstVerifiedBy || 'Unknown'} at ${record.firstVerifiedAt ? new Date(record.firstVerifiedAt).toLocaleString() : 'Unknown time'}`}>
                  <Tag color="blue" style={{ fontSize: '11px' }}>
                    ✓ 1st Done
                  </Tag>
                </Tooltip>
              );
            }
            
            if (!canFirstVerify) {
              return (
                <Tag color="default" style={{ fontSize: '11px' }}>
                  Not Ready
                </Tag>
              );
            }

            // Only show verify button for users with permission
            if (!hasFirstVerifyPermission) {
              return (
                <Tag color="orange" style={{ fontSize: '11px' }}>
                  No Permission
                </Tag>
              );
            }

            return (
              <Button
                type="link"
                size="small"
                onClick={() => handleSingleFirstVerify(record)}
                disabled={isFirstVerifying}
                style={{ 
                  color: '#1890ff', 
                  padding: '0 4px',
                  fontSize: '12px',
                  height: 'auto'
                }}
              >
                ✓ 1st Verify
              </Button>
            );
          },
        },
        // Second Verification column
        {
          title: "2nd Verify",
          key: "secondVerify",
          render: (_: any, record: ExtendedTaskType) => {
            // Don't show verification for TODO (open) or Doing (in_progress) status
            if (record.status === 'open' || record.status === 'in_progress') {
              return null;
            }
            
            const canSecondVerify = record.firstVerifiedBy && !record.secondVerifiedBy;
            const isSecondVerified = record.secondVerifiedBy;
            
            if (isSecondVerified) {
              return (
                <Tooltip title={`Second verified by ${record.secondVerifiedBy || 'Unknown'} at ${record.secondVerifiedAt ? new Date(record.secondVerifiedAt).toLocaleString() : 'Unknown time'}`}>
                  <Tag color="green" style={{ fontSize: '11px' }}>
                    ✓ 2nd Done
                  </Tag>
                </Tooltip>
              );
            }
            
            if (!canSecondVerify) {
              return (
                <Tag color="default" style={{ fontSize: '11px' }}>
                  Not Ready
                </Tag>
              );
            }

            // Only show verify button for users with permission
            if (!hasSecondVerifyPermission) {
              return (
                <Tag color="orange" style={{ fontSize: '11px' }}>
                  No Permission
                </Tag>
              );
            }

            return (
              <Button
                type="link"
                size="small"
                onClick={() => handleSingleSecondVerify(record)}
                disabled={isSecondVerifying}
                style={{ 
                  color: '#722ed1', 
                  padding: '0 4px',
                  fontSize: '12px',
                  height: 'auto'
                }}
              >
                ✓ 2nd Verify
              </Button>
            );
          },
        }
      ] : []),
      {
        title: "",
        key: "action",
        width: 120,
        render: (_: unknown, record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <span>
              <Button
                type="primary"
                onClick={() => saveEdit(String(record.id))} // Using the more robust saveEdit
                style={{ marginRight: 8 }}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Save
              </Button>
              <Button onClick={() => setEditingKey(null)} disabled={isUpdating}>
                Cancel
              </Button>
            </span>
          ) : (
            <Space>
              <Button
                type="primary"
                onClick={() => handleEditClick(record)}
                icon={<EditOutlined />}
              />
              {record.status === 'in_progress' && canMarkComplete && (
                <Popconfirm
                  title="Mark Task Complete"
                  description="Are you sure you want to mark this task as complete? This action will validate worklog and subtask requirements."
                  onConfirm={() => handleSingleMarkComplete(record)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ style: { backgroundColor: "#52c41a", borderColor: "#52c41a" } }}
                >
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                    loading={isMarkingComplete}
                  />
                </Popconfirm>
              )}
              {canDeleteTask && (
                <Popconfirm
                  title="Delete Task"
                  description="Are you sure you want to delete this task? This action cannot be undone."
                  onConfirm={() => handleDeleteTask(String(record.id))}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              )}
            </Space>
          );
        },
      },
    ],
    [editingKey, project.users, project.id, isUpdating, canDeleteTask, sortedInfo, searchText, searchedColumn, isFirstVerifying, isSecondVerifying, isMarkingComplete, globalSearchText, dataHasDoneTasks, hasFirstVerifyPermission, hasSecondVerifyPermission, canMarkComplete]
  );

  const mergedColumns = columns.map(col => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record: ExtendedTaskType) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        onDoubleClick: () => !editingKey && startEditing(record),
      }),
    };
  });

  const rowSelection: TableProps<ExtendedTaskType>["rowSelection"] = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: ExtendedTaskType[]) => {
      console.log(`selectedRowKeys: ${newSelectedRowKeys}`, 'selectedRows: ', selectedRows);
      
      // Validate parent-child selection consistency
      const validatedKeys: React.Key[] = [];
      const validatedRows: any[] = [];
      let hasConflicts = false;
      
      newSelectedRowKeys.forEach((key, index) => {
        const row = selectedRows[index];
        const keyStr = key.toString();
        
        // Check if this is a child key (contains parent-child format)
        if (keyStr.includes('-')) {
          const [parentId] = keyStr.split('-');
          
          // If parent is also selected, skip the child
          if (newSelectedRowKeys.some(k => k.toString() === parentId)) {
            console.warn(`Skipping child task "${row.name}" because parent is already selected`);
            hasConflicts = true;
            return;
          }
        } else {
          // This is a parent key, check if any children are selected
          const hasSelectedChildren = newSelectedRowKeys.some(k => 
            k.toString().startsWith(`${keyStr}-`)
          );
          
          if (hasSelectedChildren) {
            console.warn(`Skipping parent task "${row.name}" because children are already selected`);
            hasConflicts = true;
            return;
          }
        }
        
        validatedKeys.push(key);
        validatedRows.push(row);
      });
      
      if (hasConflicts) {
        message.warning('Cannot select both parent and child tasks. Only individual tasks or their subtasks can be selected.');
      }
      
      setSelectedRowKeys(validatedKeys);
    },
    getCheckboxProps: (record: ExtendedTaskType) => ({
      name: record.name,
    }),
  };

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              type="primary"
              onClick={handleSetDueDate}
              disabled={selectedRowKeys.length === 0}
            >
              Set Due Date
            </Button>
            <Button
              type="primary"
              onClick={handleAssign}
              disabled={selectedRowKeys.length === 0}
            >
              Assign
            </Button>
            
            {/* Show Mark Complete only for in_progress tasks and only when no open tasks are selected */}
            {hasInProgressTasks && !hasOpenTasks && canMarkComplete && (
              <Button
                type="primary"
                onClick={handleMarkComplete}
                disabled={selectedRowKeys.length === 0}
                loading={isMarkingComplete}
                icon={<CheckOutlined />}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Mark Complete
              </Button>
            )}
            
            {/* Show verification options only for done tasks and only when no open tasks are selected */}
            {hasDoneTasks && !hasOpenTasks && (
              <>
                <Button
                  onClick={handleFirstVerify}
                  disabled={selectedRowKeys.length === 0}
                  loading={isFirstVerifying}
                  icon={<CheckCircleOutlined />}
                  style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", color: "white" }}
                >
                  First Verify
                </Button>
                <Button
                  onClick={handleSecondVerify}
                  disabled={selectedRowKeys.length === 0}
                  loading={isSecondVerifying}
                  icon={<CheckCircleOutlined />}
                  style={{ backgroundColor: "#722ed1", borderColor: "#722ed1", color: "white" }}
                >
                  Second Verify
                </Button>
              </>
            )}
            
            <Input.Search
              placeholder="🔍 Search all fields (name, type, group, status)..."
              allowClear
              value={globalSearchText}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              onSearch={(value) => handleGlobalSearch(value)}
              style={{ width: 350 }}
              size="middle"
            />
          </div>
          {(searchText || globalSearchText) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1890ff', fontSize: '14px' }}>
                🔍 {globalSearchText ? 'Global search' : 'Column search'}: "{searchText || globalSearchText}"
                {globalSearchText && <span style={{ fontSize: '12px', color: '#999' }}> (auto-expanded matching parents)</span>}
              </span>
              <Button 
                size="small" 
                onClick={() => {
                  setSearchText('');
                  setSearchedColumn('');
                  setGlobalSearchText('');
                  setExpandedRowKeys([]);
                }}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
        <Form form={form} component={false}>
          <Table
            loading={loading}
            components={{ body: { cell: EditableCell } }}
            columns={mergedColumns}
            dataSource={enhancedData}
            rowSelection={rowSelection}
            rowKey="id"
            size="small"
            bordered
            onChange={handleTableChange}
            expandable={{
              defaultExpandAllRows: false,
              expandRowByClick: false,
              indentSize: 20,
              expandedRowKeys: expandedRowKeys,
              onExpandedRowsChange: (expandedKeys) => setExpandedRowKeys(expandedKeys as string[]),
              // Only show expandable icon for rows that have children
              rowExpandable: (record: any) => Array.isArray(record.children) && record.children.length > 0
            }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              defaultPageSize: 30,
              pageSizeOptions: [30, 50, 100, 200],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              ...(searchText && { 
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items (filtered)` 
              })
            }}
          />
        </Form>
      </Card>

      <Modal
        title="Set Due Date for Selected Tasks"
        open={isDueDateModalVisible}
        onOk={handleDueDateOk}
        onCancel={() => setIsDueDateModalVisible(false)}
      >
        <Form form={bulkForm} layout="vertical">
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Assign Users to Selected Tasks"
        open={isAssigneeModalVisible}
        onOk={handleAssigneeOk}
        onCancel={() => setIsAssigneeModalVisible(false)}
      >
        <Form form={bulkForm} layout="vertical">
          <Form.Item name="assigneeIds" label="Assignees">
            <Select
              mode="multiple"
              placeholder="Select assignees"
              options={project.users.map(user => ({
                label: user.username,
                value: user.id,
              }))}
              optionFilterProp="label"
              showSearch
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const EditableCell: React.FC<any> = ({
  editing,
  dataIndex,
  title,
  record,
  children,
  onDoubleClick,
  ...restProps
}) => {
  return (
    <td {...restProps} onDoubleClick={onDoubleClick}>
      {editing ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          {children}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default TaskTable;