import { useState, useEffect } from "react";
import { 
    Form, 
    Input, 
    Select, 
    Button, 
    Space, 
    Card, 
    Typography,
    Divider,
    Spin,
    Empty,
    DatePicker
} from "antd";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { TodoTask, TaskType, TodoTaskStatus } from "@/types/todoTask";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface TodoTaskFormProps {
    initialValues?: Partial<TodoTask>;
    taskTypes: TaskType[];
    users: any[]; 
    isTaskTypesLoading?: boolean;
    isUsersLoading?: boolean;
    mode: 'create' | 'edit';
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const TodoTaskForm = ({
    initialValues,
    taskTypes,
    users,
    isSubmitting,
    isTaskTypesLoading = false,
    isUsersLoading = false,
    mode,
    onSubmit,
    onCancel
}: TodoTaskFormProps) => {
    const [form] = Form.useForm();
    
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);
    
    const handleSubmit = (values: any) => {
        // Merge date and time into a single ISO string
        if (values.dueDate && typeof values.dueDate === 'object' && values.dueDate.toISOString) {
            values.dueDate = values.dueDate.toISOString();
        }
        // Remove dueTime if present
        if ('dueTime' in values) {
            delete values.dueTime;
        }
        onSubmit(values);
    };
    
    return (
        <Card>
            <Title level={4}>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</Title>
            <Divider />
            
            <Spin spinning={isTaskTypesLoading || isUsersLoading} tip="Loading data...">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={initialValues || {}}
                >
                    <div style={{ display: 'flex', width: '100%', gap: 16 }}>
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: 'Please enter task title' }]}
                            style={{ flex: '0 1 70%' }}
                        >
                            <Input placeholder="Enter task title" />
                        </Form.Item>
                        <Form.Item
                            name="taskTypeId"
                            label="Task Type"
                            rules={[{ required: true, message: 'Please select task type' }]}
                            style={{ flex: '0 1 30%' }}
                        >
                            <Select 
                                placeholder={isTaskTypesLoading ? "Loading task types..." : "Select task type"}
                                loading={isTaskTypesLoading}
                                disabled={isTaskTypesLoading}
                            >
                                {taskTypes.map(type => (
                                    <Option key={type.id} value={type.id}>{type.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea 
                            rows={4} 
                            placeholder="Enter task description (optional)"
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', width: '100%', gap: 16 }}>
                        <Form.Item
                            name="assignedToId"
                            label="Assign To"
                            rules={[{ required: true, message: 'Please select user to assign task' }]}
                            style={{ flex: '0 1 50%' }}
                        >
                            <Select 
                                placeholder={isUsersLoading ? "Loading users..." : "Select user"}
                                showSearch
                                optionFilterProp="children"
                                loading={isUsersLoading}
                                disabled={isUsersLoading}
                                filterOption={(input, option) => 
                                    (option?.children as unknown as string)
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isUsersLoading ? 
                                    <div style={{ padding: '10px', textAlign: 'center' }}>
                                        <LoadingOutlined style={{ marginRight: '8px' }} />
                                        Loading users...
                                    </div> : 
                                    <Empty 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                        description="No users found" 
                                    />
                                }
                            >
                                {users && users.length > 0 ? (
                                    users.map(user => (
                                        <Option key={user.id} value={user.id}>
                                            <Space>
                                                <UserOutlined />
                                                {user.name || user.username || user.email || `User #${user.id}`}
                                                {user.role && user.role.name && 
                                                    <span style={{ color: '#999', fontSize: '12px' }}>
                                                        ({user.role.name})
                                                    </span>
                                                }
                                            </Space>
                                        </Option>
                                    ))
                                ) : (
                                    <Option disabled value="">No users available</Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="dueDate"
                            label="Due Date & Time"
                            rules={[{ required: false }]}
                            style={{ flex: '0 1 50%' }}
                        >
                            <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
                        </Form.Item>
                    </div>

                    <Divider />

                    <Form.Item>
                        <Space>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                loading={isSubmitting}
                            >
                                {mode === 'create' ? 'Create Task' : 'Save Changes'}
                            </Button>
                            <Button onClick={onCancel}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
        </Card>
    );
};

export default TodoTaskForm;