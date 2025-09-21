import { useState, useEffect } from "react";
import { 
    Table, 
    Button, 
    Space, 
    Modal, 
    Form, 
    Input, 
    Switch, 
    Typography,
    Popconfirm,
    Tag,
    message
} from "antd";
import { 
    EditOutlined, 
    DeleteOutlined, 
    PlusOutlined,
    ExclamationCircleOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { TaskType } from "@/types/todoTask";

const { Title } = Typography;
const { TextArea } = Input;

interface TaskTypeListProps {
    taskTypes: TaskType[];
    loading: boolean;
    onAdd?: (taskType: Partial<TaskType>) => void;
    onEdit?: (id: string, taskType: Partial<TaskType>) => void;
    onDelete?: (id: string) => void;
}

const TaskTypeList = ({
    taskTypes,
    loading,
    onAdd,
    onEdit,
    onDelete
}: TaskTypeListProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTaskType, setEditingTaskType] = useState<TaskType | null>(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Debug log when taskTypes change
    useEffect(() => {
        console.log("TaskTypeList - taskTypes:", taskTypes);
    }, [taskTypes]);

    const showAddModal = () => {
        if (!onAdd) {
            message.error('You do not have permission to add task types');
            return;
        }
        setEditingTaskType(null);
        form.resetFields();
        form.setFieldsValue({ isActive: true }); // Set default active state
        setModalVisible(true);
    };

    const showEditModal = (taskType: TaskType) => {
        if (!onEdit) {
            message.error('You do not have permission to edit task types');
            return;
        }
        setEditingTaskType(taskType);
        form.setFieldsValue(taskType);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            
            if (editingTaskType) {
                if (onEdit) {
                    await onEdit(editingTaskType.id, values);
                } else {
                    message.error('You do not have permission to edit task types');
                }
            } else {
                if (onAdd) {
                    await onAdd(values);
                } else {
                    message.error('You do not have permission to add task types');
                }
            }
            
            setModalVisible(false);
        } catch (error) {
            console.error("Form validation failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (onDelete) {
            setDeletingId(id);
            try {
                await onDelete(id);
            } finally {
                setDeletingId(null);
            }
        } else {
            message.error('You do not have permission to delete task types');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                isActive ? 
                <Tag color="green">Active</Tag> : 
                <Tag color="red">Inactive</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: TaskType) => (
                <Space>
                    {onEdit && (
                        <Button 
                            icon={<EditOutlined />} 
                            size="small"
                            onClick={() => showEditModal(record)}
                        />
                    )}
                    {onDelete && (
                        <Popconfirm
                            title="Are you sure you want to delete this task type?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                            okButtonProps={{ loading: deletingId === record.id }}
                        >
                            <Button 
                                icon={deletingId === record.id ? <LoadingOutlined /> : <DeleteOutlined />} 
                                size="small" 
                                danger
                                loading={deletingId === record.id}
                            />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Title level={4}>Task Types</Title>
                {onAdd && (
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={showAddModal}
                    >
                        Add Task Type
                    </Button>
                )}
            </div>
            
            <Table 
                columns={columns} 
                dataSource={taskTypes} 
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: 'No task types found' }}
            />
            
            <Modal
                title={editingTaskType ? "Edit Task Type" : "Add Task Type"}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                okText={editingTaskType ? "Save" : "Create"}
                confirmLoading={submitting}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter a name' }]}
                    >
                        <Input placeholder="Enter task type name" />
                    </Form.Item>
                    
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea rows={4} placeholder="Enter description (optional)" />
                    </Form.Item>
                    
                    <Form.Item
                        name="isActive"
                        label="Active"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TaskTypeList;