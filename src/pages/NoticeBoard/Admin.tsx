import { useAllNoticeBoards } from "@/hooks/notice-board/useAllNoticeBoards";
import { useDeleteNoticeBoard } from "@/hooks/notice-board/useDeleteNoticeBoard";
import { useSession } from "@/context/SessionContext";
import { Table, Button, Space, message, Popconfirm, Badge, Typography, Card, Tooltip, Input, Select } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, MailOutlined, SearchOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import NoticeBoardDetail from "@/components/NoticeBoard/NoticeBoardDetail";
import Highlighter from "react-highlight-words";

const { Title, Text } = Typography;

const NoticeBoardAdmin = () => {
  const { data: notices, isLoading } = useAllNoticeBoards();
  const { mutateAsync: deleteNoticeBoard } = useDeleteNoticeBoard();
  const { profile } = useSession();
  const navigate = useNavigate();
  
  const [selectedNotice, setSelectedNotice] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  
  // For search functionality
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<any>(null);

  // Helper function to get unique values for autocomplete
  const getUniqueValues = (dataIndex: string | string[]) => {
    if (!notices) return [];
    
    const values = notices.map((item: any) => {
      if (Array.isArray(dataIndex)) {
        let value = item;
        for (const key of dataIndex) {
          value = value?.[key];
        }
        return value;
      }
      return item[dataIndex];
    }).filter(Boolean);
    
    return [...new Set(values)];
  };

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any, confirm: any) => {
    clearFilters();
    setSearchText('');
    setSearchedColumn('');
    confirm({ closeDropdown: false });
  };

  const getColumnSearchProps = (dataIndex: any, columnName: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
      const uniqueValues = getUniqueValues(dataIndex);
      const [currentValue, setCurrentValue] = useState('');

      const filteredOptions = currentValue
        ? uniqueValues.filter((value: any) =>
            value?.toString().toLowerCase().includes(currentValue.toLowerCase())
          )
        : uniqueValues.slice(0, 10);

      return (
        <div style={{ padding: 8 }}>
          <Select
            ref={searchInput}
            placeholder={`Search ${columnName}`}
            value={selectedKeys[0]}
            onChange={(value) => {
              setSelectedKeys(value ? [value] : []);
              setCurrentValue('');
            }}
            onSearch={(value) => setCurrentValue(value)}
            showSearch
            allowClear
            style={{ width: 188, marginBottom: 8, display: 'block' }}
            filterOption={false}
            onDropdownVisibleChange={(open) => {
              if (open) {
                setCurrentValue('');
              }
            }}
          >
            {filteredOptions.map((value: any, index: number) => (
              <Select.Option key={`${value}-${index}`} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
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
              onClick={() => clearFilters && handleReset(clearFilters, confirm)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: any, record: any) => {
      const recordValue = Array.isArray(dataIndex)
        ? dataIndex.reduce((obj, key) => obj?.[key], record)
        : record[dataIndex];
      
      return recordValue
        ? recordValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.focus(), 100);
      }
    },
    render: (text: any) =>
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

  // Determine if the user has permission to manage notices
  const roleName = (profile?.role as any)?.name || '';
  const permissions = profile?.role?.permission || [];
  
  // Permission check (similar to how you check in Attendance)
  const isAdmin = roleName === 'superuser' || 
                 roleName === 'admin' || 
                 roleName?.toLowerCase().includes('admin') ||
                 roleName?.toLowerCase().includes('super');
  
  const handleDelete = async (id: string) => {
    try {
      await deleteNoticeBoard({ id });
      message.success("Notice deleted successfully");
    } catch (error) {
      message.error("Failed to delete notice");
    }
  };

  const handleViewDetail = (id: string) => {
    setSelectedNotice(id);
    setDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedNotice(null);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title', 'Title'),
      render: (text: string, record: any) => {
        const displayText = searchedColumn === 'title' ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : text;
        
        return (
          <Space>
            <Link to={`/notice-board/edit/${record.id}`}>{displayText}</Link>
            {record.emailSent && (
              <Tooltip title="Email sent">
                <MailOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Distribution',
      key: 'distribution',
      render: (text: string, record: any) => (
        <Badge 
          status={record.sendToAll ? "success" : "warning"} 
          text={record.sendToAll ? "All Users" : "Selected Users/Roles"} 
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Read Statistics',
      key: 'readStats',
      render: (text: string, record: any) => {
        const totalTargets = record.sendToAll 
          ? 'All Users' 
          : `${record.users?.length || 0} Users`;
        
        const readCount = record.readByUsers?.length || 0;
        
        return (
          <Text>
            Read by {readCount} / {totalTargets}
          </Text>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.id)}
            size="small"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/notice-board/edit/${record.id}`)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this notice?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <Card>
        <Text>You don't have permission to access this page.</Text>
      </Card>
    );
  }

  return (
    <Card
      title={<Title level={4}>Notice Board Management</Title>}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/notice-board/create')}
        >
          Create Notice
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={notices || []}
        rowKey="id"
        loading={isLoading}
      />

      {selectedNotice && (
        <NoticeBoardDetail
          visible={detailVisible}
          noticeId={selectedNotice}
          onClose={handleCloseDetail}
        />
      )}
    </Card>
  );
};

export default NoticeBoardAdmin;