import { useTaskTemplate } from "@/hooks/taskTemplate/useTaskTemplate";
import usePagination from "@/hooks/usePagination";
import { TaskTemplate } from "@/pages/TaskGroup/type";
import { EditOutlined } from "@ant-design/icons";
import { Button, Table, TableProps } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import MoveTemplateModal from "./MoveTemplateModal";

const columns = () => [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Group",
    dataIndex: "description",
    key: "description",
    render: (_: any, record: any) => <>{record?.group?.name}</>,
  },

  {
    title: "Action",
    key: "action",
    render: (_: any, record: any) => (
      <Link to={`/task-template/edit/${record.id}`}>
        <Button type="primary" icon={<EditOutlined />}></Button>
      </Link>
    ),
  },
];

interface TaskTemplateTableProps {
  handleCancel: () => void;
  isModalOpen: boolean;
  setIsRowSelected: (value: boolean) => void;
}

const TaskTemplateTable = ({
  handleCancel,
  isModalOpen,
  setIsRowSelected,
}: TaskTemplateTableProps) => {
  const { page, limit, setPage, setLimit } = usePagination();
  const [selectedRow, setSelectedRow] = useState<TaskTemplate[]>([]);

  const { data: taskTemplate, isPending } = useTaskTemplate({ page, limit });

  const rowSelection: TableProps<TaskTemplate>["rowSelection"] = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: TaskTemplate[]) => {
      setSelectedRow(selectedRows);
      setIsRowSelected(true);
    },
    getCheckboxProps: (record: TaskTemplate) => ({
      name: record.name,
    }),
  };

  return (
    <>
      <Table
        loading={isPending}
        rowSelection={rowSelection}
        dataSource={taskTemplate || []}
        columns={columns()}
        rowKey="id"
        size="small"
        bordered
      />

      {isModalOpen && (
        <MoveTemplateModal
          selectedRow={selectedRow}
          handleCancel={handleCancel}
          isModalOpen={isModalOpen}
        />
      )}
    </>
  );
};

export default TaskTemplateTable;
