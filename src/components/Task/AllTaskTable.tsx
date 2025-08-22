import { useTasks } from "@/hooks/task/useTask";
import { TaskType } from "@/types/task";
import {
  Avatar,
  Col,
  Row,
  Table,
  TableProps,
} from "antd";
import { useMemo } from "react";
import { Link } from "react-router-dom";

// import { useSession } from "@/context/SessionContext";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

const AllTaskTable = ({ status, userId, userRole, onEdit }: { status: string, userId?: number, userRole?: string, onEdit?: (task: TaskType) => void }) => {
  // Removed unused open and form state
  // Removed unused mutate from useEditTask
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

  // Removed unused onClose
  const columns = useMemo(  
    () => [
      {
        title: "ID",
        dataIndex: "tcode",
        key: "tcode",
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
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
    []
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
        />
      </Col>
    </Row>
  );
};

export default AllTaskTable;
