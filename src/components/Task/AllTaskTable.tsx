import { useTasks } from "@/hooks/task/useTask";
import { TaskType } from "@/types/task";
import {
  Avatar,
  Col,
  Row,
  Table,
  TableProps,
  Input,
  Button,
  Space,
  Badge,
  Card
} from "antd";
import { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";

// import { useSession } from "@/context/SessionContext";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import Highlighter from 'react-highlight-words';
import _ from "lodash";

interface ExtendedTaskType extends TaskType {
  key?: string;
  children?: ExtendedTaskType[];
  isSubTask?: boolean;
  isStandalone?: boolean;
}

const AllTaskTable = ({ status, userId, userRole, onEdit }: { status: string, userId?: number, userRole?: string, onEdit?: (task: TaskType) => void }) => {
  // Removed unused open and form state
  // Removed unused mutate from useEditTask
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({ 
    columnKey: 'name', 
    order: 'ascend' 
  });
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [globalSearchText, setGlobalSearchText] = useState('');
  const searchInput = useRef<any>(null);
  
  const { data, isPending } = useTasks({ status });
  // Filter tasks assigned to the current user (works for array of user objects or empty)
  const filteredData = userId !== undefined
    ? (data || []).filter((task: TaskType) => {
        const assignees = task.assignees;
        if (!assignees || !Array.isArray(assignees) || assignees.length === 0) return false;
        // Assignees is an array of user objects
        return assignees.some((user: any) => user?.id?.toString() === userId.toString());
      })
    : data;

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
      // Edit button column (only for non-auditjunior/auditsenior)
      ...(userRole !== "auditjunior" && userRole !== "auditsenior"
        ? [{
            title: "Edit",
            key: "edit",
            render: (_: any, record: TaskType) => (
              <Button icon={<EditOutlined />} onClick={() => onEdit && onEdit(record)} />
            ),
          }]
        : []),
    ],
    [sortedInfo, searchText, searchedColumn, onEdit, userRole, globalSearchText]
  );
  // const handleChange = (value: string) => {
  //   console.log(`selected ${value}`);
  // };

  // Removed unused onFinish

  const rowSelection: TableProps<TaskType>["rowSelection"] = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: TaskType[]) => {
      console.log(_selectedRowKeys, selectedRows);
    },
    getCheckboxProps: (record: TaskType) => ({
      name: record.name,
    }),
  };
  return (
    <Row gutter={8}>
      <Col span={24}>
        <Card>
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
            rowSelection={rowSelection}
            size="small"
            rowKey={"id"}
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
        </Card>
      </Col>
    </Row>
  );
};

export default AllTaskTable;
