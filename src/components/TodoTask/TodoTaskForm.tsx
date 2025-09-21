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
    Empty
} from "antd";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { TodoTask, TaskType, TodoTaskStatus } from "@/types/todoTask";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface TodoTaskFormProps {
    initialValues?: Partial<TodoTask>;
    taskTypes: TaskType[];
    users: any[]; // Using any[] since we don't have the full User type
    isSubmitting: boolean;
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
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter task title' }]}
                    >
                        <Input placeholder="Enter task title" />
                    </Form.Item>
                
                <Form.Item
                    name="description"
                    label="Description"
                >
                    <TextArea 
                        rows={4} 
                        placeholder="Enter task description (optional)"
                    />
                </Form.Item>
                
                <Form.Item
                    name="taskTypeId"
                    label="Task Type"
                    rules={[{ required: true, message: 'Please select task type' }]}
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
                
                <Form.Item
                    name="assignedToId"
                    label="Assign To"
                    rules={[{ required: true, message: 'Please select user to assign task' }]}
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