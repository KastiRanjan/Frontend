import { useEditTask } from "@/hooks/task/useEditTask";
import { UserType } from "@/hooks/user/type";
import { TaskType } from "@/types/task";
import { EditOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Form, Table, TableProps, Tooltip, DatePicker, Select, Switch } from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

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
}

const TaskTable = ({ data, showModal, project }: TaskTableProps) => {
  console.log(project)
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { mutate: editTask } = useEditTask();
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const enhancedData: ExtendedTaskType[] = useMemo(
    () => data.map(task => ({ ...task, projectId: project.id })),
    [data, project.id]
  );

  const isEditing = (record: ExtendedTaskType) => record.id === editingKey;

  const handleEditClick = (task: ExtendedTaskType) => {
    form.setFieldsValue({
      ...task,
      assineeId: task.assignees?.map(user => user.id),
      dueDate: task.dueDate ? moment(task.dueDate) : null,
    });
    showModal(task);
  };

  const startEditing = (record: ExtendedTaskType) => {
    setEditingKey(record.id);
    form.setFieldsValue({
      dueDate: record.dueDate ? moment(record.dueDate) : null,
      assineeId: record.assignees?.map(user => user.id),
      first: record.first,
      last: record.last,
    });
  };

  const saveEdit = async (key: string) => {
    try {
      const row = await form.validateFields();
      const updatedTask = {
        ...enhancedData.find(item => item.id === key),
        ...row,
        assignees: row.assineeId?.map((id: string) => 
          project.users.find(user => user.id === id)
        ).filter(Boolean),
        dueDate: row.dueDate?.toISOString(),
      };
      console.log(updatedTask);
      editTask(updatedTask);
      setEditingKey(null);
    } catch (err) {
      console.log('Validation Failed:', err);
    }
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "tcode", key: "id" },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
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
        render: (group: ExtendedTaskType["group"]) => group?.name ?? "---",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
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
            <Form.Item
              name="assineeId"
              style={{ margin: 0 }}
              rules={[{ required: false }]}
            >
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select assignees"
                options={project.users.map(user => ({
                  label: user.username,
                  value: user.id,
                }))}
                optionFilterProp="label" // Allows searching by username
                showSearch // Enables search functionality
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
        render: (dueDate: string | null, record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="dueDate"
              style={{ margin: 0 }}
              rules={[{ required: false }]}
            >
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
        render: (firstVerification: boolean | undefined, record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="first"
              style={{ margin: 0 }}
              valuePropName="checked"
            >
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
        render: (secondVerification: boolean | undefined, record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="last"
              style={{ margin: 0 }}
              valuePropName="checked"
            >
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
        width: 100,
        render: (_: unknown, record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <span>
              <Button
                type="primary"
                onClick={() => saveEdit(record.id)}
                style={{ marginRight: 8 }}
              >
                Save
              </Button>
              <Button onClick={() => setEditingKey(null)}>
                Cancel
              </Button>
            </span>
          ) : (
            <Button
              type="primary"
              onClick={() => handleEditClick(record)}
              icon={<EditOutlined />}
            />
          );
        },
      },
    ],
    [editingKey, project.users] // Added project.users as dependency
  );

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
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
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record: ExtendedTaskType) => ({
      name: record.name,
    }),
  };

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        columns={mergedColumns}
        dataSource={enhancedData}
        rowSelection={rowSelection}
        rowKey="id"
        size="small"
        bordered
      />
    </Form>
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
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
        >
          {children}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default TaskTable;