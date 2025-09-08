
import { useDeleteTaskTemplate } from "@/hooks/taskTemplate/useTaskTemplateDelete";
import { DeleteOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Modal, Table, TableProps, Input, Space } from "antd";
import _ from "lodash";
import { useState, useRef } from "react";
import TableToolbar from "../Table/TableToolbar";
import { TaskTemplateType } from "@/types/taskTemplate";
import { TaskType } from "@/types/task";
import Highlighter from 'react-highlight-words';
import MoveTemplateModalList from "./MoveTemplateModalList";
import MoveTemplateModal from "./MoveTemplateModal";

const column = ({ showModal, handleDelete, sortedInfo, searchText, searchedColumn, getColumnSearchProps }: any): TableProps<TaskTemplateType>["columns"] => [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a: TaskTemplateType, b: TaskTemplateType) => a.name.localeCompare(b.name),
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    ...getColumnSearchProps('name', 'Name'),
  },
  {
    title: "Epic",
    dataIndex: "epic",
    key: "taskType",
    sorter: (a: TaskTemplateType, b: TaskTemplateType) => {
      const typeA = a.taskType || '';
      const typeB = b.taskType || '';
      return typeA.localeCompare(typeB);
    },
    sortOrder: sortedInfo.columnKey === 'taskType' && sortedInfo.order,
    ...getColumnSearchProps('taskType', 'Epic'),
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
    ...getColumnSearchProps('description', 'Description'),
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
  setCheckedRows: (value: string[]) => void
  taskList?: any
  isPending?: boolean;
  taskGroup?: any;
  showModal?: (task?: TaskType) => void
}

const TaskTemplateTable = ({
  handleCancel,
  isModalOpen,
  setCheckedRows,
  taskGroup,
  setIsRowSelected,
  taskList = [],
  isPending,
  showModal
}: TaskTemplateTableProps) => {
  const [modal, contextHolder] = Modal.useModal();
  const [selectedRow, setSelectedRow] = useState<TaskTemplateType[]>([]);
  const { mutate: mutateDelete } = useDeleteTaskTemplate();
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

  const expandedData: any = _.map(taskList, (task) => {
    const nestedTasks = _.map(task.subTasks || [], (subTask) => {
      return _.omit({ ...subTask, key: subTask.id, parentTask: subTask.parentTask, children: subTask.subTasks }, 'subTasks'); // Rename and omit the old 'subTask' key
    });
    return _.omit({ ...task, key: task.id, parentTask: task.parentTask, children: nestedTasks }, 'subTasks'); // Rename and omit the old 'subTask' key
  });

  const rowSelection: TableProps<TaskTemplateType>["rowSelection"] = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setSelectedRow(selectedRows);
      setIsRowSelected(true);
      setCheckedRows(selectedRowKeys.map(key => key.toString()));
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
            onClick={() => showModal && showModal()}
          >
            Add Task
          </Button>
        </TableToolbar>
        <Table
          loading={isPending}
          rowSelection={{ ...rowSelection, checkStrictly: false }}
          columns={column({ 
            showModal, 
            handleDelete, 
            sortedInfo, 
            searchText, 
            searchedColumn, 
            getColumnSearchProps 
          })}
          dataSource={expandedData || []}
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
      </Card>

      {isModalOpen &&(
        <MoveTemplateModal
          selectedRow={selectedRow}
          handleCancel={handleCancel}
          isModalOpen={isModalOpen}
        />
      )}
      {contextHolder}
    </>
  );
};

export default TaskTemplateTable;
