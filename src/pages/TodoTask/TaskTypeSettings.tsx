import { useState, useEffect } from "react";
import { Card, Typography, message, Button, Space, Empty } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import TaskTypeList from "@/components/TaskType/TaskTypeList";
import { TaskType } from "@/types/todoTask";
import { useNavigate } from "react-router-dom";
import { permissionConfig } from "@/utils/permission-config";
import { hasPermission } from "@/utils/utils";
import { 
    fetchTaskTypes as fetchTaskTypesAPI, 
    createTaskType, 
    updateTaskType, 
    deleteTaskType as deleteTaskTypeAPI 
} from "@/service/taskType.service";

const { Title } = Typography;

const TaskTypeSettings = () => {
    const navigate = useNavigate();
    const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check permissions using the hasPermission utility
    const canCreateTaskTypes = hasPermission(permissionConfig.CREATE_TASK_TYPE);
    const canEditTaskTypes = hasPermission(permissionConfig.UPDATE_TASK_TYPE);
    const canDeleteTaskTypes = hasPermission(permissionConfig.DELETE_TASK_TYPE);

    // Fetch task types from API
    const fetchTaskTypes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchTaskTypesAPI();
            console.log("Task Types API Response:", response); // Debug log
            
            // The response should be the data array directly, not nested in a data property
            setTaskTypes(Array.isArray(response) ? response : []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load task types";
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTaskType = async (taskType: Partial<TaskType>) => {
        try {
            await createTaskType(taskType);
            message.success('Task type created successfully');
            fetchTaskTypes(); // Refetch after adding
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task type";
            message.error(errorMessage);
        }
    };

    const handleEditTaskType = async (id: string, taskType: Partial<TaskType>) => {
        try {
            await updateTaskType({ id, payload: taskType });
            message.success('Task type updated successfully');
            fetchTaskTypes(); // Refetch after editing
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update task type";
            message.error(errorMessage);
        }
    };

    const handleDeleteTaskType = async (id: string) => {
        try {
            await deleteTaskTypeAPI(id);
            message.success('Task type deleted successfully');
            fetchTaskTypes(); // Refetch after deleting
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete task type";
            message.error(errorMessage);
        }
    };

    useEffect(() => {
        fetchTaskTypes();
    }, []);

    return (
        <Card
            title={
                <Space>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/todotask')}
                    />
                    <Title level={4} style={{ margin: 0 }}>Task Type Settings</Title>
                </Space>
            }
            extra={
                <Button 
                    onClick={() => fetchTaskTypes()} 
                    disabled={isLoading}
                >
                    Refresh
                </Button>
            }
        >
            {error && !isLoading ? (
                <Empty 
                    description={
                        <span>
                            Error: {error}
                            <br />
                            <Button type="link" onClick={fetchTaskTypes}>
                                Try again
                            </Button>
                        </span>
                    }
                />
            ) : (
                <TaskTypeList 
                    taskTypes={taskTypes}
                    loading={isLoading}
                    onAdd={canCreateTaskTypes ? handleAddTaskType : undefined}
                    onEdit={canEditTaskTypes ? handleEditTaskType : undefined}
                    onDelete={canDeleteTaskTypes ? handleDeleteTaskType : undefined}
                />
            )}
        </Card>
    );
};

export default TaskTypeSettings;