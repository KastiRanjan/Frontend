import { 
    Card, 
    Descriptions, 
    Tag, 
    Space, 
    Typography, 
    Divider, 
    Button,
    Timeline,
    Tooltip,
    Modal,
    Input
} from "antd";
import { 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined,
    UserOutlined,
    LikeOutlined,
    PauseCircleOutlined,
    EditOutlined,
    ArrowLeftOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { TodoTask, TodoTaskStatus } from "@/types/todoTask";
import moment from "moment";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

interface TodoTaskDetailsProps {
    task: TodoTask;
    loading?: boolean;
    canEdit: boolean;
    canChangeStatus: boolean;
    canDrop?: boolean;
    onBack: () => void;
    onEdit: () => void;
    onStatusChange?: (status: TodoTaskStatus, remark: string) => void;
}

const TodoTaskDetails = ({
    task,
    loading = false,
    canEdit,
    canChangeStatus,
    canDrop = false,
    onBack,
    onEdit,
    onStatusChange
}: TodoTaskDetailsProps) => {
    const [remarkModalVisible, setRemarkModalVisible] = useState(false);
    const [actionType, setActionType] = useState<string>('');
    const [remark, setRemark] = useState('');

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

    const showStatusChangeConfirm = (newStatus: TodoTaskStatus, actionName: string) => {
        setActionType(actionName);
        
        confirm({
            title: `Do you want to ${actionName} this task?`,
            icon: <ExclamationCircleOutlined />,
            content: 'You can add an optional remark to provide context for this action.',
            okText: 'Add Remark',
            cancelText: 'No Remark',
            onOk() {
                setRemarkModalVisible(true);
            },
            onCancel() {
                if (onStatusChange) {
                    onStatusChange(newStatus, '');
                }
            },
        });
    };
    
    const handleRemarkSubmit = () => {
        let newStatus: TodoTaskStatus;
        
        switch (actionType) {
            case 'acknowledge':
                newStatus = TodoTaskStatus.ACKNOWLEDGED;
                break;
            case 'mark as pending':
                newStatus = TodoTaskStatus.PENDING;
                break;
            case 'complete':
                newStatus = TodoTaskStatus.COMPLETED;
                break;
            case 'drop':
                newStatus = TodoTaskStatus.DROPPED;
                break;
            default:
                return;
        }
        
        if (onStatusChange) {
            onStatusChange(newStatus, remark);
        }
        
        setRemarkModalVisible(false);
        setRemark('');
    };

    // Build timeline items based on task history
    const timelineItems = [];
    
    // Creation
    timelineItems.push({
        color: 'blue',
        children: (
            <>
                <Text strong>Task Created</Text>
                <div>
                    By {task.createdByUser?.name || task.createdByUser?.email} on {moment(task.createdTimestamp).format('YYYY-MM-DD HH:mm')}
                </div>
            </>
        ),
    });
    
    // Acknowledgement
    if (task.acknowledgedTimestamp) {
        timelineItems.push({
            color: 'purple',
            children: (
                <>
                    <Text strong>Task Acknowledged</Text>
                    <div>
                        <Text>On {moment(task.acknowledgedTimestamp).format('YYYY-MM-DD HH:mm')}</Text>
                    </div>
                    {task.acknowledgeRemark && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f9f0ff', borderRadius: '4px' }}>
                            <Text type="secondary">Remark: </Text>
                            <Paragraph style={{ marginBottom: 0 }}>{task.acknowledgeRemark}</Paragraph>
                        </div>
                    )}
                </>
            ),
        });
    }
    
    // Pending
    if (task.pendingTimestamp) {
        timelineItems.push({
            color: 'orange',
            children: (
                <>
                    <Text strong>Marked as Pending</Text>
                    <div>
                        <Text>On {moment(task.pendingTimestamp).format('YYYY-MM-DD HH:mm')}</Text>
                    </div>
                    {task.pendingRemark && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fff7e6', borderRadius: '4px' }}>
                            <Text type="secondary">Remark: </Text>
                            <Paragraph style={{ marginBottom: 0 }}>{task.pendingRemark}</Paragraph>
                        </div>
                    )}
                </>
            ),
        });
    }
    
    // Completion
    if (task.completedTimestamp) {
        timelineItems.push({
            color: 'green',
            children: (
                <>
                    <Text strong>Task Completed</Text>
                    <div>
                        <Text>By {task.completedBy?.name || task.completedBy?.email} on {moment(task.completedTimestamp).format('YYYY-MM-DD HH:mm')}</Text>
                    </div>
                    {task.completionRemark && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                            <Text type="secondary">Remark: </Text>
                            <Paragraph style={{ marginBottom: 0 }}>{task.completionRemark}</Paragraph>
                        </div>
                    )}
                </>
            ),
        });
    }
    
    // Dropped
    if (task.droppedTimestamp) {
        timelineItems.push({
            color: 'red',
            children: (
                <>
                    <Text strong>Task Dropped</Text>
                    <div>
                        <Text>On {moment(task.droppedTimestamp).format('YYYY-MM-DD HH:mm')}</Text>
                    </div>
                    {task.droppedRemark && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fff1f0', borderRadius: '4px' }}>
                            <Text type="secondary">Remark: </Text>
                            <Paragraph style={{ marginBottom: 0 }}>{task.droppedRemark}</Paragraph>
                        </div>
                    )}
                </>
            ),
        });
    }

    return (
        <Card
            loading={loading}
            title={
                <Space>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={onBack}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                        Task Details
                    </Title>
                </Space>
            }
            extra={
                canEdit && task.status === TodoTaskStatus.OPEN ? (
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={onEdit}
                    >
                        Edit
                    </Button>
                ) : null
            }
        >
            <Descriptions 
                title={
                    <Space>
                        <Text>{task.title}</Text>
                        <Tag color={statusConfig[task.status].color} icon={statusConfig[task.status].icon}>
                            {statusConfig[task.status].text}
                        </Tag>
                    </Space>
                }
                bordered
                column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="Task Type">
                    {task.taskType?.name || 'Unknown'}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">
                    <Space>
                        <UserOutlined />
                        {task.createdByUser?.name || task.createdByUser?.email || 'Unknown'}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Created Date">
                    {moment(task.createdTimestamp).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Assigned To" span={3}>
                    <Space>
                        <UserOutlined />
                        {task.assignedTo?.name || task.assignedTo?.email || 'Unknown'}
                    </Space>
                </Descriptions.Item>
                
                {task.status === TodoTaskStatus.ACKNOWLEDGED && task.acknowledgedTimestamp && (
                    <Descriptions.Item label="Acknowledged On" span={task.acknowledgeRemark ? 1 : 3}>
                        {moment(task.acknowledgedTimestamp).format('YYYY-MM-DD HH:mm')}
                    </Descriptions.Item>
                )}
                
                {task.status === TodoTaskStatus.ACKNOWLEDGED && task.acknowledgeRemark && (
                    <Descriptions.Item label="Acknowledge Remark" span={2}>
                        {task.acknowledgeRemark}
                    </Descriptions.Item>
                )}
                
                {task.status === TodoTaskStatus.PENDING && task.pendingTimestamp && (
                    <Descriptions.Item label="Marked Pending On" span={task.pendingRemark ? 1 : 3}>
                        {moment(task.pendingTimestamp).format('YYYY-MM-DD HH:mm')}
                    </Descriptions.Item>
                )}
                
                {task.status === TodoTaskStatus.PENDING && task.pendingRemark && (
                    <Descriptions.Item label="Pending Remark" span={2}>
                        {task.pendingRemark}
                    </Descriptions.Item>
                )}
                
                {task.status === TodoTaskStatus.COMPLETED && task.completedTimestamp && (
                    <Descriptions.Item label="Completed On" span={task.completionRemark ? 1 : 3}>
                        {moment(task.completedTimestamp).format('YYYY-MM-DD HH:mm')}
                    </Descriptions.Item>
                )}
                
                {task.status === TodoTaskStatus.COMPLETED && task.completedBy && (
                    <Descriptions.Item label="Completed By" span={task.completionRemark ? 1 : 2}>
                        <Space>
                            <UserOutlined />
                            {task.completedBy?.name || task.completedBy?.email || 'Unknown'}
                        </Space>
                    </Descriptions.Item>
                )}
                
                {task.status === TodoTaskStatus.COMPLETED && task.completionRemark && (
                    <Descriptions.Item label="Completion Remark" span={task.completedBy ? 1 : 2}>
                        {task.completionRemark}
                    </Descriptions.Item>
                )}
                
                {task.status === TodoTaskStatus.DROPPED && task.droppedTimestamp && (
                    <Descriptions.Item label="Dropped On" span={task.droppedRemark ? 1 : 3}>
                        {moment(task.droppedTimestamp).format('YYYY-MM-DD HH:mm')}
                    </Descriptions.Item>
                )}
                
                {task.status === TodoTaskStatus.DROPPED && task.droppedRemark && (
                    <Descriptions.Item label="Dropped Remark" span={2}>
                        {task.droppedRemark}
                    </Descriptions.Item>
                )}
                
                <Descriptions.Item label="Description" span={3}>
                    {task.description || 'No description provided'}
                </Descriptions.Item>
            </Descriptions>
            
            {(canChangeStatus || canDrop) && (
                <>
                    <Divider />
                    <Space style={{ marginBottom: 16 }}>
                        {/* Status change actions for assigned users */}
                        {canChangeStatus && task.status === TodoTaskStatus.OPEN && (
                            <Button 
                                type="primary"
                                icon={<LikeOutlined />}
                                onClick={() => showStatusChangeConfirm(TodoTaskStatus.ACKNOWLEDGED, 'acknowledge')}
                            >
                                Acknowledge
                            </Button>
                        )}
                        {canChangeStatus && task.status === TodoTaskStatus.ACKNOWLEDGED && (
                            <Button 
                                icon={<PauseCircleOutlined />}
                                onClick={() => showStatusChangeConfirm(TodoTaskStatus.PENDING, 'mark as pending')}
                                style={{ backgroundColor: '#fa8c16', color: 'white' }}
                            >
                                Mark as Pending
                            </Button>
                        )}
                        {canChangeStatus && (task.status === TodoTaskStatus.ACKNOWLEDGED || task.status === TodoTaskStatus.PENDING) && (
                            <Button 
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => showStatusChangeConfirm(TodoTaskStatus.COMPLETED, 'complete')}
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            >
                                Complete Task
                            </Button>
                        )}
                        
                        {/* Drop action for task creators */}
                        {canDrop && task.status !== TodoTaskStatus.COMPLETED && task.status !== TodoTaskStatus.DROPPED && (
                            <Button 
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => showStatusChangeConfirm(TodoTaskStatus.DROPPED, 'drop')}
                            >
                                Drop Task
                            </Button>
                        )}
                    </Space>
                </>
            )}
            
            <Divider orientation="left">Task History</Divider>
            <Timeline 
                mode="left"
                items={timelineItems}
            />

            <Modal
                title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Task`}
                open={remarkModalVisible}
                onOk={handleRemarkSubmit}
                onCancel={() => setRemarkModalVisible(false)}
                okText="Submit"
            >
                <Typography.Paragraph>
                    Add a remark to provide context for this action (optional):
                </Typography.Paragraph>
                <Input.TextArea 
                    rows={4} 
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Enter your remark here..."
                />
            </Modal>
        </Card>
    );
};

export default TodoTaskDetails;