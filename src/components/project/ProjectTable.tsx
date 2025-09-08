import { useSession } from "@/context/SessionContext";
import { useProject } from "@/hooks/project/useProject";
import { ProjectType } from "@/types/project";
import { checkPermissionForComponent } from "@/utils/permission";
import { DownloadOutlined, EditOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Space, Table, TableProps, Tooltip, Input, Select, DatePicker, Form, Row, Col } from "antd";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import SearchBarWithPopover from "../SearchBarPopover";
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
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const searchInput = useRef<any>(null);
  const [form] = Form.useForm();

  // Determine if user is auditsenior or junior
  const userRole = profile?.role?.name?.toLowerCase();
  const hideCreateDelete = userRole === "auditsenior" || userRole === "auditjunior";

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
    setSortedInfo(sorter);
    setFilters(filters);
  };

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
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
    onFilter: (value: string, record: any) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: string, record: any) =>
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

  const applyFilters = (values: any) => {
    console.log("Applied filters:", values);
    // In a real implementation, you would update your API call with these filters
    // For now, we'll just close the filter panel
    setShowFilters(false);
  };

  const resetFilters = () => {
    form.resetFields();
    setShowFilters(false);
  };

  const columns = (): TableProps<ProjectType>["columns"] => [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
      render: (_: any, record: any) => (
        <>
          {record.createdAt && new Date(record.createdAt).toLocaleDateString()}
        </>
      ),
      ...getColumnSearchProps('createdAt', 'Date'),
    },
    {
      title: "Fiscal Year",
      dataIndex: "fiscalYear",
      key: "fiscalYear",
      sorter: (a, b) => (a.fiscalYear || 0) - (b.fiscalYear || 0),
      sortOrder: sortedInfo.columnKey === 'fiscalYear' && sortedInfo.order,
      filters: Array.from(new Set(project?.map((p: any) => p.fiscalYear)))
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
      title: "Project Client",
      dataIndex: ["customer", "name"],
      key: "client",
      sorter: (a, b) => (a.customer?.name || '').localeCompare(b.customer?.name || ''),
      sortOrder: sortedInfo.columnKey === 'client' && sortedInfo.order,
      filters: Array.from(
        new Set(project?.map((p: any) => p.customer?.name))
      )
        .filter(Boolean)
        .map((name: any) => ({ text: name, value: name })),
      onFilter: (value: any, record: any) => record.customer?.name === value,
      render: (_: any, record: any) => <>{record?.customer?.name}</>,
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
      title: "Project Lead",
      dataIndex: ["projectLead", "name"],
      key: "projectLead",
      sorter: (a, b) => (a.projectLead?.name || '').localeCompare(b.projectLead?.name || ''),
      sortOrder: sortedInfo.columnKey === 'projectLead' && sortedInfo.order,
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
      title: "Project Manager",
      dataIndex: ["projectManager", "name"],
      key: "projectManager",
      sorter: (a, b) => (a.projectManager?.name || '').localeCompare(b.projectManager?.name || ''),
      sortOrder: sortedInfo.columnKey === 'projectManager' && sortedInfo.order,
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
      title: "End Date",
      dataIndex: "endingDate",
      key: "endingDate",
      sorter: (a: any, b: any) => moment(a.endingDate).unix() - moment(b.endingDate).unix(),
      sortOrder: sortedInfo.columnKey === 'endingDate' && sortedInfo.order,
      ...getColumnSearchProps('endingDate', 'End Date'),
      render: (_: any, record: any) => {
        // Use endingDateFormatted from backend if available, otherwise fallback to standard formatting
        return record.endingDateFormatted || (record.endingDate ? new Date(record.endingDate).toLocaleDateString() : '');
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "active" },
        { text: "Suspended", value: "suspended" },
        { text: "Archived", value: "archived" },
        { text: "Signed Off", value: "signed_off" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => (
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
          status === 'archived' ? 'bg-gray-100 text-gray-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ')}
        </span>
      )
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
    total: project?.length,
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
            <SearchBarWithPopover />
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
        dataSource={project}
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
