import { useState, useEffect } from "react";
import { 
    Card, 
    Tabs, 
    Space, 
    Typography, 
    Button, 
    Select,
    Alert,
    DatePicker,
    Modal,
    message
} from "antd";
import { 
    PlusOutlined, 
    OrderedListOutlined, 
    SettingOutlined
} from "@ant-design/icons";
import { useSession } from "@/context/SessionContext";
import TodoTaskTable from "@/components/TodoTask/TodoTaskTable";
import TodoTaskForm from "@/components/TodoTask/TodoTaskForm";
import TodoTaskDetails from "@/components/TodoTask/TodoTaskDetails";
import { TodoTask, TodoTaskStatus } from "@/types/todoTask";
import { fetchTaskTypes } from "@/service/taskType.service";
import { fetchUsers } from "@/service/user.service";
import { 
    fetchTodoTasks,
    fetchTodoTasksByAssignedUser,
    fetchTodoTasksByCreatedUser,
    createTodoTask,
    updateTodoTask,
    acknowledgeTodoTask,
    markTodoTaskAsPending,
    completeTodoTask,
    dropTodoTask
} from "@/service/todoTask.service";
import { useNavigate } from "react-router-dom";
import "./TodoTask.css";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const TodoTaskPage = () => {
    const { profile } = useSession();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my-tasks');
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
    const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);
    const [filterUserId, setFilterUserId] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<TodoTaskStatus | "">("");
    const [taskData, setTaskData] = useState<TodoTask[]>([]);
    const [taskTypes, setTaskTypes] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTaskTypesLoading, setIsTaskTypesLoading] = useState(false);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    
    // Fetch task types from API
    const loadTaskTypes = async () => {
        setIsTaskTypesLoading(true);
        try {
            const response = await fetchTaskTypes();
            console.log('Fetched task types:', response);
            setTaskTypes(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching task types:', error);
            message.error('Failed to load task types');
        } finally {
            setIsTaskTypesLoading(false);
        }
    };

    // Fetch users from API
    const loadUsers = async () => {
        setIsUsersLoading(true);
        try {
            const response = await fetchUsers({ status: 'active', limit: 100, page: 1, keywords: '' });
            console.log('Fetched users response:', response);
            
            // Handle the paginated response structure
            if (response && response.results && Array.isArray(response.results)) {
                setUsers(response.results);
            } else if (Array.isArray(response)) {
                // Handle case where API might return an array directly
                setUsers(response);
            } else {
                console.error('Unexpected users response format:', response);
                setUsers([]);
                message.error('Failed to parse user data');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Failed to load users');
            setUsers([]);
        } finally {
            setIsUsersLoading(false);
        }
    };

    // Fetch tasks based on active tab
    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            // Check permission for all-tasks tab
            if (activeTab === 'all-tasks' && !hasViewAllPermission) {
                console.log("User doesn't have permission to view all tasks, switching tabs");
                setActiveTab('my-tasks');
                setIsLoading(false);
                return;
            }
            
            let response;
            const userId = (profile as any)?.id;
            
            if (!userId && activeTab !== 'all-tasks') {
                console.log("No user ID available and not on all-tasks tab");
                setTaskData([]);
                setIsLoading(false);
                return;
            }
            
    // Remove the redundant permission check since we now do it at the beginning of fetchTasks
    console.log(`Fetching tasks for tab: ${activeTab}, userId: ${userId}, filterUserId: ${filterUserId}, filterStatus: ${filterStatus}`);            if (activeTab === 'my-tasks') {
                // If status filter is applied for My Tasks
                if (filterStatus) {
                    console.log(`Fetching my tasks with status: ${filterStatus}`);
                    response = await fetchTodoTasksByAssignedUser(userId, filterStatus);
                } else {
                    console.log('Fetching all my tasks');
                    response = await fetchTodoTasksByAssignedUser(userId);
                }
            } else if (activeTab === 'created-tasks') {
                // If status filter is applied for Created By Me
                if (filterStatus) {
                    console.log(`Fetching created tasks with status: ${filterStatus}`);
                    response = await fetchTodoTasksByCreatedUser(userId, filterStatus);
                } else {
                    console.log('Fetching all created tasks');
                    response = await fetchTodoTasksByCreatedUser(userId);
                }
            } else {
                // All tasks tab
                if (filterUserId && filterStatus) {
                    // Both user and status filters are applied - use the updated service function
                    console.log(`Fetching all tasks with filters - user: ${filterUserId}, status: ${filterStatus}`);
                    try {
                        response = await fetchTodoTasks(filterStatus, filterUserId);
                    } catch (error) {
                        console.error('Error fetching filtered tasks:', error);
                        
                        // Fallback to assigned user endpoint if there's a permission issue
                        console.log('Falling back to assigned user endpoint');
                        response = await fetchTodoTasksByAssignedUser(filterUserId, filterStatus);
                    }
                } else if (filterUserId) {
                    // Only user filter is applied
                    console.log(`Fetching all tasks with filter - user: ${filterUserId}`);
                    try {
                        response = await fetchTodoTasks(undefined, filterUserId);
                    } catch (error) {
                        console.error('Error fetching tasks by user:', error);
                        
                        // Fallback to assigned user endpoint
                        console.log('Falling back to assigned user endpoint');
                        response = await fetchTodoTasksByAssignedUser(filterUserId);
                    }
                } else if (filterStatus) {
                    // Only status filter is applied
                    console.log(`Fetching all tasks with status: ${filterStatus}`);
                    response = await fetchTodoTasks(filterStatus);
                } else {
                    // No filters, fetch all tasks
                    console.log('Fetching all tasks with no filters');
                    response = await fetchTodoTasks();
                }
            }
            
            console.log('Fetched tasks:', response);
            
            // Verify the response structure and update task data
            if (response && (Array.isArray(response) || (response.data && Array.isArray(response.data)))) {
                const taskArray = Array.isArray(response) ? response : response.data;
                console.log('Setting task data with:', taskArray.length, 'items');
                setTaskData(taskArray);
            } else {
                console.warn('Unexpected response format:', response);
                setTaskData([]);
            }
        } catch (error: any) {
            console.error('Error fetching tasks:', error);
            
            // Handle specific error cases
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
                if (error.response.status === 403) {
                    message.error('You do not have permission to view these tasks');
                } else {
                    message.error('Failed to load tasks: ' + (error.response.data?.message || 'Unknown error'));
                }
            } else if (error.request) {
                console.error('No response received:', error.request);
                message.error('No response from server. Please check your connection.');
            } else {
                message.error('Failed to load tasks: ' + (error.message || 'Unknown error'));
            }
            
            setTaskData([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreateTask = async (values: any) => {
        try {
            console.log('Creating task:', values);
            await createTodoTask(values);
            message.success('Task created successfully');
            setViewMode('list');
            fetchTasks(); // Refresh task list
        } catch (error) {
            console.error('Error creating task:', error);
            message.error('Failed to create task');
        }
    };
    
    const handleUpdateTask = async (values: any) => {
        if (!selectedTask) return;
        
        try {
            console.log('Updating task:', values);
            await updateTodoTask({ id: selectedTask.id, payload: values });
            message.success('Task updated successfully');
            setViewMode('list');
            fetchTasks(); // Refresh task list
        } catch (error) {
            console.error('Error updating task:', error);
            message.error('Failed to update task');
        }
    };
    
    const handleStatusChange = async (taskId: string, status: TodoTaskStatus, remark: string) => {
        try {
            switch (status) {
                case TodoTaskStatus.ACKNOWLEDGED:
                    await acknowledgeTodoTask({ id: taskId, payload: { acknowledgeRemark: remark } });
                    break;
                case TodoTaskStatus.PENDING:
                    await markTodoTaskAsPending({ id: taskId, payload: { pendingRemark: remark } });
                    break;
                case TodoTaskStatus.COMPLETED:
                    await completeTodoTask({ id: taskId, payload: { completionRemark: remark } });
                    break;
                case TodoTaskStatus.DROPPED:
                    await dropTodoTask({ id: taskId, payload: { droppedRemark: remark } });
                    break;
                default:
                    message.error(`Unsupported status change: ${status}`);
                    return;
            }
            
            message.success(`Task status updated to ${status}`);
            fetchTasks(); // Refresh task list
        } catch (error) {
            console.error('Error changing task status:', error);
            message.error('Failed to update task status');
        }
    };
    
    const handleTaskStatusChange = async (status: TodoTaskStatus, remark: string) => {
        if (!selectedTask) return;
        await handleStatusChange(selectedTask.id, status, remark);
    };
    
    // Get permissions
    const { permissions = [] } = useSession();
    
    const hasCreatePermission = permissions.some((permission: any) => 
        permission.method === 'post' && permission.resource === 'todo-task'
    );
    
    // Check specifically for all-tasks view permission
    const hasViewAllPermission = permissions.some((permission: any) => 
        // Look specifically for endpoint paths that would grant all-task viewing permissions
        ((permission.method === 'get' && permission.resource === 'todo-task' && 
          (!permission.path || permission.path === '/todo-task' || permission.path === '/todo-task/status/:status'))) ||
        (permission.method === 'view-all' && permission.resource === 'todo-task') ||
        (permission.method === 'manage' && permission.resource === 'todo-task')
    );
    
    const hasManagePermission = permissions.some((permission: any) => 
        permission.method === 'manage' && permission.resource === 'todo-task'
    );

    
    // Before rendering, verify if user should see All Tasks tab
    const shouldShowAllTasksTab = hasViewAllPermission;
    console.log('Should show All Tasks tab:', shouldShowAllTasksTab);
    
    // Handler for viewing a task
    const handleViewTask = (task: TodoTask) => {
        setSelectedTask(task);
        setViewMode('view');
    };
    
    // Handler for editing a task
    const handleEditTask = (task: TodoTask) => {
        setSelectedTask(task);
        setViewMode('edit');
    };
    
    // Determine if current user can edit the selected task
    const canEditSelectedTask = () => {
        if (!selectedTask) return false;
        
        // Check if user is the creator and task is still OPEN
        const isCreator = selectedTask.createdById === (profile as any)?.id;
        const isOpen = selectedTask.status === TodoTaskStatus.OPEN;
        
        return (isCreator && isOpen) || hasManagePermission;
    };
    
    // Determine if current user can change status of the selected task
    const canChangeSelectedTaskStatus = () => {
        if (!selectedTask) return false;
        
        // Check if user is assigned to this task
        const isAssigned = selectedTask.assignedToId === (profile as any)?.id;
        
        // Check if task is in a state that can be changed
        const canChangeStatus = selectedTask.status !== TodoTaskStatus.COMPLETED && 
                               selectedTask.status !== TodoTaskStatus.DROPPED;
        
        return (isAssigned && canChangeStatus) || hasManagePermission;
    };
    
    // Determine if current user can drop the selected task
    const canDropSelectedTask = () => {
        if (!selectedTask) return false;
        
        // Check if user is the creator of this task
        const isCreator = selectedTask.createdById === (profile as any)?.id;
        
        // Check if task is in a state that can be dropped
        const canDrop = selectedTask.status !== TodoTaskStatus.COMPLETED && 
                        selectedTask.status !== TodoTaskStatus.DROPPED;
        
        return (isCreator && canDrop) || hasManagePermission;
    };
    
    // Effect to fetch task types and users on initial load
    useEffect(() => {
        loadTaskTypes();
        loadUsers();
        
        // Add debug console output
        console.log('TodoTask component initialized. Will fetch task types and users.');
        console.log('Current permissions:', permissions);
        console.log('hasCreatePermission:', hasCreatePermission);
        console.log('hasViewAllPermission:', hasViewAllPermission);
        console.log('hasManagePermission:', hasManagePermission);
        
        // If user doesn't have all tasks permission, make sure they are not on that tab
        if (!hasViewAllPermission && activeTab === 'all-tasks') {
            console.log('User does not have permission to view all tasks, switching to my-tasks tab');
            setActiveTab('my-tasks');
        }
    }, []);
    
    // Effect to fetch tasks when tab changes or filters change
    useEffect(() => {
        fetchTasks();
    }, [activeTab, filterUserId, filterStatus, profile]);
    
    return (
        <div className="todo-task-container">
            <Card
                title={
                    <Space>
                        <OrderedListOutlined style={{ color: '#1890ff' }} />
                        <Title level={4} style={{ margin: 0 }}>
                            TodoTask
                        </Title>
                    </Space>
                }
                extra={
                    viewMode === 'list' ? (
                        <Space>
                            {hasCreatePermission && (
                                <Button 
                                    type="primary" 
                                    icon={<PlusOutlined />}
                                    onClick={() => setViewMode('create')}
                                >
                                    Create Task
                                </Button>
                            )}
                            {hasManagePermission && (
                                <Button
                                    icon={<SettingOutlined />}
                                    onClick={() => navigate('/todotask/task-types')}
                                >
                                    Task Types
                                </Button>
                            )}
                        </Space>
                    ) : (
                        <Button 
                            onClick={() => setViewMode('list')}
                        >
                            Back to List
                        </Button>
                    )
                }
            >
                {viewMode === 'list' && (
                    <>
                        <Tabs 
                            activeKey={activeTab} 
                            onChange={setActiveTab}
                        >
                            <TabPane tab="My Tasks" key="my-tasks">
                                <Space style={{ marginBottom: 16 }}>
                                    <Select
                                        placeholder="Filter by status"
                                        style={{ width: 200 }}
                                        allowClear
                                        value={filterStatus}
                                        onChange={setFilterStatus}
                                    >
                                        <Option value={TodoTaskStatus.OPEN}>Open</Option>
                                        <Option value={TodoTaskStatus.ACKNOWLEDGED}>Acknowledged</Option>
                                        <Option value={TodoTaskStatus.PENDING}>Pending</Option>
                                        <Option value={TodoTaskStatus.COMPLETED}>Completed</Option>
                                        <Option value={TodoTaskStatus.DROPPED}>Dropped</Option>
                                    </Select>
                                </Space>
                                <TodoTaskTable 
                                    viewType="my"
                                    taskData={filterStatus ? taskData.filter(task => task.status === filterStatus) : taskData}
                                    isPending={isLoading}
                                    onViewTask={handleViewTask}
                                    onEditTask={handleEditTask}
                                    onStatusChange={handleStatusChange}
                                />
                            </TabPane>
                            
                            {hasCreatePermission && (
                                <TabPane tab="Created By Me" key="created-tasks">
                                    <Space style={{ marginBottom: 16 }}>
                                        <Select
                                            placeholder="Filter by status"
                                            style={{ width: 200 }}
                                            allowClear
                                            value={filterStatus}
                                            onChange={setFilterStatus}
                                        >
                                            <Option value={TodoTaskStatus.OPEN}>Open</Option>
                                            <Option value={TodoTaskStatus.ACKNOWLEDGED}>Acknowledged</Option>
                                            <Option value={TodoTaskStatus.PENDING}>Pending</Option>
                                            <Option value={TodoTaskStatus.COMPLETED}>Completed</Option>
                                            <Option value={TodoTaskStatus.DROPPED}>Dropped</Option>
                                        </Select>
                                    </Space>
                                    <TodoTaskTable 
                                        viewType="created"
                                        taskData={filterStatus ? taskData.filter(task => task.status === filterStatus) : taskData}
                                        isPending={isLoading}
                                        onViewTask={handleViewTask}
                                        onEditTask={handleEditTask}
                                        onStatusChange={handleStatusChange}
                                    />
                                </TabPane>
                            )}
                            
                            {shouldShowAllTasksTab && (
                                <TabPane tab="All Tasks" key="all-tasks">
                                    <Space style={{ marginBottom: 16 }}>
                                        <Select
                                            placeholder="Filter by status"
                                            style={{ width: 200 }}
                                            allowClear
                                            value={filterStatus}
                                            onChange={setFilterStatus}
                                        >
                                            <Option value={TodoTaskStatus.OPEN}>Open</Option>
                                            <Option value={TodoTaskStatus.ACKNOWLEDGED}>Acknowledged</Option>
                                            <Option value={TodoTaskStatus.PENDING}>Pending</Option>
                                            <Option value={TodoTaskStatus.COMPLETED}>Completed</Option>
                                            <Option value={TodoTaskStatus.DROPPED}>Dropped</Option>
                                        </Select>
                                        
                                        <Select
                                            placeholder="Filter by user"
                                            style={{ width: 250 }}
                                            allowClear
                                            value={filterUserId}
                                            onChange={setFilterUserId}
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            <Option value="">All Users</Option>
                                            {users.map((user: any) => (
                                                <Option key={user.id} value={user.id}>
                                                    {user.name || user.username || user.email}
                                                    {user.role && user.role.name && (
                                                        <span style={{ color: '#999', marginLeft: 4, fontSize: '12px' }}>
                                                            ({user.role.name})
                                                        </span>
                                                    )}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Space>
                                    <TodoTaskTable 
                                        viewType="all"
                                        taskData={filterStatus ? taskData.filter(task => task.status === filterStatus) : taskData}
                                        isPending={isLoading}
                                        onViewTask={handleViewTask}
                                        onEditTask={handleEditTask}
                                        onStatusChange={handleStatusChange}
                                    />
                                </TabPane>
                            )}
                        </Tabs>
                    </>
                )}
                
                {viewMode === 'create' && (
                    <TodoTaskForm 
                        taskTypes={taskTypes}
                        users={users}
                        isSubmitting={isLoading}
                        isTaskTypesLoading={isTaskTypesLoading}
                        isUsersLoading={isUsersLoading}
                        mode="create"
                        onSubmit={handleCreateTask}
                        onCancel={() => setViewMode('list')}
                    />
                )}
                
                {viewMode === 'edit' && selectedTask && (
                    <TodoTaskForm 
                        initialValues={selectedTask}
                        taskTypes={taskTypes}
                        users={users}
                        isSubmitting={isLoading}
                        isTaskTypesLoading={isTaskTypesLoading}
                        isUsersLoading={isUsersLoading}
                        mode="edit"
                        onSubmit={handleUpdateTask}
                        onCancel={() => setViewMode('list')}
                    />
                )}
                
                {viewMode === 'view' && selectedTask && (
                    <TodoTaskDetails 
                        task={selectedTask}
                        loading={isLoading}
                        canEdit={canEditSelectedTask()}
                        canChangeStatus={canChangeSelectedTaskStatus()}
                        canDrop={canDropSelectedTask()}
                        onBack={() => setViewMode('list')}
                        onEdit={() => setViewMode('edit')}
                        onStatusChange={handleTaskStatusChange}
                    />
                )}
            </Card>
        </div>
    );
};

export default TodoTaskPage;