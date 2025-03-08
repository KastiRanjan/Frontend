import { useEditTask } from "@/hooks/task/useEditTask";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { TaskType } from "@/types/task";
import { EditOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Form, Table, TableProps, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface TaskTableProps {
  data: TaskType[];
  showModal:any;
  project: {
    id: string;
    users: UserType[];
    projectLead: UserType;
  };
}

const TaskTable = ({ data, showModal}: TaskTableProps) => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  console.log(data);


  const handleEditClick = (task: TaskType) => {
    setSelectedTask(task);
    form.setFieldsValue(task);
    showModal(task);
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "tcode", key: "id" },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (name: string, record: TaskType) => (
          <div className="flex items-center justify-between gap-2">
            <Link to={`/projects/${record.project?.id}/tasks/${record.id}`} className="text-blue-600">
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
        render: (group: TaskType["group"]) => group?.name ?? "---",
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
        dataIndex: "users",
        key: "assignees",
        render: (users: UserType[]) => (
          <Avatar.Group
            max={{
              count: 2,
              style: { color: "#f56a00", backgroundColor: "#fde3cf", cursor: "pointer" },
              popover: { trigger: "click" },
            }}
          >
            {users?.map((user) => (
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
      { title: "Priority", dataIndex: "priority", key: "priority" },
      {
        title: "",
        key: "action",
        width: 50,
        render: (_: unknown, record: TaskType) => (
          <Button type="primary" onClick={() => handleEditClick(record)} icon={<EditOutlined />} />
        ),
      },
    ],
    []
  );

  const rowSelection: TableProps<TaskType>["rowSelection"] = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: TaskType[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record: TaskType) => ({
      name: record.name,
    }),
  };

  return (
    <>

      <Table
        columns={columns}
        dataSource={data}
        rowSelection={rowSelection}
        rowKey="id"
        size="small"
        bordered
      />
    </>
  );
};

export default TaskTable;