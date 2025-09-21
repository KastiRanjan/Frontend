import { useState, useEffect } from "react";
import { message } from "antd";
import {
  fetchTodoTasks,
  fetchTodoTaskById,
  fetchTodoTasksByStatus,
  fetchTodoTasksByAssignedUser,
  fetchTodoTasksByCreatedUser,
  createTodoTask,
  updateTodoTask,
  deleteTodoTask,
  acknowledgeTodoTask,
  markTodoTaskAsPending,
  completeTodoTask,
  dropTodoTask,
} from "@/service/todoTask.service";
import { TodoTaskStatus } from "@/types/todoTask";

// Hook to fetch all todo tasks
export const useTodoTasks = () => {
  const [todoTasks, setTodoTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodoTasks();
      setTodoTasks(data);
    } catch (err) {
      setError(err);
      message.error("Failed to fetch todo tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { todoTasks, loading, error, refetch: fetchData };
};

// Hook to fetch todo task by ID
export const useTodoTaskById = (id: string) => {
  const [todoTask, setTodoTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodoTaskById(id);
      setTodoTask(data);
    } catch (err) {
      setError(err);
      message.error("Failed to fetch todo task details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { todoTask, loading, error, refetch: fetchData };
};

// Hook to fetch todo tasks by status
export const useTodoTasksByStatus = (status: TodoTaskStatus) => {
  const [todoTasks, setTodoTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!status) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodoTasksByStatus(status);
      setTodoTasks(data);
    } catch (err) {
      setError(err);
      message.error(`Failed to fetch ${status} todo tasks`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  return { todoTasks, loading, error, refetch: fetchData };
};

// Hook to fetch todo tasks by assigned user
export const useTodoTasksByAssignedUser = (userId: string) => {
  const [todoTasks, setTodoTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodoTasksByAssignedUser(userId);
      setTodoTasks(data);
    } catch (err) {
      setError(err);
      message.error("Failed to fetch assigned todo tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  return { todoTasks, loading, error, refetch: fetchData };
};

// Hook to fetch todo tasks by created user
export const useTodoTasksByCreatedUser = (userId: string) => {
  const [todoTasks, setTodoTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodoTasksByCreatedUser(userId);
      setTodoTasks(data);
    } catch (err) {
      setError(err);
      message.error("Failed to fetch created todo tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  return { todoTasks, loading, error, refetch: fetchData };
};

// Hook to create a todo task
export const useCreateTodoTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createTodoTask(payload);
      message.success("Todo task created successfully");
      return data;
    } catch (err) {
      setError(err);
      message.error("Failed to create todo task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

// Hook to update a todo task
export const useUpdateTodoTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (id: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateTodoTask({ id, payload });
      message.success("Todo task updated successfully");
      return data;
    } catch (err) {
      setError(err);
      message.error("Failed to update todo task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

// Hook to delete a todo task
export const useDeleteTodoTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTodoTask(id);
      message.success("Todo task deleted successfully");
      return true;
    } catch (err) {
      setError(err);
      message.error("Failed to delete todo task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
};

// Hook to acknowledge a todo task
export const useAcknowledgeTodoTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const acknowledge = async (id: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      // Convert remark to acknowledgeRemark if it exists
      if (payload.remark !== undefined && payload.acknowledgeRemark === undefined) {
        payload = { ...payload, acknowledgeRemark: payload.remark };
        delete payload.remark;
      }
      const data = await acknowledgeTodoTask({ id, payload });
      message.success("Todo task acknowledged successfully");
      return data;
    } catch (err) {
      setError(err);
      message.error("Failed to acknowledge todo task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { acknowledge, loading, error };
};

// Hook to mark a todo task as pending
export const useMarkTodoTaskAsPending = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const markAsPending = async (id: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      // Convert remark to pendingRemark if it exists
      if (payload.remark !== undefined && payload.pendingRemark === undefined) {
        payload = { ...payload, pendingRemark: payload.remark };
        delete payload.remark;
      }
      const data = await markTodoTaskAsPending({ id, payload });
      message.success("Todo task marked as pending successfully");
      return data;
    } catch (err) {
      setError(err);
      message.error("Failed to mark todo task as pending");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { markAsPending, loading, error };
};

// Hook to complete a todo task
export const useCompleteTodoTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const complete = async (id: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      // Convert remark to completionRemark if it exists
      if (payload.remark !== undefined && payload.completionRemark === undefined) {
        payload = { ...payload, completionRemark: payload.remark };
        delete payload.remark;
      }
      const data = await completeTodoTask({ id, payload });
      message.success("Todo task completed successfully");
      return data;
    } catch (err) {
      setError(err);
      message.error("Failed to complete todo task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { complete, loading, error };
};

// Hook to drop a todo task
export const useDropTodoTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const drop = async (id: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      // Convert remark to droppedRemark if it exists
      if (payload.remark !== undefined && payload.droppedRemark === undefined) {
        payload = { ...payload, droppedRemark: payload.remark };
        delete payload.remark;
      }
      const data = await dropTodoTask({ id, payload });
      message.success("Todo task dropped successfully");
      return data;
    } catch (err) {
      setError(err);
      message.error("Failed to drop todo task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { drop, loading, error };
};