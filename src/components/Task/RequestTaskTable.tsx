import { useEditTask } from "@/hooks/task/useEditTask";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { TaskType } from "@/types/task";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Form,
  Table,
  TableProps,
  Tooltip,
  Input,
  Space
} from "antd";
import { useMemo, useState, useRef } from "react";
import Highlighter from 'react-highlight-words';

const RequestTaskTable = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { mutate } = useEditTask();
  const { data: users } = useUser({ status: "active", limit: 100, page: 1, keywords: "" });
  const [selectedTask, setSelectedTask] = useState<TaskType>({} as TaskType);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const searchInput = useRef<any>(null);

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


  const showModal = (record: TaskType) => {
    setSelectedTask(record);
    // Additional modal logic can go here
  };

  const columns = useMemo(
    () => [
      {
        title: "Task",
        dataIndex: "name",
        key: "name",
        sorter: (a: TaskType, b: TaskType) => a.name.localeCompare(b.name),
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        ...getColumnSearchProps('name', 'Task'),
      },
      {
        title: "Group",
        dataIndex: "group",
        key: "group",
        sorter: (a: TaskType, b: TaskType) => {
          const groupNameA = a.group?.name || '';
          const groupNameB = b.group?.name || '';
          return groupNameA.localeCompare(groupNameB);
        },
        sortOrder: sortedInfo.columnKey === 'group' && sortedInfo.order,
        ...getColumnSearchProps('group.name', 'Group'),
        render: (_: any, record: TaskType) => {
          return record.group?.name;
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        sorter: (a: TaskType, b: TaskType) => {
          const statusA = a.status || '';
          const statusB = b.status || '';
          return statusA.localeCompare(statusB);
        },
        sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
        ...getColumnSearchProps('status', 'Status'),
        render: (_: any, record: any) => {
          return (
            <>
              <Badge
                count={record.status}
                color="#52c41a"
                style={{ cursor: "pointer" }}
              />
            </>
          );
        }
      },
      {
        title: "Assignee",
        dataIndex: "assignees",
        key: "assignees",
        render: (_: any, record: TaskType) => {
          return (
            <>
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
                {record.assignees && record.assignees.length > 0 &&
                  record.assignees.map((user: any) => (
                    <Tooltip key={user.id} title={user.username} placement="top">
                      <Avatar style={{ backgroundColor: "#87d068" }}>
                        {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                      </Avatar>
                    </Tooltip>
                  ))}
              </Avatar.Group>
            </>
          );
        },
      },
      {
        title: "Due date",
        dataIndex: "dueDate",
        key: "dueDate",
        sorter: (a: TaskType, b: TaskType) => {
          if (!a.dueDate) return -1;
          if (!b.dueDate) return 1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        },
        sortOrder: sortedInfo.columnKey === 'dueDate' && sortedInfo.order,
        render: (_: any, record: any) => {
          return (
            <>
              {record?.dueDate ? <span>{new Date(record.dueDate).toLocaleDateString()}</span> : '---'}
            </>
          );
        }
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
      {
        title: "",
        key: "action",
        width: 50,
        render: (_: any, record: TaskType) => (
          <>
            <Button type="primary" onClick={() => showModal(record)} icon={<EditOutlined />}></Button>
          </>
        )
      }
    ],
    [sortedInfo, searchText, searchedColumn]
  );


  const onFinish = (values: any) => {
    mutate({ id: selectedTask.id, payload: values });
  };

  const rowSelection: TableProps<TaskType>["rowSelection"] = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: TaskType[]) => {
      console.log(_selectedRowKeys, selectedRows);
    },
    getCheckboxProps: (record: TaskType) => ({
      name: record.name,
    }),
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={[]}
        rowSelection={rowSelection}
        rowKey={"id"}
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
    </>
  );
};

export default RequestTaskTable;
