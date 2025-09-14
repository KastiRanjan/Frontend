import { useTasks } from "@/hooks/task/useTask";
import { useMarkTasksComplete } from "@/hooks/task/useMarkTasksComplete";
import { useFirstVerifyTasks, useSecondVerifyTasks } from "@/hooks/task/useVerifyTasks";
import { TaskType } from "@/types/task";
import { useSession } from "@/context/SessionContext";
import { EditOutlined, SearchOutlined, CheckOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
  Avatar,
  Col,
  Row,
  Table,
  Input,
  Button,
  Space,
  Badge,
  Card,
  message,
  notification,
  TableProps,
  Tooltip,
  Tag
} from "antd";
import { useMemo, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Highlighter from 'react-highlight-words';
import _ from "lodash";

const AllTaskTable = ({ status, userId, userRole, onEdit }: { status: string, userId?: number, userRole?: string, onEdit?: (task: TaskType) => void }) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({ 
    columnKey: 'name', 
    order: 'ascend' 
  });
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [globalSearchText, setGlobalSearchText] = useState('');
  const searchInput = useRef<any>(null);
  
  // Bulk action state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // Hooks
  const { data, isPending } = useTasks({ status });
  const { mutate: markTasksComplete, isPending: isMarkingComplete } = useMarkTasksComplete();
  const { mutate: firstVerifyTasks, isPending: isFirstVerifying } = useFirstVerifyTasks();
  const { mutate: secondVerifyTasks, isPending: isSecondVerifying } = useSecondVerifyTasks();
  const { profile } = useSession();
  // Filter tasks assigned to the current user (works for array of user objects or empty)
  const filteredData = userId !== undefined
    ? (data || []).filter((task: TaskType) => {
        const assignees = task.assignees;
        if (!assignees || !Array.isArray(assignees) || assignees.length === 0) return false;
        // Assignees is an array of user objects
        return assignees.some((user: any) => user?.id?.toString() === userId.toString());
      })
    : data;

  // Get selected tasks data for conditional rendering
  const selectedTasks = (filteredData || []).filter((task: TaskType) => 
    selectedRowKeys.includes(task.id)
  );

  // Check if any selected tasks are open (hide bulk actions for open status)
  const hasOpenTasks = selectedTasks.some((task: TaskType) => 
    task.status === 'open'
  );

  // Check if any selected tasks are in_progress (show only mark complete for these)
  const hasInProgressTasks = selectedTasks.some((task: TaskType) => 
    task.status === 'in_progress'
  );

  // Check if any selected tasks are done (show verification options for these)
  const hasDoneTasks = selectedTasks.some((task: TaskType) => 
    task.status === 'done'
  );

  // Check if current data contains any done tasks (for column visibility)
  const dataHasDoneTasks = (filteredData || []).some((task: TaskType) => 
    task.status === 'done'
  );

  // Bulk action handlers
  const handleMarkComplete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one task to mark as complete");
      return;
    }

    const userIdForComplete = (profile as any)?.id;
    if (!userIdForComplete) {
      message.error("Unable to identify current user");
      return;
    }

    // Filter tasks that user can mark complete (either has permission or is project lead)
    const eligibleTasks = selectedTasks.filter((task: any) => 
      task.status === 'in_progress' && getCanMarkCompleteForTask(task)
    );

    if (eligibleTasks.length === 0) {
      message.warning("No eligible tasks selected. You must have permission or be the project lead, and tasks must be in progress.");
      return;
    }

    if (eligibleTasks.length < selectedTasks.length) {
      const eligibleCount = eligibleTasks.length;
      const totalSelected = selectedTasks.length;
      message.info(`Only ${eligibleCount} out of ${totalSelected} selected tasks are eligible to be marked complete`);
    }

    markTasksComplete({
      taskIds: eligibleTasks.map((task: any) => task.id),
      completedBy: userIdForComplete
    }, {
      onSuccess: (data) => {
        if (data?.success && data.success.length > 0) {
          message.success(`${data.success.length} task(s) marked as complete`);
        }
        
        if (data?.errors && data.errors.length > 0) {
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
            const error = data.errors[0];
            message.error(`${error.taskName}: ${error.error}`, 6);
          }
        }
        
        setSelectedRowKeys([]);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to mark tasks as complete";
        message.error(errorMessage);
      },
    });
  };

  const handleFirstVerify = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one task to verify");
      return;
    }

    const userIdForVerify = (profile as any)?.id;
    if (!userIdForVerify) {
      message.error("Unable to identify current user");
      return;
    }

    firstVerifyTasks({
      taskIds: selectedRowKeys.map(key => Number(key)),
      firstVerifiedBy: userIdForVerify
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

    const userIdForVerify = (profile as any)?.id;
    if (!userIdForVerify) {
      message.error("Unable to identify current user");
      return;
    }

    secondVerifyTasks({
      taskIds: selectedRowKeys.map(key => Number(key)),
      secondVerifiedBy: userIdForVerify
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
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to verify tasks";
        message.error(errorMessage);
      },
    });
  };

  // Check if user has permission for first verification
  const hasFirstVerifyPermission = (profile as any)?.role?.permission?.includes("first-verify-task");

  // Check if user has permission for second verification
  const hasSecondVerifyPermission = (profile as any)?.role?.permission?.includes("second-verify-task");

  // Check if user can mark complete for a specific task (has permission OR is project lead)
  const getCanMarkCompleteForTask = useCallback((task: any) => {
    const hasMarkCompletePermission = (profile as any)?.role?.permission?.includes("mark-complete-task");
    const isProjectLead = (profile as any)?.id === task.project?.projectLead?.id;
    return hasMarkCompletePermission || isProjectLead;
  }, [profile]);

  // Handle single task completion
  const handleSingleComplete = (task: any) => {
    if (!getCanMarkCompleteForTask(task)) {
      message.error('You do not have permission to mark this task as complete');
      return;
    }

    const userIdForComplete = (profile as any)?.id;
    if (!userIdForComplete) {
      message.error("Unable to identify current user");
      return;
    }

    if (task.status !== 'in_progress') {
      message.warning("Only tasks that are in progress can be marked as complete");
      return;
    }

    markTasksComplete({
      taskIds: [task.id],
      completedBy: userIdForComplete
    }, {
      onSuccess: (data) => {
        if (data?.success && data.success.length > 0) {
          message.success("Task marked as complete successfully!");
        }
        
        if (data?.errors && data.errors.length > 0) {
          const error = data.errors[0];
          message.error(`${error.taskName}: ${error.error}`, 6);
        }
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to mark task as complete";
        message.error(errorMessage);
      },
    });
  };

  // Handle single task first verification
  const handleSingleFirstVerify = (task: any) => {
    const userId = (profile as any)?.id;
    if (!task.id || !userId) {
      message.error("Unable to identify current user or task");
      return;
    }

    if (task.status !== 'done') {
      message.warning("Task must be completed before verification");
      return;
    }

    if (task.firstVerifiedBy) {
      message.info("Task is already first verified");
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
        if (data?.success && data.success.length > 0) {
          message.success("Task first verified successfully!");
        }
        
        if (data?.errors && data.errors.length > 0) {
          const error = data.errors[0];
          message.error(`${error.taskName}: ${error.error}`, 6);
        }
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to verify task";
        message.error(errorMessage);
      }
    });
  };

  // Handle single task second verification
  const handleSingleSecondVerify = (task: any) => {
    const userId = (profile as any)?.id;
    if (!task.id || !userId) {
      message.error("Unable to identify current user or task");
      return;
    }

    if (task.status !== 'done') {
      message.warning("Task must be completed before verification");
      return;
    }

    if (!task.firstVerifiedBy) {
      message.warning("Task must be first verified before second verification");
      return;
    }

    if (task.secondVerifiedBy) {
      message.info("Task is already second verified");
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
        if (data?.success && data.success.length > 0) {
          message.success("Task second verified successfully!");
        }
        
        if (data?.errors && data.errors.length > 0) {
          const error = data.errors[0];
          message.error(`${error.taskName}: ${error.error}`, 6);
        }
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to verify task";
        message.error(errorMessage);
      }
    });
  };








  // Memoized data processing for hierarchical structure
  const { processedData, finalFilteredData } = useMemo(() => {
    // Transform the data to have proper parent-child relationships
    console.log('Original taskList:', filteredData);
    
    const expandedData: any = _.chain(filteredData)
      .filter((task: any) => task.taskType === 'story') // Only get stories (which display as Tasks) as main tasks
      .map((story: any) => {
        // Use the subTasks relation directly from backend if available
        const subTasks = story.subTasks || [];
        
        // If no subTasks relation, find child tasks manually
        const manualSubTasks = subTasks.length === 0 
          ? (filteredData || []).filter((task: any) => task.parentTask?.id === story.id)
          : [];
        
        const allSubTasks = [...subTasks, ...manualSubTasks];
        
        console.log(`Task "${story.name}" has ${allSubTasks.length} subtasks:`, allSubTasks);
        
        // Sort subtasks alphabetically by name and map to proper format
        const children = allSubTasks
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
          .map((subTask: any) => ({
            ...subTask,
            key: `${story.id}-${subTask.id}`, // Unique key for subtask
            isSubTask: true
          }));
        
        // Return task (story type) with its subtasks as children
        return {
          ...story,
          key: story.id,
          children: children.length > 0 ? children : undefined
        };
      })
      .value();
    
    // Also add any standalone tasks with taskType 'task' that have no parent
    const standaloneTasks = (filteredData || [])
      .filter((task: any) => 
        task.taskType === 'task' && !task.parentTask
      )
      .map((task: any) => ({
        ...task,
        key: task.id,
        isStandalone: true
      }));
    
    console.log('Standalone tasks:', standaloneTasks);
    
    // Combine stories with their subtasks and standalone tasks
    const finalData = [...expandedData, ...standaloneTasks];
    
    // Apply default sorting by name (alphabetical) if no other sorting is applied
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
      // Default to name sorting if no specific sort is applied
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
    
    // Apply global search filter
    const filtered = globalSearchText ? 
      sortedData.filter((record: any) => {
        const searchValue = globalSearchText.toLowerCase();
        
        // Check parent task fields
        const fieldsToSearch = ['name', 'tcode', 'priority'];
        const parentMatches = fieldsToSearch.some(field => 
          record[field] && record[field].toString().toLowerCase().includes(searchValue)
        );
        
        // Check task type display value
        const taskTypeDisplay = record?.taskType === 'story' ? 'Task' : 'Subtask';
        const taskTypeMatches = taskTypeDisplay.toLowerCase().includes(searchValue);
        
        // Check project name
        const projectMatches = record.project?.name && record.project.name.toLowerCase().includes(searchValue);
        
        if (parentMatches || taskTypeMatches || projectMatches) {
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
            const childProjectMatches = child.project?.name && child.project.name.toLowerCase().includes(searchValue);
            return childMatches || childTaskTypeMatches || childProjectMatches;
          });
          
          return hasMatchingChild;
        }
        
        return false;
      }) : sortedData;
    
    console.log('Final processed data:', filtered);
    console.log('Default sorting applied (columnKey:', sortedInfo.columnKey, ', order:', sortedInfo.order, ')');
    
    return {
      processedData: sortedData,
      finalFilteredData: filtered
    };
  }, [filteredData, sortedInfo, globalSearchText]);
  // Removed unused onClose
  const showDrawer = () => {
    // Drawer logic removed; function kept for future use
  };

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
        const fieldsToSearch = ['name', 'tcode', 'priority'];
        const parentMatches = fieldsToSearch.some(field => 
          record[field] && record[field].toString().toLowerCase().includes(searchValue)
        );
        
        // Also check task type display value
        const taskTypeDisplay = record?.taskType === 'story' ? 'Task' : 'Subtask';
        const taskTypeMatches = taskTypeDisplay.toLowerCase().includes(searchValue);
        
        // Check project name
        const projectMatches = record.project?.name && record.project.name.toLowerCase().includes(searchValue);
        
        if (parentMatches || taskTypeMatches || projectMatches) {
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
            const childProjectMatches = child.project?.name && child.project.name.toLowerCase().includes(searchValue);
            return childMatches || childTaskTypeMatches || childProjectMatches;
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
      if (globalSearchText && (dataIndex === 'name' || dataIndex === 'tcode' || dataIndex === 'priority')) {
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

  // Removed unused onClose
  const columns = useMemo(  
    () => [
      {
        title: "ID",
        dataIndex: "tcode",
        key: "tcode",
        sorter: (a: TaskType, b: TaskType) => (a.tcode?.localeCompare(b.tcode || '') || 0),
        sortOrder: sortedInfo.columnKey === 'tcode' && sortedInfo.order,
        ...getColumnSearchProps('tcode', 'ID'),
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: (a: TaskType, b: TaskType) => a.name.localeCompare(b.name),
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        ...getColumnSearchProps('name', 'Name'),
        render: (name: string, record: any) => {
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
            <span
              onClick={showDrawer}
              className="cursor-pointer hover:underline"
              style={{ 
                fontWeight: record.isSubTask ? 'normal' : '500',
                fontSize: record.isSubTask ? '0.9em' : '1em',
                color: record.isSubTask ? '#666' : '#000',
                paddingLeft: record.isSubTask ? '16px' : '0'
              }}
            >
              {record.isSubTask && <span style={{ color: '#999', marginRight: '4px' }}>↳</span>}
              {content}
            </span>
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
        title: "Project",
        dataIndex: "project",
        key: "project",
        sorter: (a: TaskType, b: TaskType) => {
          const projNameA = a.project?.name || '';
          const projNameB = b.project?.name || '';
          return projNameA.localeCompare(projNameB);
        },
        sortOrder: sortedInfo.columnKey === 'project' && sortedInfo.order,
        ...getColumnSearchProps('project.name', 'Project'),
        render: (_: any, record: any) => {
          return (
            <Link
              to={`/projects/${record.project?.id}`}
              className="text-blue-600"
            >
              {record.project?.name}
            </Link>
          );
        },
      },
      {
        title: "Assignee",
        dataIndex: "assignees",
        key: "assignees",
        render: (_: any, record: TaskType) => {
          const assignees = record.assignees;
          if (!assignees || !Array.isArray(assignees) || assignees.length === 0) return null;
          return (
            <Avatar.Group
              max={{
                count: 2,
                style: {
                  color: "#f56a00",
                  backgroundColor: "#fde3cf",
                  cursor: "pointer",
                },
                popover: { trigger: "click" },
              }}
            >
              {assignees.map((user: any) => (
                <Avatar key={user.id} style={{ backgroundColor: "#87d068" }}>
                  {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                </Avatar>
              ))}
            </Avatar.Group>
          );
        },
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        sorter: (a: TaskType, b: TaskType) => {
          const priorityA = a.priority || '';
          const priorityB = b.priority || '';
          return priorityA.localeCompare(priorityB);
        },
        sortOrder: sortedInfo.columnKey === 'priority' && sortedInfo.order,
        ...getColumnSearchProps('priority', 'Priority'),
      },
      // Conditionally include verification columns only when data has done tasks
      ...(dataHasDoneTasks ? [
        // First Verification column  
        {
          title: "1st Verify",
          key: "firstVerify",
          render: (_: any, record: TaskType) => {
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
                  Ready
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
          render: (_: any, record: TaskType) => {
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
                  Ready
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
      // Edit button column (only for non-auditjunior/auditsenior)
      ...(userRole !== "auditjunior" && userRole !== "auditsenior"
        ? [{
            title: "Actions",
            key: "actions",
            render: (_: any, record: TaskType) => (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => onEdit && onEdit(record)} />
                {record.status === 'in_progress' && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleSingleComplete(record)}
                    disabled={isMarkingComplete}
                    icon={<CheckOutlined />}
                    style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                  />
                )}
              </Space>
            ),
          }]
        : []),
    ],
    [sortedInfo, searchText, searchedColumn, onEdit, userRole, globalSearchText, dataHasDoneTasks, hasFirstVerifyPermission, hasSecondVerifyPermission, isFirstVerifying, isSecondVerifying]
  );
  // const handleChange = (value: string) => {
  //   console.log(`selected ${value}`);
  // };

  // Removed unused onFinish

  const rowSelection: TableProps<TaskType>["rowSelection"] = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: TaskType[]) => {
      console.log('Selected row keys:', selectedRowKeys, selectedRows);
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record: TaskType) => ({
      name: record.name,
    }),
  };

  return (
    <Row gutter={8}>
      <Col span={24}>
        <Card>
          {/* Bulk Action Buttons - Show based on task status */}
          {selectedRowKeys.length > 0 && !hasOpenTasks && (
            <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #d9d9d9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1890ff' }}>
                  {selectedRowKeys.length} task(s) selected:
                </span>
                
                {/* Show Mark Complete only for in_progress tasks */}
                {hasInProgressTasks && (
                  <Button 
                    type="primary" 
                    onClick={handleMarkComplete}
                    disabled={isMarkingComplete}
                    loading={isMarkingComplete}
                  >
                    Mark Complete
                  </Button>
                )}
                
                {/* Show verification options only for done tasks */}
                {hasDoneTasks && (
                  <>
                    {hasFirstVerifyPermission && (
                      <Button 
                        onClick={handleFirstVerify}
                        disabled={isFirstVerifying}
                        loading={isFirstVerifying}
                        icon={<CheckCircleOutlined />}
                        style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", color: "white" }}
                      >
                        1st Verify
                      </Button>
                    )}
                    {hasSecondVerifyPermission && (
                      <Button 
                        onClick={handleSecondVerify}
                        disabled={isSecondVerifying}
                        loading={isSecondVerifying}
                        icon={<CheckCircleOutlined />}
                        style={{ backgroundColor: "#722ed1", borderColor: "#722ed1", color: "white" }}
                      >
                        2nd Verify
                      </Button>
                    )}
                  </>
                )}
                
                <Button 
                  size="small"
                  onClick={() => setSelectedRowKeys([])}
                  style={{ marginLeft: 'auto' }}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
          
          {/* Search Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Input.Search
                placeholder="🔍 Search all fields (name, ID, project, type)..."
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
          <Table
            loading={isPending}
            columns={columns}
            dataSource={finalFilteredData}
            size="small"
            rowKey={"id"}
            bordered
            onChange={handleTableChange}
            rowSelection={rowSelection}
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
        </Card>
      </Col>
    </Row>
  );
};

export default AllTaskTable;
