import { useEditWorklog } from "@/hooks/worklog/useEditWorklog";
import { Tooltip } from "antd";
import { Button, Card, Table, Modal, Input, Popconfirm, Space } from "antd";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";
import { useDeleteWorklog } from "@/hooks/worklog/useDeleteWorklog";
import { useSession } from "@/context/SessionContext";
import { useState, useRef } from "react";
import { useWorklogbyUser } from "@/hooks/worklog/useWorklogbyUser";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const { TextArea } = Input;

const columns = (
  status: string, 
  deleteWorklog: any, 
  editWorklog: any, 
  navigate: any, 
  getColumnSearchProps: any, 
  sortedInfo: any, 
  showRejectModal: (id: string) => void
) => {
  const getStatusTitle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "Approved By";
      case "rejected":
        return "Rejected By";
      case "requested":
        return "Requested By";
      default:
        return "Requestor";
    }
  };

  const baseColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      ...getColumnSearchProps('startTime', 'Date'),
      sorter: (a: any, b: any) => moment(a.startTime).unix() - moment(b.startTime).unix(),
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
      render: (_: any, record: any) => {
        return new Date(record?.startTime).toLocaleDateString();
      }
    },
    {
      title: "Project Name",
      dataIndex: "project",
      key: "project",
      ...getColumnSearchProps('task.project.name', 'Project'),
      sorter: (a: any, b: any) => (a.task?.project?.name || '').localeCompare(b.task?.project?.name || ''),
      sortOrder: sortedInfo.columnKey === 'project' && sortedInfo.order,
      render: (_: any, record: any) => {
        return <Link to={`/projects/${record?.task?.project?.id}`} className="text-blue-600">{record?.task?.project?.name}</Link>
      }
    },
    {
      title: "Task",
      dataIndex: "Task",
      key: "task",
      ...getColumnSearchProps('task.name', 'Task'),
      sorter: (a: any, b: any) => (a.task?.name || '').localeCompare(b.task?.name || ''),
      sortOrder: sortedInfo.columnKey === 'task' && sortedInfo.order,
      render: (_: any, record: any) => {
        return <Link to={`/projects/${record?.task?.project?.id}/tasks/${record?.task?.id}`} className="text-blue-600">{record?.task?.name}</Link>
      }
    },
    {
      title: "Duration",
      dataIndex: "startTime",
      key: "startTime",
      sorter: (a: any, b: any) => moment.duration(moment(a.endTime).diff(moment(a.startTime))).asMinutes() - 
                                 moment.duration(moment(b.endTime).diff(moment(b.startTime))).asMinutes(),
      sortOrder: sortedInfo.columnKey === 'startTime' && sortedInfo.order,
      render: (_: any, record: any) => {
        return (
          <>
            <div>
              {moment(record?.startTime).format("hh:mm A") + " - " + moment(record?.endTime).format("hh:mm A")}
            </div>
            {` (${moment.duration(moment(record?.endTime).diff(moment(record?.startTime))).asMinutes()} minutes)`}
          </>
        );
      }
    },
       {
      title: "Requested To",
      dataIndex: "requestToUser",
      key: "requestToUser",
      ...getColumnSearchProps('requestToUser.name', 'Requested To'),
      sorter: (a: any, b: any) => (a.requestToUser?.name || '').localeCompare(b.requestToUser?.name || ''),
      sortOrder: sortedInfo.columnKey === 'requestToUser' && sortedInfo.order,
      render: (_: any, record: any) => {
        const user = record?.requestToUser;
        const requestedAt = record?.requestedAt ? new Date(record.requestedAt).toLocaleString() : null;
        return user ? (
          <Tooltip title={requestedAt ? <span>Requested At: {requestedAt}</span> : undefined}>
            <span>{user.name}</span>
          </Tooltip>
        ) : "-";
      }
    },
    {
      title: getStatusTitle(status),
      dataIndex: "userId",
      key: "userId",
      ...getColumnSearchProps('user.name', 'User'),
      sorter: (a: any, b: any) => (a.user?.name || '').localeCompare(b.user?.name || ''),
      sortOrder: sortedInfo.columnKey === 'userId' && sortedInfo.order,
      render: (_: any, record: any) => {
        let user = null;
        let extra = null;
        if (status.toLowerCase() === 'requested') {
          user = record?.requestToUser;
          if (record?.requestedAt) {
            extra = <span>Requested At: {new Date(record.requestedAt).toLocaleString()}</span>;
          }
        } else if (status.toLowerCase() === 'approved') {
          user = record?.approvedByUser;
          if (record?.approvedAt) {
            extra = <span>Approved At: {new Date(record.approvedAt).toLocaleString()}</span>;
          }
        } else if (status.toLowerCase() === 'rejected') {
          user = record?.rejectByUser;
          let remark = record?.rejectedRemark;
          let rejectedAt = record?.rejectedAt ? new Date(record.rejectedAt).toLocaleString() : null;
          extra = (
            <span>
              {remark && <><b>Remark:</b> {remark}<br/></>}
              {rejectedAt && <>Rejected At: {rejectedAt}</>}
            </span>
          );
        }
        return user ? (
          <Tooltip title={<span>{user.email || user.name}<br/>{extra}</span>}>
            <span>{user.name}</span>
          </Tooltip>
        ) : "-";
      }
    },
  ];

  // Removed Rejection Remark column as remark is now shown in tooltip

  // Modified Action column to work with all statuses
  baseColumns.push({
    title: "Action",
    dataIndex: "action",
    key: "action",
    render: (_: any, record: any) => {
      return (
        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={() => navigate(`/worklogs/edit/${record?.id}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this worklog?"
            onConfirm={() => deleteWorklog({ id: record?.id })}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
          {status === "requested" && (
            <>
              <Button
                type="primary"
                onClick={() => editWorklog({ id: record?.id, status: "approved" })}
              >
                Approve
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => showRejectModal(record?.id)}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      );
    }
  });

  return baseColumns;
};

const IncomingWorklogTable = ({ status }: { status: string }) => {
  const navigate = useNavigate();
  const { profile } = useSession();
  const currentUserId = (profile as any)?.id;
  const { data: worklogs, isPending } = useWorklogbyUser(status);
  console.log(worklogs);
  const { mutate: editWorklog, isPending: isEditPending } = useEditWorklog();
  const { mutate: deleteWorklog } = useDeleteWorklog();
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  
  // For search functionality
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<any>(null);
  
  // For sorting
  const [sortedInfo, setSortedInfo] = useState<any>({});

  const toggleDescription = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const customExpandIcon = ({ expanded, onExpand, record }: any) => {
    return (
      <span
        onClick={e => {
          toggleDescription(record.id);
          onExpand(record, e);
        }}
        style={{ cursor: "pointer", marginRight: 8 }}
      >
        {expanded ? "−" : "+"}
      </span>
    );
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
  
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSortedInfo(sorter);
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

  const expandedRowRender = (record: any) => {
    const description = record?.description || "No description available";
    return (
      <div
        className="p-4 bg-gray-50"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    );
  };

  const showRejectModal = (id: string) => {
    setCurrentRecordId(id);
    setRemark("");
    setIsModalVisible(true);
  };

  const handleReject = () => {
    if (currentRecordId) {
      editWorklog({ 
        id: currentRecordId, 
        status: "rejected",
        rejectedRemark: remark
      });
    }
    setIsModalVisible(false);
    setCurrentRecordId(null);
    setRemark("");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentRecordId(null);
    setRemark("");
  };

  // Only show worklogs where the current user is the approver (approvedBy)
  const filteredWorklogs = (worklogs || []).filter((w: any) => {
    const reqTo = w?.requestTo?.toString?.() === currentUserId?.toString();
    if (status.toLowerCase() === "requested") {
      return reqTo;
    }
    if (status.toLowerCase() === "approved") {
      return reqTo && w?.approvedBy?.toString?.() === currentUserId?.toString();
    }
    if (status.toLowerCase() === "rejected") {
      return reqTo && w?.rejectBy?.toString?.() === currentUserId?.toString();
    }
    return reqTo;
  });

  return (
    <Card>
      <TableToolbar>
        <Button type="primary" onClick={() => navigate("/worklogs/new")}>Create</Button>
      </TableToolbar>
      <Table
        loading={isPending || isEditPending}
        dataSource={filteredWorklogs}
        columns={columns(
          status, 
          deleteWorklog, 
          editWorklog, 
          navigate, 
          getColumnSearchProps, 
          sortedInfo, 
          showRejectModal
        ).map(col => ({
          ...col,
          render: col.key === "action" && status === "requested" ? (_: any, record: any) => {
            return (
              <div className="flex gap-2">
                <Button
                  type="primary"
                  onClick={() => navigate(`/worklogs/edit/${record?.id}`)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this worklog?"
                  onConfirm={() => deleteWorklog({ id: record?.id })}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" danger>
                    Delete
                  </Button>
                </Popconfirm>
                <Button
                  type="primary"
                  onClick={() => editWorklog({ id: record?.id, status: "approved" })}
                >
                  Approve
                </Button>
                <Button
                  type="primary"
                  danger
                  onClick={() => showRejectModal(record?.id)}
                >
                  Reject
                </Button>
              </div>
            );
          } : col.render
        }))}
        expandable={{
          expandedRowRender,
          expandedRowKeys: expandedRows,
          expandIcon: customExpandIcon,
        }}
        onChange={handleTableChange}
        rowKey="id"
        bordered
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [5, 10, 20, 50],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
      />

      <Modal
        title="Reject Worklog"
        visible={isModalVisible}
        onOk={handleReject}
        onCancel={handleCancel}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <TextArea
          rows={4}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Enter reason for rejection"
        />
      </Modal>
    </Card>
  );
};

export default IncomingWorklogTable;