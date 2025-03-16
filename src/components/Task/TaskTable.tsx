// TaskTable.tsx
import { useEditTask } from "@/hooks/task/useEditTask";
import { UserType } from "@/hooks/user/type";
import { TaskType } from "@/types/task";
import { EditOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Form, Table, TableProps, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

// Update the TaskType interface (you might need to do this in your types/task.ts file)
interface ExtendedTaskType extends TaskType {
  first?: boolean;
  last?: boolean;
  projectId: string; // Add projectId to the interface
}

interface TaskTableProps {
  data: TaskType[]; // Original data doesn't need projectId since we'll add it
  showModal: (task?: ExtendedTaskType) => void;
  project: {
    id: string;
    users: UserType[];
    projectLead: UserType;
  };
}

const TaskTable = ({ data, showModal, project }: TaskTableProps) => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { mutate: editTask } = useEditTask();

  // Add projectId to each task in the data
  const enhancedData: ExtendedTaskType[] = useMemo(
    () => data.map(task => ({ ...task, projectId: project.id })),
    [data, project.id]
  );

  const handleEditClick = (task: ExtendedTaskType) => {
    form.setFieldsValue({
      ...task,
      assineeId: task.assignees?.map(user => user.id),
      dueDate: task.dueDate ? moment(task.dueDate) : null,
    });
    showModal(task);
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
        render: (assignees: UserType[]) => (
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
        ),
      },
      {
        title: "Due date",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (dueDate: string | null) =>
          dueDate ? new Date(dueDate).toLocaleDateString() : "---",
      },
      {
        title: "1st Verification",
        dataIndex: "first",
        key: "first",
        width: 120,
        render: (firstVerification: boolean | undefined) => (
          <span style={{ color: firstVerification ? "#52c41a" : "#ff4d4f" }}>
            {firstVerification ? "✓" : "✗"}
          </span>
        ),
      },
      {
        title: "2nd Verification",
        dataIndex: "last",
        key: "last",
        width: 120,
        render: (secondVerification: boolean | undefined) => (
          <span style={{ color: secondVerification ? "#52c41a" : "#ff4d4f" }}>
            {secondVerification ? "✓" : "✗"}
          </span>
        ),
      },
      {
        title: "",
        key: "action",
        width: 50,
        render: (_: unknown, record: ExtendedTaskType) => (
          <Button type="primary" onClick={() => handleEditClick(record)} icon={<EditOutlined />} />
        ),
      },
    ],
    [] // No dependencies needed unless columns dynamically depend on something
  );

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
    <Table
      columns={columns}
      dataSource={enhancedData} // Use enhanced data with projectId
      rowSelection={rowSelection}
      rowKey="id"
      size="small"
      bordered
    />
  );
};

export default TaskTable;