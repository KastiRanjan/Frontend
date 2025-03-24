import { useEditTask } from "@/hooks/task/useEditTask";
import { useBulkUpdateTasks } from "@/hooks/task/useBulkUpdateTasks";
import { UserType } from "@/hooks/user/type";
import { TaskType } from "@/types/task";
import { EditOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Form, Table, TableProps, Tooltip, DatePicker, Select, Switch, Modal } from "antd";
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
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { mutate: editTask } = useEditTask();
  const { mutate: bulkUpdateTasks } = useBulkUpdateTasks();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isDueDateModalVisible, setIsDueDateModalVisible] = useState(false);
  const [isAssigneeModalVisible, setIsAssigneeModalVisible] = useState(false);

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
      editTask({ payload: updatedTask, id: key });
      setEditingKey(null);
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
      });
      setIsDueDateModalVisible(false);
      bulkForm.resetFields();
    } catch (err) {
      console.log('Bulk Due Date Update Failed:', err);
    }
  };

  const handleAssigneeOk = async () => {
    try {
      const values = await bulkForm.validateFields();
      bulkUpdateTasks({
        taskIds: selectedRowKeys.map(String),
        assigneeIds: values.assigneeIds,
      });
      setIsAssigneeModalVisible(false);
      bulkForm.resetFields();
    } catch (err) {
      console.log('Bulk Assignee Update Failed:', err);
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
        width: 100,
        render: (_: unknown, record: ExtendedTaskType) => {
          const editable = isEditing(record);
          return editable ? (
            <span>
              <Button type="primary" onClick={() => saveEdit(record.id)} style={{ marginRight: 8 }}>
                Save
              </Button>
              <Button onClick={() => setEditingKey(null)}>Cancel</Button>
            </span>
          ) : (
            <Button type="primary" onClick={() => handleEditClick(record)} icon={<EditOutlined />} />
          );
        },
      },
    ],
    [editingKey, project.users]
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
        >
          Assign
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