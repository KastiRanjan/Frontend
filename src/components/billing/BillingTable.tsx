import { useDeleteBilling } from "@/hooks/billing/useDeleteBilling";
import { BillingType } from "@/types/billing";
import { Button, Popconfirm, Space, Table, Tag, message, Input } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState, useRef } from "react";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from 'react-highlight-words';

interface BillingTableProps {
  data: BillingType[];
  showModal: (billing?: BillingType) => void;
  onRefresh: () => void;
}

const BillingTable = ({ data, showModal, onRefresh }: BillingTableProps) => {
  const { mutate: deleteBilling } = useDeleteBilling();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const searchInput = useRef<any>(null);

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  const getColumnSearchProps = (dataIndex: string, title: string): any => {
    // Get unique values for autocomplete
    const getUniqueValues = () => {
      const getValue = (obj: any, path: string): any => {
        if (path.includes('.')) {
          const keys = path.split('.');
          let val = obj;
          for (const key of keys) {
            if (!val) return null;
            val = val[key];
          }
          return val;
        }
        return obj[path];
      };

      const values = new Set<string>();
      data?.forEach((record: any) => {
        const value = getValue(record, dataIndex);
        if (value) {
          values.add(value.toString());
        }
      });
      return Array.from(values).sort();
    };

    return {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
        const uniqueValues = getUniqueValues();
        const currentValue = selectedKeys[0] || '';
        const filteredOptions = currentValue 
          ? uniqueValues.filter(val => 
              val.toLowerCase().includes(currentValue.toLowerCase())
            ).slice(0, 10)
          : uniqueValues.slice(0, 10);

        return (
          <div style={{ padding: 8 }}>
            <Input
              ref={searchInput}
              placeholder={`Search ${title}`}
              value={currentValue}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
              style={{ marginBottom: 8, display: 'block' }}
            />
            {filteredOptions.length > 0 && (
              <div style={{ 
                maxHeight: 200, 
                overflowY: 'auto', 
                marginBottom: 8,
                border: '1px solid #d9d9d9',
                borderRadius: 4
              }}>
                {filteredOptions.map((option, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      borderBottom: idx < filteredOptions.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                    onClick={() => {
                      setSelectedKeys([option]);
                      handleSearch([option], confirm, dataIndex);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
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
                onClick={() => {
                  clearFilters();
                  setSelectedKeys([]);
                  setSearchText('');
                  setSearchedColumn('');
                  confirm({ closeDropdown: false });
                }}
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
    };
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteBilling(id.toString(), {
        onSuccess: () => {
          message.success("Billing entity deleted successfully");
          onRefresh();
        },
        onError: (error) => {
          message.error(`Failed to delete: ${error.message}`);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<BillingType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      ...getColumnSearchProps('name', 'Name'),
    },
    {
      title: "Short Name",
      dataIndex: "shortName",
      key: "shortName",
      sorter: (a, b) => (a.shortName || '').localeCompare(b.shortName || ''),
      sortOrder: sortedInfo.columnKey === 'shortName' && sortedInfo.order,
      ...getColumnSearchProps('shortName', 'Short Name'),
      render: (text) => text || "N/A",
    },
    {
      title: "PAN Number",
      dataIndex: "pan_number",
      key: "pan_number",
      ...getColumnSearchProps('pan_number', 'PAN Number'),
      sorter: (a, b) => (a.pan_number || '').localeCompare(b.pan_number || ''),
      sortOrder: sortedInfo.columnKey === 'pan_number' && sortedInfo.order,
      render: (text) => text || "N/A",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps('email', 'Email'),
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
      sortOrder: sortedInfo.columnKey === 'email' && sortedInfo.order,
      render: (text) => text || "N/A",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps('phone', 'Phone'),
      sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
      sortOrder: sortedInfo.columnKey === 'phone' && sortedInfo.order,
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      ...getColumnSearchProps('status', 'Status'),
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
      render: (status: string) => {
        let color = "green";
        if (status === "suspended") {
          color = "orange";
        } else if (status === "archived") {
          color = "red";
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this billing entity?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={loading}
          >
            <Button type="link" danger loading={loading}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={data.map(item => ({...item, key: item.id}))} 
      pagination={{ 
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: [5, 10, 20, 50],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}
      onChange={handleTableChange}
      bordered
    />
  );
};

export default BillingTable;
