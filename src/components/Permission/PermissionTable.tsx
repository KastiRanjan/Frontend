import { EditOutlined, SyncOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Table, Space, Tooltip, message, Popconfirm } from "antd";
import { useState } from "react";
import { usePermission } from "../../hooks/permission/usePermission";
import { useSyncPermissions } from "../../hooks/permission/useSyncPermissions";
import { useDeletePermission } from "../../hooks/permission/useDeletePermission";

// Modified columns definition to be a function
const columns = (showEditModal: any, handleDelete: any) => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 80,
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

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
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
        columns={columns(showEditModal, handleDelete)}
        onChange={handleTableChange}
        rowKey="id"
        size="small"
      />
    </>
  );
};

export default PermissionTable;
