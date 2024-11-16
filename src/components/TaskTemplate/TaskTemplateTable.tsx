import { Task } from "@/pages/Project/type";
import { TaskTemplate } from "@/pages/TaskGroup/type";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Modal, Space, Table, TableProps } from "antd";
import { useState } from "react";
import MoveTemplateModal from "./MoveTemplateModal";
import { useDeleteTaskTemplate } from "@/hooks/taskTemplate/useTaskTemplateDelete";
import _ from "lodash";
import TableToolbar from "../Table/TableToolbar";

const column = (showModal: any, handleDelete: any): TableProps<TaskTemplate>["columns"] => [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Epic",
    dataIndex: "epic",
    key: "taskType",
    render: (_: any, record: any) =>
      <>
        <Badge color={record?.taskType === 'story' ? 'gray' : 'green'} count={record?.taskType[0]} /> &nbsp;
        {record?.taskType}
      </>,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
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
  taskList?: any
  isPending?: boolean;
  showModal?: (task?: Task) => void
}

const TaskTemplateTable = ({
  handleCancel,
  isModalOpen,
  setIsRowSelected,
  taskList = [],
  isPending,
  showModal
}: TaskTemplateTableProps) => {
  const [modal, contextHolder] = Modal.useModal();
  const [selectedRow, setSelectedRow] = useState<TaskTemplate[]>([]);
  const { mutate: mutateDelete } = useDeleteTaskTemplate()


  const expandedData = _.map(taskList, (task) => {
    const nestedTasks = _.map(task.subTasks || [], (subTask) => {
      return _.omit({ ...subTask, key: subTask.id, parentTask: subTask.parentTask, children: subTask.subTasks }, 'subTasks'); // Rename and omit the old 'subTask' key
    });
    return _.omit({ ...task, key: task.id, parentTask: task.parentTask, children: nestedTasks }, 'subTasks'); // Rename and omit the old 'subTask' key
  });

  console.log(expandedData);


  const rowSelection: TableProps<TaskTemplate>["rowSelection"] = {
    // onChange: (_selectedRowKeys: React.Key[], selectedRows: TaskTemplate[]) => {
    //   console.log('_selectedRowKeys', selectedRows);
    //   setSelectedRow(selectedRows);
    //   setIsRowSelected(true);
    // },
    // getCheckboxProps: (record: TaskTemplate) => ({
    //   name: record.name,
    // }),
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    onSelect: (record, selected, selectedRows) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log(selected, selectedRows, changeRows);
    },
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
            onClick={() => showModal()}
          >
            Add Task
          </Button>
        </TableToolbar>
        <Table
          loading={isPending}
          rowSelection={{ ...rowSelection, checkStrictly: false }}
          columns={column(showModal, handleDelete)}
          dataSource={expandedData || []}
          size="small"
          bordered
        />
      </Card>

      {contextHolder}

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
