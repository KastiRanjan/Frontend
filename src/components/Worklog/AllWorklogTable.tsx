import { useEditWorklog } from "@/hooks/worklog/useEditWorklog";
import { useWorklog } from "@/hooks/worklog/useWorklog";
import { Button, Card, Table, Popconfirm, Input, Space } from "antd";
import { Tooltip } from "antd";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";
import { useDeleteWorklog } from "@/hooks/worklog/useDeleteWorklog";
import { useState, useRef } from "react";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const columns = (
  status: string, 
  deleteWorklog: any, 
  navigate: any, 
  getColumnSearchProps: any, 
  sortedInfo: any
) => {
  // Determine column title based on status
  const getStatusTitle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "Approved By";
      case "rejected":
        return "Rejected By";
      case "requested":
        return "Requested By";
      default:
        return "Reviewed By";
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
      title: "Request To",
      dataIndex: "requestTo",
      key: "requestTo",
      ...getColumnSearchProps('requestTo', 'Request To'),
      render: (_: any, record: any) => {
        const user = record?.requestToUser;
        const requestAt = record?.requestedAt ? new Date(record.requestedAt).toLocaleString() : null;
        return user ? (
          <Tooltip title={<span>{user.email || user.name}<br/>{requestAt && <span>Requested At: {requestAt}</span>}</span>}>
            <span>{user.name}</span>
          </Tooltip>
        ) : "-";
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
        return <>
          <div>
            {moment(record?.startTime).format("hh:mm A") + " - " + moment(record?.endTime).format("hh:mm A")}
          </div>
          {` (${moment.duration(moment(record?.endTime).diff(moment(record?.startTime))).asMinutes()} minutes)`}
        </>
      }
    },
    {
      title: getStatusTitle(status),
      dataIndex: "approvedBy",
      key: "approvedBy",
      ...getColumnSearchProps('user.name', 'User'),
      sorter: (a: any, b: any) => (a.user?.name || '').localeCompare(b.user?.name || ''),
      sortOrder: sortedInfo.columnKey === 'approvedBy' && sortedInfo.order,
      render: (_: any, record: any) => {
        const user = record?.user;
        const approvedAt = record?.approvedAt ? new Date(record.approvedAt).toLocaleString() : null;
        return user ? (
          <Tooltip title={<span>{user.email || user.name}<br/>{approvedAt && <span>Approved At: {approvedAt}</span>}</span>}>
            <span>{user.name}</span>
          </Tooltip>
        ) : "-";
      }
    },
  ];

  // Add Remark column only for rejected status
  if (status.toLowerCase() === "rejected") {
    baseColumns.push({
      title: "Rejection Remark",
      dataIndex: "rejectedRemark",
      key: "rejectedRemark",
      ...getColumnSearchProps('rejectedRemark', 'Rejection Remark'),
      sorter: (a: any, b: any) => (a.rejectedRemark || '').localeCompare(b.rejectedRemark || ''),
      sortOrder: sortedInfo.columnKey === 'rejectedRemark' && sortedInfo.order,
      render: (_: any, record: any) => {
        if (record?.status === 'rejected' && record?.rejectedRemark) {
          return (
            <Tooltip title={record.rejectedRemark}>
              <span style={{ cursor: 'pointer', textDecoration: 'underline', color: '#fa541c' }}>
                {record.rejectedRemark.length > 30 ? record.rejectedRemark.slice(0, 30) + '...' : record.rejectedRemark}
              </span>
            </Tooltip>
          );
        }
        return record?.rejectedRemark || "-";
      }
    });
  }

  baseColumns.push({
    title: "Action",
    dataIndex: "o",
    key: "s",
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
            onConfirm={() => deleteWorklog({id:record?.id})}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      );
    }
  });

  return baseColumns;
};

const AllWorklogTable = ({ status }: { status: string }) => {
  const navigate = useNavigate();
  const { data: worklogs, isPending } = useWorklog(status);
  const { mutate: editWorklog, isPending: isEditPending } = useEditWorklog();
  const { mutate: deleteWorklog } = useDeleteWorklog();
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  // For search
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<any>(null);
  
  // For sorting
  const [sortedInfo, setSortedInfo] = useState<any>({});

  // Function to toggle description visibility
  const toggleDescription = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // Custom expand icon
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

  // Expanded row render function for description
  const expandedRowRender = (record: any) => {
    let description = record?.description || "No description available";
    if (record?.status === "rejected" && record?.rejectedRemark) {
      description += `<br/><br/><b>Rejection Remark:</b> ${record.rejectedRemark}`;
    }
    return (
      <div 
        className="p-4 bg-gray-50"
        dangerouslySetInnerHTML={{ __html: description }}
      />
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

  return (
    <Card>
      <TableToolbar>
        <Button type="primary" onClick={() => navigate("/worklogs/new")}>Create</Button>
      </TableToolbar>
      <Table
        loading={isPending || isEditPending}
        dataSource={worklogs || []}
        columns={columns(status, deleteWorklog, navigate, getColumnSearchProps, sortedInfo) as any}
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
    </Card>
  );
};

export default AllWorklogTable;