import { useSession } from "@/context/SessionContext";
import { useProject } from "@/hooks/project/useProject";
import { ProjectType } from "@/types/project";
import { checkPermissionForComponent } from "@/utils/permission";
import { DownloadOutlined, EditOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Space, Table, TableProps, Tooltip, Input, Select, DatePicker, Form, Row, Col } from "antd";
import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import TableToolbar from "../Table/TableToolbar";
import Highlighter from 'react-highlight-words';
import moment from 'moment';

const ProjectTable = ({ showModal, status }: any) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: project, isPending } = useProject({ status });
  const { permissions, profile } = useSession();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const searchInput = useRef<any>(null);
  const [form] = Form.useForm();

  // Determine if user is auditsenior or junior
  const userRole = profile?.role?.name?.toLowerCase();
  const hideCreateDelete = userRole === "auditsenior" || userRole === "auditjunior";

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
    setSortedInfo(sorter);
  };

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const getColumnSearchProps = (dataIndex: string, title: string): any => {
    // Get unique values for autocomplete
    const getUniqueValues = () => {
      const getValue = (obj: any, path: string): any => {
        if (Array.isArray(path)) {
          return path.reduce((acc, key) => acc?.[key], obj);
        }
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
      };

      const values = new Set<string>();
      filteredProject?.forEach((record: any) => {
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
            ).slice(0, 10) // Show max 10 suggestions
          : [];

        return (
          <div style={{ padding: 8 }}>
            <Input
              ref={searchInput}
              placeholder={`Search ${title}`}
              value={currentValue}
              onChange={e => {
                const val = e.target.value;
                setSelectedKeys(val ? [val] : []);
              }}
              onPressEnter={() => {
                handleSearch(selectedKeys, confirm, dataIndex);
              }}
              style={{ marginBottom: 8, display: 'block' }}
            />
            {filteredOptions.length > 0 && currentValue && (
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
        // Handle nested dataIndex like "customer.name" or ["customer", "name"]
        const getValue = (obj: any, path: string): any => {
          if (Array.isArray(path)) {
            return path.reduce((acc, key) => acc?.[key], obj);
          }
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
        
        const fieldValue = getValue(record, dataIndex);
        return fieldValue
          ? fieldValue.toString().toLowerCase().includes(value.toLowerCase())
          : false;
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

  const applyFilters = (values: any) => {
    console.log("Applied filters:", values);
    setAdvancedFilters(values);
  };

  const resetFilters = () => {
    form.resetFields();
    setAdvancedFilters({});
  };

  // Filter data based on advanced filters
  const filteredProject = useMemo(() => {
    if (!project) return [];
    
    let filtered = [...project];
    
    // Apply advanced filters
    if (advancedFilters.dateRange && advancedFilters.dateRange.length === 2) {
      filtered = filtered.filter((p: any) => {
        const startDate = moment(p.startingDate);
        const endDate = moment(p.endingDate);
        const [filterStart, filterEnd] = advancedFilters.dateRange;
        return (
          startDate.isSameOrAfter(filterStart, 'day') &&
          endDate.isSameOrBefore(filterEnd, 'day')
        );
      });
    }
    
    if (advancedFilters.clientId) {
      filtered = filtered.filter((p: any) => p.customer?.id === advancedFilters.clientId);
    }
    
    if (advancedFilters.projectLeadId) {
      filtered = filtered.filter((p: any) => p.projectLead?.id === advancedFilters.projectLeadId);
    }
    
    if (advancedFilters.projectManagerId) {
      filtered = filtered.filter((p: any) => p.projectManager?.id === advancedFilters.projectManagerId);
    }
    
    if (advancedFilters.natureOfWork) {
      filtered = filtered.filter((p: any) => {
        const natureId = typeof p.natureOfWork === 'object' ? p.natureOfWork?.id : p.natureOfWork;
        return natureId === advancedFilters.natureOfWork;
      });
    }
    
    if (advancedFilters.status) {
      filtered = filtered.filter((p: any) => p.status === advancedFilters.status);
    }
    
    return filtered;
  }, [project, advancedFilters]);

  const columns = (): TableProps<ProjectType>["columns"] => [
    {
      title: "Project Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      ...getColumnSearchProps('name', 'Project Name'),
      render: (_: any, record: any) => (
        <Link to={`/projects/${record.id}`} className="text-blue-600">
          {record.name}
        </Link>
      ),
    },
    {
      title: "Nature Of Project",
      dataIndex: ["natureOfWork", "name"],
      key: "natureOfWork",
      sorter: (a: any, b: any) => {
        const aName = typeof a.natureOfWork === 'object' ? a.natureOfWork?.name || '' : a.natureOfWork || '';
        const bName = typeof b.natureOfWork === 'object' ? b.natureOfWork?.name || '' : b.natureOfWork || '';
        return aName.localeCompare(bName);
      },
      sortOrder: sortedInfo.columnKey === 'natureOfWork' && sortedInfo.order,
      ...getColumnSearchProps('natureOfWork.name', 'Nature Of Project'),
      filters: Array.from(
        new Set(project?.map((p: any) => {
          const name = typeof p.natureOfWork === 'object' ? p.natureOfWork?.name : p.natureOfWork;
          return name;
        }))
      )
        .filter(Boolean)
        .map((name: any) => ({ text: name, value: name })),
      onFilter: (value: any, record: any) => {
        const name = typeof record.natureOfWork === 'object' ? record.natureOfWork?.name : record.natureOfWork;
        return name === value;
      },
      render: (_: any, record: any) => {
        return typeof record.natureOfWork === 'object' ? record.natureOfWork?.name : record.natureOfWork;
      }
    },
    {
      title: "Client",
      dataIndex: ["customer", "name"],
      key: "client",
      sorter: (a: any, b: any) => (a.customer?.name || '').localeCompare(b.customer?.name || ''),
      sortOrder: sortedInfo.columnKey === 'client' && sortedInfo.order,
      ...getColumnSearchProps('customer.name', 'Client'),
      filters: Array.from(
        new Set(project?.map((p: any) => p.customer?.name))
      )
        .filter(Boolean)
        .map((name: any) => ({ text: name, value: name })),
      onFilter: (value: any, record: any) => record.customer?.name === value,
      render: (_: any, record: any) => <>{record?.customer?.name}</>,
    },
    {
      title: "Manager",
      dataIndex: ["projectManager", "name"],
      key: "projectManager",
      sorter: (a: any, b: any) => (a.projectManager?.name || '').localeCompare(b.projectManager?.name || ''),
      sortOrder: sortedInfo.columnKey === 'projectManager' && sortedInfo.order,
      ...getColumnSearchProps('projectManager.name', 'Manager'),
      filters: Array.from(
        new Set(project?.map((p: any) => p.projectManager?.name))
      )
        .filter(Boolean)
        .map((name: any) => ({ text: name, value: name })),
      onFilter: (value: any, record: any) => record.projectManager?.name === value,
      render: (_: any, record: any) => (
        record?.projectManager ? (
          <>
            <Avatar
              size={"small"}
              className="bg-zinc-500"
              src={` ${import.meta.env.VITE_BACKEND_URI}/document/${record?.projectManager?.avatar}`}
            >
              {record?.projectManager?.name?.[0]}
            </Avatar>{" "}
            {record?.projectManager?.name}
          </>
        ) : null
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startingDate",
      key: "startingDate",
      sorter: (a: any, b: any) => moment(a.startingDate).unix() - moment(b.startingDate).unix(),
      sortOrder: sortedInfo.columnKey === 'startingDate' && sortedInfo.order,
      ...getColumnSearchProps('startingDate', 'Start Date'),
      render: (_: any, record: any) => {
        if (record.startingDate) {
          const date = new Date(record.startingDate);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        return '';
      }
    },
    {
      title: "End Date",
      dataIndex: "endingDate",
      key: "endingDate",
      sorter: (a: any, b: any) => moment(a.endingDate).unix() - moment(b.endingDate).unix(),
      sortOrder: sortedInfo.columnKey === 'endingDate' && sortedInfo.order,
      ...getColumnSearchProps('endingDate', 'End Date'),
      render: (_: any, record: any) => {
        if (record.endingDate) {
          const date = new Date(record.endingDate);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        return '';
      }
    },
    {
      title: "Lead",
      dataIndex: ["projectLead", "name"],
      key: "projectLead",
      sorter: (a: any, b: any) => (a.projectLead?.name || '').localeCompare(b.projectLead?.name || ''),
      sortOrder: sortedInfo.columnKey === 'projectLead' && sortedInfo.order,
      ...getColumnSearchProps('projectLead.name', 'Lead'),
      filters: Array.from(
        new Set(project?.map((p: any) => p.projectLead?.name))
      )
        .filter(Boolean)
        .map((name: any) => ({ text: name, value: name })),
      onFilter: (value: any, record: any) => record.projectLead?.name === value,
      render: (_: any, record: any) => (
        record?.projectLead ? (
          <>
            <Avatar
              size={"small"}
              className="bg-zinc-500"
              src={` ${import.meta.env.VITE_BACKEND_URI}/document/${record?.projectLead?.avatar}`}
            >
              {record?.projectLead?.name?.[0]}
            </Avatar>{" "}
            {record?.projectLead?.name}
          </>
        ) : null
      ),
    },
    {
      title: "Fiscal Year",
      dataIndex: "fiscalYear",
      key: "fiscalYear",
      sorter: (a, b) => (a.fiscalYear || 0) - (b.fiscalYear || 0),
      sortOrder: sortedInfo.columnKey === 'fiscalYear' && sortedInfo.order,
      filters: Array.from(new Set(filteredProject?.map((p: any) => p.fiscalYear)))
        .filter(Boolean)
        .map((fy: any) => {
          const endYear = (fy + 1).toString().slice(-2);
          return { text: `${fy}/${endYear}`, value: fy };
        }),
      onFilter: (value: any, record: any) => record.fiscalYear === value,
      render: (fiscalYear: number) => {
        if (!fiscalYear) return null;
        const endYear = (fiscalYear + 1).toString().slice(-2);
        return `${fiscalYear}/${endYear}`;
      },
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      hidden: checkPermissionForComponent(
        permissions,
        "projects",
        "patch",
        "/projects/:id"
      )
        ? false
        : true,
      width: 50,
      render: (_: any, record: any) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          ></Button>
        </>
      ),
    },
  ];

  const paginationOptions = {
    current: page,
    pageSize: limit,
    total: filteredProject?.length,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: [5, 10, 20, 30, 50, 100],
    showTotal: (total: number, range: number[]) =>
      `${range[0]}-${range[1]} of ${total}`,
  };

  const rowSelection: TableProps<ProjectType>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: ProjectType[]) => {
      console.log(selectedRowKeys, selectedRows);
    },
    getCheckboxProps: (record: ProjectType) => ({
      name: record.name,
    }),
  };

  return (
    <Card>
      <TableToolbar>
        <div className="flex w-full justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setShowFilters(!showFilters)}
              type={showFilters ? "primary" : "default"}
            >
              Advanced Filters
            </Button>
          </div>
          <Space size={10}>
            {!hideCreateDelete && (
              <Button size="large" color="danger">
                Delete
              </Button>
            )}
            <Tooltip title="Download">
              <Button size="large">
                <DownloadOutlined />
              </Button>
            </Tooltip>
            {!hideCreateDelete && (
              <Button size="large" type="primary" onClick={() => showModal()}>
                Create Project
              </Button>
            )}
          </Space>
        </div>
      </TableToolbar>
      
      {showFilters && (
        <Card className="mb-4">
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={applyFilters}
            initialValues={{}}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="dateRange" label="Date Range">
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
      <Col span={8}>
                <Form.Item name="clientId" label="Client">
                  <Select 
                    placeholder="Select client"
                    allowClear
                    options={project?.map((p: any) => ({
                      label: p.customer?.name,
                      value: p.customer?.id
                    })).filter((item: any) => item.label && item.value)
                      .filter((item: any, index: number, self: any[]) => 
                        index === self.findIndex((t: any) => t.value === item.value)
                      )}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectLeadId" label="Project Lead">
                  <Select 
                    placeholder="Select project lead"
                    allowClear
                    options={project?.map((p: any) => ({
                      label: p.projectLead?.name,
                      value: p.projectLead?.id
                    })).filter((item: any) => item.label && item.value)
                      .filter((item: any, index: number, self: any[]) => 
                        index === self.findIndex((t: any) => t.value === item.value)
                      )}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="projectManagerId" label="Project Manager">
                  <Select 
                    placeholder="Select project manager"
                    allowClear
                    options={project?.map((p: any) => ({
                      label: p.projectManager?.name,
                      value: p.projectManager?.id
                    })).filter((item: any) => item.label && item.value)
                      .filter((item: any, index: number, self: any[]) => 
                        index === self.findIndex((t: any) => t.value === item.value)
                      )}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="natureOfWork" label="Nature of Work">
                  <Select 
                    placeholder="Select nature of work"
                    allowClear
                    options={Array.from(
                      new Set(project?.map((p: any) => {
                        const name = typeof p.natureOfWork === 'object' ? p.natureOfWork?.name : p.natureOfWork;
                        const id = typeof p.natureOfWork === 'object' ? p.natureOfWork?.id : p.natureOfWork;
                        return { label: name, value: id };
                      }))
                    ).filter((item: any) => item.label && item.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="Status">
                  <Select 
                    placeholder="Select status"
                    allowClear
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Suspended", value: "suspended" },
                      { label: "Archived", value: "archived" },
                      { label: "Signed Off", value: "signed_off" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button style={{ marginRight: 8 }} onClick={resetFilters}>
                  Reset
                </Button>
                <Button type="primary" htmlType="submit">
                  Apply Filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      )}
      
      <Table
        loading={isPending}
        pagination={paginationOptions}
        rowSelection={rowSelection}
        showSorterTooltip={true}
        dataSource={filteredProject}
        columns={columns()}
        onChange={handleTableChange}
        rowKey={"id"}
        size="middle"
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
};

export default ProjectTable;
