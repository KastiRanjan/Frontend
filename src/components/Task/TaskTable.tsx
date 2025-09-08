import { useEditTask } from "@/hooks/task/useEditTask";
import { useDeleteTask } from "@/hooks/task/useDeleteTask";
import { useBulkUpdateTasks } from "@/hooks/task/useBulkUpdateTasks";
import { UserType } from "@/hooks/user/type";
import { TaskType } from "@/types/task";
import { EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Form, Table, TableProps, Tooltip, DatePicker, Select, Switch, Modal, message, Popconfirm, Space, Input } from "antd";
import { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useSession } from "@/context/SessionContext";
import Highlighter from 'react-highlight-words';

interface ExtendedTaskType extends TaskType {
  first?: boolean;
  last?: boolean;
  projectId: string;
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
}

const TaskTable = ({ data, showModal, project, onRefresh }: TaskTableProps) => {
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { mutate: editTask, isPending: isUpdating } = useEditTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: bulkUpdateTasks } = useBulkUpdateTasks();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isDueDateModalVisible, setIsDueDateModalVisible] = useState(false);
  const [isAssigneeModalVisible, setIsAssigneeModalVisible] = useState(false);
  const { permissions } = useSession(); // Get permissions from session context
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({});
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

  const enhancedData: ExtendedTaskType[] = useMemo(
    () => data.map(task => ({ ...task, projectId: project.id })),
    [data, project.id]
  );

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
        render: (name: string, record: ExtendedTaskType) => (
          <div className="flex items-center justify-between gap-2">
            <Link to={`/projects/${record.projectId}/tasks/${record.id}`} className="text-blue-600">
              {name}
            </Link>
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
        ),
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
      {
        title: "1st Verification",
        dataIndex: "first",
        key: "first",
        width: 120,
        editable: true,
        sorter: (a: ExtendedTaskType, b: ExtendedTaskType) => {
          const aValue = a.first ? 1 : 0;
          const bValue = b.first ? 1 : 0;
          return aValue - bValue;
        },
        sortOrder: sortedInfo.columnKey === 'first' && sortedInfo.order,
        render: (firstVerification: boolean | undefined, record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item name="first" style={{ margin: 0 }} valuePropName="checked">
              <Switch />
            </Form.Item>
          ) : (
            <span style={{ color: firstVerification ? "#52c41a" : "#ff4d4f" }}>
              {firstVerification ? "✓" : "✗"}
            </span>
          );
        },
      },
      {
        title: "2nd Verification",
        dataIndex: "last",
        key: "last",
        width: 120,
        editable: true,
        sorter: (a: ExtendedTaskType, b: ExtendedTaskType) => {
          const aValue = a.last ? 1 : 0;
          const bValue = b.last ? 1 : 0;
          return aValue - bValue;
        },
        sortOrder: sortedInfo.columnKey === 'last' && sortedInfo.order,
        render: (secondVerification: boolean | undefined, record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item name="last" style={{ margin: 0 }} valuePropName="checked">
              <Switch />
            </Form.Item>
          ) : (
            <span style={{ color: secondVerification ? "#52c41a" : "#ff4d4f" }}>
              {secondVerification ? "✓" : "✗"}
            </span>
          );
        },
      },
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
    [editingKey, project.users, project.id, isUpdating, canDeleteTask, sortedInfo, searchText, searchedColumn]
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
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record: ExtendedTaskType) => ({
      name: record.name,
    }),
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={handleSetDueDate}
          disabled={selectedRowKeys.length === 0}
          style={{ marginRight: 8 }}
        >
          Set Due Date
        </Button>
        <Button
          type="primary"
          onClick={handleAssign}
          disabled={selectedRowKeys.length === 0}
          style={{ marginRight: 8 }}
        >
          Assign
        </Button>
        {/* Debug button to test permission */}
        <Button
          type="default"
          onClick={() => {
            console.log("Delete permission check:", canDeleteTask);
            console.log("All permissions:", permissions);
          }}
        >
          Check Delete Permission
        </Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          columns={mergedColumns}
          dataSource={enhancedData}
          rowSelection={rowSelection}
          rowKey="id"
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
      </Form>

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