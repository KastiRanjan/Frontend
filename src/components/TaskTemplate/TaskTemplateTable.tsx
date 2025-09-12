
import { useDeleteTaskTemplate } from "@/hooks/taskTemplate/useTaskTemplateDelete";
import { DeleteOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Modal, Table, TableProps, Input, Space, message } from "antd";
import _ from "lodash";
import { useState, useRef } from "react";
import TableToolbar from "../Table/TableToolbar";
import { TaskTemplateType } from "@/types/taskTemplate";
import { TaskType } from "@/types/task";
import Highlighter from 'react-highlight-words';
import MoveTemplateModalList from "./MoveTemplateModalList";
import MoveTemplateModal from "./MoveTemplateModal";

const column = ({ showModal, handleDelete, sortedInfo, searchText, searchedColumn, getColumnSearchProps }: any): TableProps<TaskTemplateType>["columns"] => [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a: TaskTemplateType, b: TaskTemplateType) => a.name.localeCompare(b.name),
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    ...getColumnSearchProps('name', 'Name'),
    render: (text: string, record: any) => (
      <span style={{ 
        fontWeight: record.isSubTask ? 'normal' : '500',
        fontSize: record.isSubTask ? '0.9em' : '1em',
        color: record.isSubTask ? '#666' : '#000',
        paddingLeft: record.isSubTask ? '16px' : '0'
      }}>
        {record.isSubTask && <span style={{ color: '#999', marginRight: '4px' }}>↳</span>}
        {text}
      </span>
    ),
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
      
      return (
        <>
          <Badge color={badgeColor} count={badgeText} /> &nbsp;
          {displayType}
        </>
      );
    },
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    ...getColumnSearchProps('description', 'Description'),
  },
  {
    title: "Action",
    key: "action",
    width: 100,
    fixed: 'right',
    render: (_: any, record: any) => (
      <div className="flex gap-2">
        <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
        </Button>
        <Button color="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
        </Button>
      </div>
    ),
  },
];

interface TaskTemplateTableProps {
  handleCancel: () => void;
  isModalOpen: boolean;
  setIsRowSelected: (value: boolean) => void;
  setCheckedRows: (value: string[]) => void
  taskList?: any
  isPending?: boolean;
  showModal?: (task?: TaskType) => void
}

const TaskTemplateTable = ({
  handleCancel,
  isModalOpen,
  setCheckedRows,
  setIsRowSelected,
  taskList = [],
  isPending,
  showModal
}: TaskTemplateTableProps) => {
  const [modal, contextHolder] = Modal.useModal();
  const [selectedRow, setSelectedRow] = useState<TaskTemplateType[]>([]);
  const { mutate: mutateDelete } = useDeleteTaskTemplate();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const searchInput = useRef<any>(null);

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    
    // Auto-expand rows that have matching children
    if (selectedKeys[0]) {
      const searchValue = selectedKeys[0].toLowerCase();
      const keysToExpand: string[] = [];
      
      // Use the computed finalData for search expansion
      const currentData = [...expandedData, ...standaloneTasks];
      
      currentData.forEach((record: any) => {
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
            keysToExpand.push(record.key.toString());
          }
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
    setExpandedRowKeys([]);
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
        return rec[dataIndex]
          ? rec[dataIndex].toString().toLowerCase().includes(searchValue)
          : false;
      };

      // Check if the current record matches
      if (recordMatches(record)) {
        return true;
      }

      // Check if any child/subtask matches (for parent tasks)
      if (record.children && Array.isArray(record.children)) {
        return record.children.some((child: any) => recordMatches(child));
      }

      return false;
    },
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  // Transform the data to have proper parent-child relationships
  // Stories are main tasks, tasks are subtasks
  console.log('Original taskList:', taskList);
  
  // First, let's see what each task looks like
  taskList?.forEach((task: any, index: number) => {
    console.log(`Task ${index}:`, {
      id: task.id,
      name: task.name,
      taskType: task.taskType,
      parentTask: task.parentTask,
      subTasks: task.subTasks,
      // Log all keys to see what fields are available
      allKeys: Object.keys(task)
    });
  });
  
  const expandedData: any = _.chain(taskList)
    .filter((task: any) => task.taskType === 'story') // Only get stories (which display as Tasks) as main tasks
    .map((story: any) => {
      // Use the subTasks relation directly from backend
      const subTasks = story.subTasks || [];
      
      console.log(`Task "${story.name}" has ${subTasks.length} subtasks:`, subTasks);
      
      // Map subtasks to proper format
      const children = subTasks.map((subTask: any) => ({
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
  
  // Also add any standalone tasks (tasks without parentTask)
  const standaloneTasks = taskList
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
  
  console.log('Final processed data:', finalData);

  const rowSelection: TableProps<TaskTemplateType>["rowSelection"] = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      
      // Validate parent-child selection consistency
      const validatedKeys: React.Key[] = [];
      const validatedRows: any[] = [];
      let hasConflicts = false;
      
      selectedRowKeys.forEach((key, index) => {
        const row = selectedRows[index];
        const keyStr = key.toString();
        
        // Check if this is a child key (contains parent-child format)
        if (keyStr.includes('-')) {
          const [parentId] = keyStr.split('-');
          
          // If parent is also selected, skip the child
          if (selectedRowKeys.some(k => k.toString() === parentId)) {
            console.warn(`Skipping child task "${row.name}" because parent is already selected`);
            hasConflicts = true;
            return;
          }
        } else {
          // This is a parent key, check if any children are selected
          const hasSelectedChildren = selectedRowKeys.some(k => 
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
      
      setSelectedRow(validatedRows);
      setIsRowSelected(validatedKeys.length > 0);
      setCheckedRows(validatedKeys.map(key => key.toString()));
    },
    onSelect: (record, selected, selectedRows) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log(selected, selectedRows, changeRows);
    },
    getCheckboxProps: () => ({
      // Disable checkbox if parent or child is already selected
      disabled: false, // We'll handle this in onChange instead for better UX
    }),
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Are you sure you want to delete this task group?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        mutateDelete({ id });
      },
    })
  };

  return (
    <>
      <Card>
        <TableToolbar>
          <Button
            type="primary"
            onClick={() => showModal && showModal()}
          >
            Add Task
          </Button>
        </TableToolbar>
        <Table
          loading={isPending}
          rowSelection={{ ...rowSelection, checkStrictly: false }}
          columns={column({ 
            showModal, 
            handleDelete, 
            sortedInfo, 
            searchText, 
            searchedColumn, 
            getColumnSearchProps 
          })}
          dataSource={finalData || []}
          expandable={{
            defaultExpandAllRows: false,
            expandRowByClick: false,
            indentSize: 20,
            expandedRowKeys: expandedRowKeys,
            onExpandedRowsChange: (expandedKeys) => setExpandedRowKeys(expandedKeys as string[]),
            // Only show expandable icon for rows that have children
            rowExpandable: (record: any) => Array.isArray(record.children) && record.children.length > 0
          }}
          size="small"
          bordered
          onChange={handleTableChange}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      {isModalOpen &&(
        <MoveTemplateModal
          selectedRow={selectedRow}
          handleCancel={handleCancel}
          isModalOpen={isModalOpen}
        />
      )}
      {contextHolder}
    </>
  );
};

export default TaskTemplateTable;
