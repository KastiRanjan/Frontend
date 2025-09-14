import { useEditTask } from "@/hooks/task/useEditTask";
import { useMarkTasksComplete } from "@/hooks/task/useMarkTasksComplete";
import { useFirstVerifyTasks, useSecondVerifyTasks } from "@/hooks/task/useVerifyTasks";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { TaskType } from "@/types/task";
import { useSession } from "@/context/SessionContext";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Form,
  Table,
  TableProps,
  Tooltip,
  Input,
  Space,
  message,
  notification,
  Tag
} from "antd";
import { useMemo, useState, useRef } from "react";
import Highlighter from 'react-highlight-words';

const RequestTaskTable = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { mutate } = useEditTask();
  const { data: users } = useUser({ status: "active", limit: 100, page: 1, keywords: "" });
  const [selectedTask, setSelectedTask] = useState<TaskType>({} as TaskType);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const searchInput = useRef<any>(null);
  
  // Mark complete functionality
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { mutate: markTasksComplete, isPending: isMarkingComplete } = useMarkTasksComplete();
  const { mutate: firstVerifyTasks, isPending: isFirstVerifying } = useFirstVerifyTasks();
  const { mutate: secondVerifyTasks, isPending: isSecondVerifying } = useSecondVerifyTasks();
  const { profile } = useSession();

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
    setSortedInfo(sorter);
  };

  const handleMarkComplete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one task to mark as complete");
      return;
    }

    const userIdForComplete = (profile as any)?.id;
    if (!userIdForComplete) {
      message.error("Unable to identify current user");
      return;
    }

    markTasksComplete({
      taskIds: selectedRowKeys.map(key => Number(key)),
      completedBy: userIdForComplete
    }, {
      onSuccess: (data) => {
        console.log("Mark complete response:", data);
        
        if (data?.success && data.success.length > 0) {
          message.success(`${data.success.length} task(s) marked as complete`);
        }
        
        if (data?.errors && data.errors.length > 0) {
          console.log("Validation errors found:", data.errors);
          
          if (data.errors.length > 1) {
            notification.error({
              message: `${data.errors.length} Task(s) Failed to Complete`,
              description: (
                <div>
                  {data.errors.map((error: any, index: number) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      <strong>{error.taskName}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              ),
              duration: 8,
              placement: 'topRight',
            });
          } else {
            const error = data.errors[0];
            message.error(`${error.taskName}: ${error.error}`, 6);
          }
        }
        
        if (!data?.success?.length && !data?.errors?.length) {
          message.info("No tasks were processed");
        }
        
        setSelectedRowKeys([]);
      },
      onError: (error: any) => {
        console.error("Mark complete API error:", error);
        const errorMessage = error.response?.data?.message || "Failed to mark tasks as complete";
        message.error(errorMessage);
      },
    });
  };

  const handleSingleMarkComplete = (task: any) => {
    const userIdForComplete = (profile as any)?.id;
    if (!userIdForComplete) {
      message.error("Unable to identify current user");
      return;
    }

    if (task.status !== 'in_progress') {
      message.warning("Only tasks that are in progress can be marked as complete");
      return;
    }

    markTasksComplete({
      taskIds: [task.id],
      completedBy: userIdForComplete
    }, {
      onSuccess: (data) => {
        console.log("Single mark complete response:", data);
        
        if (data?.success && data.success.length > 0) {
          message.success(`Task "${task.name}" marked as complete`);
        }
        
        if (data?.errors && data.errors.length > 0) {
          console.log("Single task validation errors:", data.errors);
          const error = data.errors[0];
          notification.error({
            message: 'Task Completion Failed',
            description: `${error.taskName}: ${error.error}`,
            duration: 6,
            placement: 'topRight',
          });
        }
        
        if (!data?.success?.length && !data?.errors?.length) {
          message.info("Task was not processed");
        }
      },
      onError: (error: any) => {
        console.error("Single mark complete API error:", error);
        const errorMessage = error.response?.data?.message || "Failed to mark task as complete";
        message.error(errorMessage);
      },
    });
  };

  const handleFirstVerify = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one task to verify");
      return;
    }

    const userIdForVerify = (profile as any)?.id;
    if (!userIdForVerify) {
      message.error("Unable to identify current user");
      return;
    }

    firstVerifyTasks({
      taskIds: selectedRowKeys.map(key => Number(key)),
      firstVerifiedBy: userIdForVerify
    }, {
      onSuccess: (data) => {
        if (data?.success && data.success.length > 0) {
          message.success(`${data.success.length} task(s) first verified`);
        }
        
        if (data?.errors && data.errors.length > 0) {
          if (data.errors.length > 1) {
            notification.error({
              message: `${data.errors.length} Task(s) Failed First Verification`,
              description: (
                <div>
                  {data.errors.map((error: any, index: number) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      <strong>{error.taskName}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              ),
              duration: 8,
              placement: 'topRight',
            });
          } else {
            const error = data.errors[0];
            message.error(`${error.taskName}: ${error.error}`, 6);
          }
        }
        
        setSelectedRowKeys([]);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to verify tasks";
        message.error(errorMessage);
      },
    });
  };

  const handleSecondVerify = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one task for second verification");
      return;
    }

    const userIdForVerify = (profile as any)?.id;
    if (!userIdForVerify) {
      message.error("Unable to identify current user");
      return;
    }

    secondVerifyTasks({
      taskIds: selectedRowKeys.map(key => Number(key)),
      secondVerifiedBy: userIdForVerify
    }, {
      onSuccess: (data) => {
        if (data?.success && data.success.length > 0) {
          message.success(`${data.success.length} task(s) second verified`);
        }
        
        if (data?.errors && data.errors.length > 0) {
          if (data.errors.length > 1) {
            notification.error({
              message: `${data.errors.length} Task(s) Failed Second Verification`,
              description: (
                <div>
                  {data.errors.map((error: any, index: number) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      <strong>{error.taskName}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              ),
              duration: 8,
              placement: 'topRight',
            });
          } else {
            const error = data.errors[0];
            message.error(`${error.taskName}: ${error.error}`, 6);
          }
        }
        
        setSelectedRowKeys([]);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to verify tasks";
        message.error(errorMessage);
      },
    });
  };

  const handleSingleFirstVerify = (task: any) => {
    const userIdForVerify = (profile as any)?.id;
    if (!userIdForVerify) {
      message.error("Unable to identify current user");
      return;
    }

    if (task.status !== 'done' || task.firstVerifiedAt) {
      message.warning("Only completed tasks that haven't been verified yet can be first verified");
      return;
    }

    firstVerifyTasks({
      taskIds: [task.id],
      firstVerifiedBy: userIdForVerify
    }, {
      onSuccess: (data) => {
        if (data?.success && data.success.length > 0) {
          message.success(`Task "${task.name}" first verified`);
        }
        
        if (data?.errors && data.errors.length > 0) {
          const error = data.errors[0];
          notification.error({
            message: 'Task First Verification Failed',
            description: `${error.taskName}: ${error.error}`,
            duration: 6,
            placement: 'topRight',
          });
        }
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to verify task";
        message.error(errorMessage);
      },
    });
  };

  const handleSingleSecondVerify = (task: any) => {
    const userIdForVerify = (profile as any)?.id;
    if (!userIdForVerify) {
      message.error("Unable to identify current user");
      return;
    }

    if (!task.firstVerifiedAt || task.secondVerifiedAt) {
      message.warning("Only first verified tasks that haven't been second verified yet can be second verified");
      return;
    }

    secondVerifyTasks({
      taskIds: [task.id],
      secondVerifiedBy: userIdForVerify
    }, {
      onSuccess: (data) => {
        if (data?.success && data.success.length > 0) {
          message.success(`Task "${task.name}" second verified`);
        }
        
        if (data?.errors && data.errors.length > 0) {
          const error = data.errors[0];
          notification.error({
            message: 'Task Second Verification Failed',
            description: `${error.taskName}: ${error.error}`,
            duration: 6,
            placement: 'topRight',
          });
        }
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to verify task";
        message.error(errorMessage);
      },
    });
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


  const showModal = (record: TaskType) => {
    setSelectedTask(record);
    // Additional modal logic can go here
  };

  const columns = useMemo(
    () => [
      {
        title: "Task",
        dataIndex: "name",
        key: "name",
        sorter: (a: TaskType, b: TaskType) => a.name.localeCompare(b.name),
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        ...getColumnSearchProps('name', 'Task'),
      },
      {
        title: "Group",
        dataIndex: "group",
        key: "group",
        sorter: (a: TaskType, b: TaskType) => {
          const groupNameA = a.group?.name || '';
          const groupNameB = b.group?.name || '';
          return groupNameA.localeCompare(groupNameB);
        },
        sortOrder: sortedInfo.columnKey === 'group' && sortedInfo.order,
        ...getColumnSearchProps('group.name', 'Group'),
        render: (_: any, record: TaskType) => {
          return record.group?.name;
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        sorter: (a: TaskType, b: TaskType) => {
          const statusA = a.status || '';
          const statusB = b.status || '';
          return statusA.localeCompare(statusB);
        },
        sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
        ...getColumnSearchProps('status', 'Status'),
        render: (_: any, record: any) => {
          return (
            <>
              <Badge
                count={record.status}
                color="#52c41a"
                style={{ cursor: "pointer" }}
              />
            </>
          );
        }
      },
      {
        title: "Assignee",
        dataIndex: "assignees",
        key: "assignees",
        render: (_: any, record: TaskType) => {
          return (
            <>
              <Avatar.Group
                max={{
                  count: 2,
                  style: {
                    color: "#f56a00",
                    backgroundColor: "#fde3cf",
                    cursor: "pointer",
                  },
                  popover: { trigger: "click" },
                }}
              >
                {record.assignees && record.assignees.length > 0 &&
                  record.assignees.map((user: any) => (
                    <Tooltip key={user.id} title={user.username} placement="top">
                      <Avatar style={{ backgroundColor: "#87d068" }}>
                        {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                      </Avatar>
                    </Tooltip>
                  ))}
              </Avatar.Group>
            </>
          );
        },
      },
      {
        title: "Due date",
        dataIndex: "dueDate",
        key: "dueDate",
        sorter: (a: TaskType, b: TaskType) => {
          if (!a.dueDate) return -1;
          if (!b.dueDate) return 1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        },
        sortOrder: sortedInfo.columnKey === 'dueDate' && sortedInfo.order,
        render: (_: any, record: any) => {
          return (
            <>
              {record?.dueDate ? <span>{new Date(record.dueDate).toLocaleDateString()}</span> : '---'}
            </>
          );
        }
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        sorter: (a: TaskType, b: TaskType) => {
          const priorityA = a.priority || '';
          const priorityB = b.priority || '';
          return priorityA.localeCompare(priorityB);
        },
        sortOrder: sortedInfo.columnKey === 'priority' && sortedInfo.order,
        ...getColumnSearchProps('priority', 'Priority'),
      },
      // Mark Complete column
      {
        title: "Complete",
        key: "markComplete",
        render: (_: any, record: TaskType) => {
          // Don't show mark complete for TODO (open) status
          if (record.status === 'open') {
            return null;
          }
          
          const isEligible = record.status === 'in_progress';
          const isCompleted = record.status === 'done';
          
          if (isCompleted) {
            return (
              <Tag color="green" style={{ fontSize: '11px' }}>
                ✓ Completed
              </Tag>
            );
          }
          
          if (!isEligible) {
            return (
              <Tag color="default" style={{ fontSize: '11px' }}>
                Not Eligible
              </Tag>
            );
          }

          return (
            <Button
              type="link"
              size="small"
              onClick={() => handleSingleMarkComplete(record)}
              disabled={isMarkingComplete}
              style={{ 
                color: '#52c41a', 
                padding: '0 4px',
                fontSize: '12px',
                height: 'auto'
              }}
            >
              ✓ Complete
            </Button>
          );
        },
      },
      // First Verification column
      {
        title: "1st Verify",
        key: "firstVerify",
        render: (_: any, record: TaskType) => {
          // Don't show verification for TODO (open) or Doing (in_progress) status
          if (record.status === 'open' || record.status === 'in_progress') {
            return null;
          }
          
          const canFirstVerify = record.status === 'done' && !record.firstVerifiedAt;
          const isFirstVerified = record.firstVerifiedAt;
          const isSecondVerified = record.secondVerifiedAt;
          
          if (isSecondVerified) {
            return (
              <Tooltip title={`First verified at ${record.firstVerifiedAt ? new Date(record.firstVerifiedAt).toLocaleString() : 'Unknown time'}, Second verified at ${record.secondVerifiedAt ? new Date(record.secondVerifiedAt).toLocaleString() : 'Unknown time'}`}>
                <Tag color="blue" style={{ fontSize: '11px' }}>
                  ✓✓ 2nd Done
                </Tag>
              </Tooltip>
            );
          }
          
          if (isFirstVerified) {
            return (
              <Tooltip title={`First verified at ${record.firstVerifiedAt ? new Date(record.firstVerifiedAt).toLocaleString() : 'Unknown time'}`}>
                <Tag color="blue" style={{ fontSize: '11px' }}>
                  ✓ 1st Done
                </Tag>
              </Tooltip>
            );
          }
          
          if (!canFirstVerify) {
            return (
              <Tag color="default" style={{ fontSize: '11px' }}>
                Not Ready
              </Tag>
            );
          }

          return (
            <Button
              type="link"
              size="small"
              onClick={() => handleSingleFirstVerify(record)}
              disabled={isFirstVerifying}
              style={{ 
                color: '#1890ff', 
                padding: '0 4px',
                fontSize: '12px',
                height: 'auto'
              }}
            >
              ✓ 1st Verify
            </Button>
          );
        },
      },
      // Second Verification column
      {
        title: "2nd Verify",
        key: "secondVerify",
        render: (_: any, record: TaskType) => {
          // Don't show verification for TODO (open) or Doing (in_progress) status
          if (record.status === 'open' || record.status === 'in_progress') {
            return null;
          }
          
          const canSecondVerify = record.firstVerifiedAt && !record.secondVerifiedAt;
          const isSecondVerified = record.secondVerifiedAt;
          
          if (isSecondVerified) {
            return (
              <Tooltip title={`Second verified at ${record.secondVerifiedAt ? new Date(record.secondVerifiedAt).toLocaleString() : 'Unknown time'}`}>
                <Tag color="green" style={{ fontSize: '11px' }}>
                  ✓ 2nd Done
                </Tag>
              </Tooltip>
            );
          }
          
          if (!canSecondVerify) {
            return (
              <Tag color="default" style={{ fontSize: '11px' }}>
                Not Ready
              </Tag>
            );
          }

          return (
            <Button
              type="link"
              size="small"
              onClick={() => handleSingleSecondVerify(record)}
              disabled={isSecondVerifying}
              style={{ 
                color: '#722ed1', 
                padding: '0 4px',
                fontSize: '12px',
                height: 'auto'
              }}
            >
              ✓ 2nd Verify
            </Button>
          );
        },
      },
      {
        title: "",
        key: "action",
        width: 50,
        render: (_: any, record: TaskType) => (
          <>
            <Button type="primary" onClick={() => showModal(record)} icon={<EditOutlined />}></Button>
          </>
        )
      }
    ],
    [sortedInfo, searchText, searchedColumn]
  );


  const onFinish = (values: any) => {
    mutate({ id: selectedTask.id, payload: values });
  };

  const rowSelection: TableProps<TaskType>["rowSelection"] = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: TaskType[]) => {
      console.log('Selected row keys:', selectedRowKeys, selectedRows);
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record: TaskType) => ({
      name: record.name,
    }),
  };

  return (
    <>
      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            type="primary"
            onClick={handleMarkComplete}
            disabled={isMarkingComplete}
            loading={isMarkingComplete}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Mark {selectedRowKeys.length} Task{selectedRowKeys.length > 1 ? 's' : ''} Complete
          </Button>
          <Button
            type="primary"
            onClick={handleFirstVerify}
            disabled={isFirstVerifying}
            loading={isFirstVerifying}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
          >
            1st Verify {selectedRowKeys.length} Task{selectedRowKeys.length > 1 ? 's' : ''}
          </Button>
          <Button
            type="primary"
            onClick={handleSecondVerify}
            disabled={isSecondVerifying}
            loading={isSecondVerifying}
            style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
          >
            2nd Verify {selectedRowKeys.length} Task{selectedRowKeys.length > 1 ? 's' : ''}
          </Button>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {selectedRowKeys.length} task{selectedRowKeys.length > 1 ? 's' : ''} selected
          </span>
        </div>
      )}
      <Table
        columns={columns}
        dataSource={[]}
        rowSelection={rowSelection}
        rowKey={"id"}
        size="small"
        bordered
        onChange={handleTableChange}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [5, 10, 20, 50],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    </>
  );
};

export default RequestTaskTable;
