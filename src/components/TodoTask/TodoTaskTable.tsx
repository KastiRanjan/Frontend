import { useState, useEffect } from "react";
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
    StopOutlined
} from "@ant-design/icons";
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
            render: (text: string, record: TodoTask) => (
                <Space>
                    <Text 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => onViewTask && onViewTask(record)}
                        strong
                    >
                        {text}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Type',
            dataIndex: ['taskType', 'name'],
            key: 'type',
            render: (text: string) => <Tag>{text}</Tag>,
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
            render: (text: string, record: TodoTask) => (
                <Tooltip title={record.assignedTo?.email}>
                    <Space>
                        <UserOutlined />
                        {text || record.assignedTo?.email}
                    </Space>
                </Tooltip>
            ),
        },
        {
            title: 'Created By',
            dataIndex: ['createdByUser', 'name'],
            key: 'createdByUser',
            render: (text: string, record: TodoTask) => (
                <Tooltip title={record.createdByUser?.email}>
                    <Space>
                        <UserOutlined />
                        {text || record.createdByUser?.email}
                    </Space>
                </Tooltip>
            ),
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