import { useUser } from "@/hooks/user/useUser";
import { Role } from "@/pages/Role/type";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Table, TableProps, Input, Space } from "antd";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";
import { UserType } from "@/types/user";
import Highlighter from 'react-highlight-words';

const UserTable = ({ status, showModal }: { status: string, showModal: any }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: user, isPending } = useUser({ status, limit, page, keywords: "" });
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
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps('name', 'Name'),
      sorter: (a: UserType, b: UserType) => (a.name || '').localeCompare(b.name || ''),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      render: (_: any, record: UserType) => (
        <>
          <Avatar size={25} style={{ backgroundColor: `#${(Math.floor(Math.random() * 128) + 128).toString(16).padStart(2, '0')}${(Math.floor(Math.random() * 128) + 128).toString(16).padStart(2, '0')}${(Math.floor(Math.random() * 128) + 128).toString(16).padStart(2, '0')}` }}>{record?.name?.charAt(0)}</Avatar> &nbsp; &nbsp;
          <Link to={`/user/${record.id}/`} className="text-blue-600">{record.name}</Link>
        </>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps('email', 'Email'),
      sorter: (a: UserType, b: UserType) => (a.email || '').localeCompare(b.email || ''),
      sortOrder: sortedInfo.columnKey === 'email' && sortedInfo.order,
    },
    {
      title: "PhoneNumber",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      ...getColumnSearchProps('phoneNumber', 'Phone Number'),
      sorter: (a: any, b: any) => {
        const aPhone = a.phoneNumber || '';
        const bPhone = b.phoneNumber || '';
        return aPhone.localeCompare(bPhone);
      },
      sortOrder: sortedInfo.columnKey === 'phoneNumber' && sortedInfo.order,
    },
    {
      title: "Designation",
      dataIndex: "degination",
      key: "degination",
      ...getColumnSearchProps('role.name', 'Designation'),
      sorter: (a: UserType, b: UserType) => (a.role?.name || '').localeCompare(b.role?.name || ''),
      sortOrder: sortedInfo.columnKey === 'degination' && sortedInfo.order,
      render: (_: any, record: UserType) => record?.role?.name,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      ...getColumnSearchProps('role.name', 'Role'),
      sorter: (a: UserType, b: UserType) => (a.role?.name || '').localeCompare(b.role?.name || ''),
      sortOrder: sortedInfo.columnKey === 'role' && sortedInfo.order,
      render: (role: Role) => role.name,
    },
    {
      title: "Action",
      key: "action",
      width: 50,
      render: (_: any, record: UserType) => (
        <div>
          <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}></Button>
        </div>
      ),
    },
  ];

  const rowSelection: TableProps<UserType>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: UserType[]) => {
      console.log(selectedRowKeys, selectedRows);
    },
    getCheckboxProps: (record: UserType) => ({
      name: record.name,
    }),
  };

  return (
    <Card>
      <TableToolbar>
        <Button type="primary" onClick={() => showModal()}>
          Create User
        </Button>
      </TableToolbar>
      <Table
        loading={isPending}
        dataSource={user?.results}
        columns={columns}
        rowSelection={rowSelection}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: limit,
          total: user?.totalItems || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [5, 10, 20, 50],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        size="small"
        rowKey={"id"}
      />
    </Card>
  );
};

export default UserTable;
