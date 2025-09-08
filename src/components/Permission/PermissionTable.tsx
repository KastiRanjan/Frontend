import { EditOutlined, SyncOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Table, Space, Tooltip, message, Popconfirm, Input } from "antd";
import { useState, useRef } from "react";
import { usePermission } from "../../hooks/permission/usePermission";
import { useSyncPermissions } from "../../hooks/permission/useSyncPermissions";
import { useDeletePermission } from "../../hooks/permission/useDeletePermission";
import Highlighter from "react-highlight-words";

// Modified columns definition to be a function
const columns = (showEditModal: any, handleDelete: any, getColumnSearchProps: any, sortedInfo: any) => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 80,
    ...getColumnSearchProps('id', 'ID'),
    sorter: (a: any, b: any) => a.id.localeCompare(b.id),
    sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
    render: (id: string) => (
      <Tooltip title={id}>
        <span>{id.slice(0, 8)}...</span>
      </Tooltip>
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    ...getColumnSearchProps('description', 'Description'),
    sorter: (a: any, b: any) => a.description.localeCompare(b.description),
    sortOrder: sortedInfo.columnKey === 'description' && sortedInfo.order,
    ellipsis: {
      showTitle: false,
    },
    render: (description: string) => (
      <Tooltip placement="topLeft" title={description}>
        {description}
      </Tooltip>
    ),
  },
  {
    title: "Resource",
    dataIndex: "resource",
    key: "resource",
    ...getColumnSearchProps('resource', 'Resource'),
    sorter: (a: any, b: any) => a.resource.localeCompare(b.resource),
    sortOrder: sortedInfo.columnKey === 'resource' && sortedInfo.order,
    filters: [
      { text: 'User', value: 'user' },
      { text: 'Role', value: 'role' },
      { text: 'Permission', value: 'permission' },
      { text: 'Projects', value: 'projects' },
      { text: 'Tasks', value: 'tasks' },
      { text: 'Worklogs', value: 'worklogs' },
      { text: 'Holiday', value: 'holiday' },
      { text: 'Leave', value: 'leave' },
      { text: 'Work Hour', value: 'workhour' },
      { text: 'Calendar', value: 'calendar' },
      { text: 'Client', value: 'client' },
      { text: 'Attendance', value: 'attendance' },
    ],
    onFilter: (value: any, record: any) => record.resource === value,
  },
  {
    title: "Method",
    dataIndex: "method",
    key: "method",
    ...getColumnSearchProps('method', 'Method'),
    sorter: (a: any, b: any) => a.method.localeCompare(b.method),
    sortOrder: sortedInfo.columnKey === 'method' && sortedInfo.order,
    filters: [
      { text: 'GET', value: 'GET' },
      { text: 'POST', value: 'POST' },
      { text: 'PUT', value: 'PUT' },
      { text: 'PATCH', value: 'PATCH' },
      { text: 'DELETE', value: 'DELETE' },
    ],
    onFilter: (value: any, record: any) => record.method === value,
  },
  {
    title: "Path",
    dataIndex: "path",
    key: "path",
    ...getColumnSearchProps('path', 'Path'),
    sorter: (a: any, b: any) => a.path.localeCompare(b.path),
    sortOrder: sortedInfo.columnKey === 'path' && sortedInfo.order,
    ellipsis: {
      showTitle: false,
    },
    render: (path: string) => (
      <Tooltip placement="topLeft" title={path}>
        <code style={{ fontSize: '12px' }}>{path}</code>
      </Tooltip>
    ),
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date: string) => new Date(date).toLocaleDateString(),
    sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
  },
  {
    title: "Action",
    key: "action",
    width: 120,
    render: (_: any, record: any) => (
      <Space>
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => showEditModal(record)}
        >
          Edit
        </Button>
        <Popconfirm
          title="Delete permission"
          description="Are you sure you want to delete this permission?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

const PermissionTable = ({ showEditModal }: { showEditModal: any }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: permissionData, isPending } = usePermission({ page, limit });
  const syncPermissions = useSyncPermissions();
  const deletePermission = useDeletePermission();
  
  // For search
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<any>(null);
  
  // For sorting
  const [sortedInfo, setSortedInfo] = useState<any>({});

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
    setSortedInfo(sorter);
  };

  const handleSyncPermissions = async () => {
    try {
      await syncPermissions.mutateAsync();
      message.success('Permissions synced successfully from config!');
    } catch (error) {
      message.error('Failed to sync permissions');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePermission.mutateAsync(id);
      message.success('Permission deleted successfully!');
    } catch (error) {
      message.error('Failed to delete permission');
    }
  };

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string, title: string) => ({
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
        let nestedObj = record;
        for (const key of keys) {
          if (!nestedObj || !nestedObj[key]) return false;
          nestedObj = nestedObj[key];
        }
        return nestedObj.toString().toLowerCase().includes(value.toLowerCase());
      }
      return record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '';
    },
    onFilterDropdownOpenChange: (visible: boolean) => {
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

  const paginationOptions = {
    current: page,
    pageSize: limit,
    total: permissionData?.totalItems || permissionData?.totalCount || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: [5, 10, 20, 30, 50, 100],
    showTotal: (total: number, range: number[]) =>
      `${range[0]}-${range[1]} of ${total} permissions`,
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="default"
          icon={<SyncOutlined />}
          onClick={handleSyncPermissions}
          loading={syncPermissions.isPending}
        >
          Sync Permissions from Config
        </Button>
      </div>
      <Table
        loading={isPending}
        pagination={paginationOptions}
        dataSource={permissionData?.results || []}
        columns={columns(showEditModal, handleDelete, getColumnSearchProps, sortedInfo)}
        onChange={handleTableChange}
        rowKey="id"
        size="small"
      />
    </>
  );
};

export default PermissionTable;
