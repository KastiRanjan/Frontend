
import { useDeleteTaskTemplate } from "@/hooks/taskTemplate/useTaskTemplateDelete";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Modal, Table, TableProps } from "antd";
import _ from "lodash";
import { useState } from "react";
import TableToolbar from "../Table/TableToolbar";
import MoveTemplateModal from "./MoveTemplateModal";
import { TaskTemplateType } from "@/types/taskTemplate";
import { TaskType } from "@/types/task";

const column = ({ showModal, handleDelete }: any): TableProps<TaskTemplateType>["columns"] => [
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
  showModal?: (task?: TaskType) => void
}

const TaskTemplateTable = ({
  handleCancel,
  isModalOpen,
  setCheckedRows,
  setIsRowSelected,
  taskList = [],
  isPending,
  showModal
}: TaskTemplateTableProps) => {
  const [modal, contextHolder] = Modal.useModal();
  const [selectedRow, setSelectedRow] = useState<TaskTemplateType[]>([]);
  const { mutate: mutateDelete } = useDeleteTaskTemplate()


  const expandedData: any = _.map(taskList, (task) => {
    const nestedTasks = _.map(task.subTasks || [], (subTask) => {
      return _.omit({ ...subTask, key: subTask.id, parentTask: subTask.parentTask, children: subTask.subTasks }, 'subTasks'); // Rename and omit the old 'subTask' key
    });
    return _.omit({ ...task, key: task.id, parentTask: task.parentTask, children: nestedTasks }, 'subTasks'); // Rename and omit the old 'subTask' key
  });



  const rowSelection: TableProps<TaskTemplateType>["rowSelection"] = {
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
      setSelectedRow(selectedRows);
      console.log("jj")
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
          columns={column({ showModal, handleDelete })}
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
