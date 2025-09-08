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
  Space
} from "antd";
import { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";

// import { useSession } from "@/context/SessionContext";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import Highlighter from 'react-highlight-words';

const AllTaskTable = ({ status, userId, userRole, onEdit }: { status: string, userId?: number, userRole?: string, onEdit?: (task: TaskType) => void }) => {
  // Removed unused open and form state
  // Removed unused mutate from useEditTask
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const searchInput = useRef<any>(null);
  
  const { data } = useTasks({ status });
  // Filter tasks assigned to the current user (works for array of user objects or empty)
  const filteredData = userId !== undefined
    ? (data || []).filter((task: TaskType) => {
        const assignees = task.assignees;
        if (!assignees || !Array.isArray(assignees) || assignees.length === 0) return false;
        // Assignees is an array of user objects
        return assignees.some((user: any) => user?.id?.toString() === userId.toString());
      })
    : data;
  // Removed unused selectedTask and setSelectedTask
  const showDrawer = () => {
    // Drawer logic removed; function kept for future use
  };

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
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
      if (dataIndex.includes('.')) {
        const keys = dataIndex.split('.');
        let val = record;
        for (const key of keys) {
          if (!val) return false;
          val = val[key];
        }
        return val ? val.toString().toLowerCase().includes(value.toLowerCase()) : false;
      }
      return record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '';
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
        render: (_: any, record: TaskType) => (
          <>
            <span
              onClick={showDrawer}
              className="cursor-pointer hover:underline"
            >
              {record.name}
            </span>
          </>
        ),
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
        title: "Type",
        dataIndex: "taskType",
        key: "taskType",
        sorter: (a: TaskType, b: TaskType) => {
          const typeA = a.taskType || '';
          const typeB = b.taskType || '';
          return typeA.localeCompare(typeB);
        },
        sortOrder: sortedInfo.columnKey === 'taskType' && sortedInfo.order,
        ...getColumnSearchProps('taskType', 'Type'),
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
    [sortedInfo, searchText, searchedColumn, onEdit, userRole]
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
        <Table
          columns={columns}
          dataSource={filteredData}
          rowSelection={rowSelection}
          size="small"
          rowKey={"id"}
          bordered
          onChange={handleTableChange}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Col>
    </Row>
  );
};

export default AllTaskTable;
