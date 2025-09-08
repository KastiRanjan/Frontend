import { useClient } from "@/hooks/client/useClient";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Table, Input, Space } from "antd";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";
import Highlighter from 'react-highlight-words';

const ClientTable = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: client, isPending } = useClient();
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
    setPage(pagination.current);
    setLimit(pagination.pageSize);
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

  const columns = [
    {
      title: "",
      dataIndex: "id",
      key: "id",
      render: () => <Checkbox type="checkbox" />,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps('name', 'Name'),
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      title: "Legal Status",
      dataIndex: "legalStatus",
      key: "legalStatus",
      ...getColumnSearchProps('legalStatus', 'Legal Status'),
      sorter: (a: any, b: any) => (a.legalStatus || '').localeCompare(b.legalStatus || ''),
      sortOrder: sortedInfo.columnKey === 'legalStatus' && sortedInfo.order,
    },
    {
      title: "Nature",
      dataIndex: "industryNature",
      key: "industryNature",
      ...getColumnSearchProps('industryNature', 'Nature'),
      sorter: (a: any, b: any) => (a.industryNature || '').localeCompare(b.industryNature || ''),
      sortOrder: sortedInfo.columnKey === 'industryNature' && sortedInfo.order,
    },
    {
      title: "Business Size",
      dataIndex: "businessSize",
      key: "businessSize",
      ...getColumnSearchProps('businessSize', 'Business Size'),
      sorter: (a: any, b: any) => (a.businessSize || '').localeCompare(b.businessSize || ''),
      sortOrder: sortedInfo.columnKey === 'businessSize' && sortedInfo.order,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      ...getColumnSearchProps('status', 'Status'),
      sorter: (a: any, b: any) => (a.status || '').localeCompare(b.status || ''),
      sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
    },
    {
      title: "Action", 
      key: "action",
      render: (_: any, record: any) => (
        <Link to={`/client/edit/${record.id}`}>
          <Button type="primary" icon={<EditOutlined />}>
            Edit
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <TableToolbar>
        <Button type="primary" onClick={() => navigate("/client/new")}>
          Create
        </Button>
      </TableToolbar>
      <Table
        loading={isPending}
        dataSource={client || []}
        columns={columns}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: limit,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [5, 10, 20, 50],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    </Card>
  );
};

export default ClientTable;
