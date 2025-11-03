import { useState, useEffect, useRef } from "react";
import { 
    Table, 
    Tag, 
    Space, 
    Button, 
    Modal, 
    Form, 
    Input, 
    Select, 
    Tooltip, 
    Badge, 
    Dropdown, 
    Menu,
    Typography,
    message
} from "antd";
import { 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    ExclamationCircleOutlined, 
    CloseCircleOutlined,
    EditOutlined,
    EyeOutlined,
    MoreOutlined,
    UserOutlined,
    LikeOutlined,
    PauseCircleOutlined,
    StopOutlined,
    SearchOutlined
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { useSession } from "@/context/SessionContext";
import { TodoTask, TodoTaskStatus } from "@/types/todoTask";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface TodoTaskTableProps {
    viewType: 'my' | 'created' | 'all' | 'by-status' | 'by-user';
    taskData?: TodoTask[];
    isPending?: boolean;
    selectedUserId?: string;
    selectedStatus?: TodoTaskStatus;
    onViewTask?: (task: TodoTask) => void;
    onEditTask?: (task: TodoTask) => void;
    onStatusChange?: (taskId: string, status: TodoTaskStatus, remark: string) => void;
}

const TodoTaskTable = ({
    viewType,
    taskData,
    isPending = false,
    selectedUserId,
    selectedStatus,
    onViewTask,
    onEditTask,
    onStatusChange
}: TodoTaskTableProps) => {
    const { profile } = useSession();
    const [remarkModalVisible, setRemarkModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);
    const [actionType, setActionType] = useState<string>('');
    const [remark, setRemark] = useState('');
    const [form] = Form.useForm();
    
    // For search functionality
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<any>(null);

    // Helper function to get unique values for autocomplete
    const getUniqueValues = (dataIndex: string | string[]) => {
        if (!taskData) return [];
        
        const values = taskData.map((item: any) => {
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

    // Status display configuration
    const statusConfig = {
        [TodoTaskStatus.OPEN]: { 
            color: 'blue', 
            icon: <ClockCircleOutlined />, 
            text: 'Open' 
        },
        [TodoTaskStatus.ACKNOWLEDGED]: { 
            color: 'purple', 
            icon: <LikeOutlined />, 
            text: 'Acknowledged' 
        },
        [TodoTaskStatus.PENDING]: { 
            color: 'orange', 
            icon: <PauseCircleOutlined />, 
            text: 'Pending' 
        },
        [TodoTaskStatus.COMPLETED]: { 
            color: 'green', 
            icon: <CheckCircleOutlined />, 
            text: 'Completed' 
        },
        [TodoTaskStatus.DROPPED]: { 
            color: 'red', 
            icon: <CloseCircleOutlined />, 
            text: 'Dropped' 
        },
    };

    const showRemarkModal = (task: TodoTask, action: string) => {
        setSelectedTask(task);
        setActionType(action);
        setRemarkModalVisible(true);
        
        // Reset remark field
        setRemark('');
        form.resetFields();
    };

    const handleRemarkSubmit = () => {
        if (!selectedTask) return;
        
        let newStatus: TodoTaskStatus;
        
        switch (actionType) {
            case 'acknowledge':
                newStatus = TodoTaskStatus.ACKNOWLEDGED;
                break;
            case 'pending':
                newStatus = TodoTaskStatus.PENDING;
                break;
            case 'complete':
                newStatus = TodoTaskStatus.COMPLETED;
                break;
            case 'drop':
                newStatus = TodoTaskStatus.DROPPED;
                break;
            default:
                message.error('Invalid action');
                return;
        }
        
        if (onStatusChange) {
            onStatusChange(selectedTask.id, newStatus, remark);
        }
        
        setRemarkModalVisible(false);
    };

    const getAvailableActions = (task: TodoTask) => {
        const actions = [];
        const isAssignedToMe = task.assignedToId === profile?.id;
        const isCreatedByMe = task.createdById === profile?.id;
        
        // View action is always available
        actions.push({
            key: 'view',
            label: 'View Details',
            icon: <EyeOutlined />,
            onClick: () => onViewTask && onViewTask(task)
        });
        
        // Edit action is available for creators or tasks in OPEN status
        if (isCreatedByMe && task.status === TodoTaskStatus.OPEN) {
            actions.push({
                key: 'edit',
                label: 'Edit Task',
                icon: <EditOutlined />,
                onClick: () => onEditTask && onEditTask(task)
            });
        }
        
        // Status change actions
        if (isAssignedToMe) {
            // Acknowledge action
            if (task.status === TodoTaskStatus.OPEN) {
                actions.push({
                    key: 'acknowledge',
                    label: 'Acknowledge',
                    icon: <LikeOutlined />,
                    onClick: () => showRemarkModal(task, 'acknowledge')
                });
            }
            
            // Set Pending action
            if (task.status === TodoTaskStatus.ACKNOWLEDGED) {
                actions.push({
                    key: 'pending',
                    label: 'Mark as Pending',
                    icon: <PauseCircleOutlined />,
                    onClick: () => showRemarkModal(task, 'pending')
                });
            }
            
            // Complete action
            if (task.status === TodoTaskStatus.ACKNOWLEDGED || task.status === TodoTaskStatus.PENDING) {
                actions.push({
                    key: 'complete',
                    label: 'Mark as Completed',
                    icon: <CheckCircleOutlined />,
                    onClick: () => showRemarkModal(task, 'complete')
                });
            }
        }
        
        // Drop action for creators
        // Task creator can drop the task if it's not COMPLETED or DROPPED
        if (isCreatedByMe && task.status !== TodoTaskStatus.COMPLETED && task.status !== TodoTaskStatus.DROPPED) {
            actions.push({
                key: 'drop',
                label: 'Drop Task',
                icon: <StopOutlined />,
                onClick: () => showRemarkModal(task, 'drop')
            });
        }
        
        return actions;
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            ...getColumnSearchProps('title', 'Title'),
            render: (text: string, record: TodoTask) => {
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
                        <Text 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => onViewTask && onViewTask(record)}
                            strong
                        >
                            {displayText}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: 'Type',
            dataIndex: ['taskType', 'name'],
            key: 'type',
            ...getColumnSearchProps(['taskType', 'name'], 'Type'),
            render: (text: string) => {
                const displayText = searchedColumn === 'taskType,name' ? (
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={text ? text.toString() : ''}
                    />
                ) : text;
                
                return <Tag>{displayText}</Tag>;
            },
        },
            {
                title: 'Due Date',
                dataIndex: 'dueDate',
                key: 'dueDate',
                render: (date: string) => date ? moment(date).format('YYYY-MM-DD') : <Tag color="default">No Due Date</Tag>,
            },
        {
            title: 'Assigned To',
            dataIndex: ['assignedTo', 'name'],
            key: 'assignedTo',
            ...getColumnSearchProps(['assignedTo', 'name'], 'Assigned To'),
            render: (text: string, record: TodoTask) => {
                const displayName = text || record.assignedTo?.email;
                const highlighted = searchedColumn === 'assignedTo,name' ? (
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={displayName ? displayName.toString() : ''}
                    />
                ) : displayName;
                
                return (
                    <Tooltip title={record.assignedTo?.email}>
                        <Space>
                            <UserOutlined />
                            {highlighted}
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Created By',
            dataIndex: ['createdByUser', 'name'],
            key: 'createdByUser',
            ...getColumnSearchProps(['createdByUser', 'name'], 'Created By'),
            render: (text: string, record: TodoTask) => {
                const displayName = text || record.createdByUser?.email;
                const highlighted = searchedColumn === 'createdByUser,name' ? (
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={displayName ? displayName.toString() : ''}
                    />
                ) : displayName;
                
                return (
                    <Tooltip title={record.createdByUser?.email}>
                        <Space>
                            <UserOutlined />
                            {highlighted}
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Created On',
            dataIndex: 'createdTimestamp',
            key: 'createdOn',
            render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: TodoTaskStatus, record: TodoTask) => {
                const statusInfo = statusConfig[status];
                let statusTimeInfo = '';
                let remarkInfo = '';
                
                // Add timestamp and remark info based on status
                if (status === TodoTaskStatus.ACKNOWLEDGED && record.acknowledgedTimestamp) {
                    statusTimeInfo = `On ${moment(record.acknowledgedTimestamp).format('YYYY-MM-DD HH:mm')}`;
                    remarkInfo = record.acknowledgeRemark || '';
                } else if (status === TodoTaskStatus.PENDING && record.pendingTimestamp) {
                    statusTimeInfo = `On ${moment(record.pendingTimestamp).format('YYYY-MM-DD HH:mm')}`;
                    remarkInfo = record.pendingRemark || '';
                } else if (status === TodoTaskStatus.COMPLETED && record.completedTimestamp) {
                    statusTimeInfo = `On ${moment(record.completedTimestamp).format('YYYY-MM-DD HH:mm')}`;
                    remarkInfo = record.completionRemark || '';
                } else if (status === TodoTaskStatus.DROPPED && record.droppedTimestamp) {
                    statusTimeInfo = `On ${moment(record.droppedTimestamp).format('YYYY-MM-DD HH:mm')}`;
                    remarkInfo = record.droppedRemark || '';
                }
                
                return (
                    <Tooltip title={remarkInfo ? `Remark: ${remarkInfo}` : undefined}>
                        <div>
                            <Tag color={statusInfo.color} icon={statusInfo.icon}>
                                {statusInfo.text}
                            </Tag>
                            {statusTimeInfo && (
                                <div style={{ fontSize: '11px', marginTop: '2px', color: '#888' }}>
                                    {statusTimeInfo}
                                </div>
                            )}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: string, record: TodoTask) => {
                const actions = getAvailableActions(record);
                
                return (
                    <Dropdown 
                        overlay={
                            <Menu items={actions} />
                        } 
                        trigger={['click']}
                    >
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <>
            <Table 
                columns={columns} 
                dataSource={taskData} 
                rowKey="id"
                loading={isPending}
                pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true, 
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tasks`
                }}
            />
            
            <Modal
                title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Task`}
                open={remarkModalVisible}
                onOk={handleRemarkSubmit}
                onCancel={() => setRemarkModalVisible(false)}
                okText="Submit"
            >
                <Form form={form} layout="vertical">
                    <Form.Item 
                        label="Add a remark (optional)" 
                        name="remark"
                    >
                        <TextArea 
                            rows={4} 
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter any comments or details about this action"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default TodoTaskTable;