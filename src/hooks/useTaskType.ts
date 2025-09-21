import { useState, useEffect } from "react";
import { message } from "antd";
import {
  fetchTaskTypes,
  fetchTaskTypeById,
  createTaskType,
  updateTaskType,
  deleteTaskType,
} from "@/service/taskType.service";

// Hook to fetch all task types
export const useTaskTypes = () => {
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTaskTypes();
      setTaskTypes(data);
    } catch (err) {
      setError(err as any);
      message.error("Failed to fetch task types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { taskTypes, loading, error, refetch: fetchData };
};

// Hook to fetch task type by ID
export const useTaskTypeById = (id: string) => {
  const [taskType, setTaskType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTaskTypeById(id);
      setTaskType(data);
    } catch (err) {
      setError(err as any);
      message.error("Failed to fetch task type details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { taskType, loading, error, refetch: fetchData };
};

// Hook to create a task type
export const useCreateTaskType = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const create = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createTaskType(payload);
      message.success("Task type created successfully");
      return data;
    } catch (err) {
      setError(err as any);
      message.error("Failed to create task type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

// Hook to update a task type
export const useUpdateTaskType = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const update = async (id: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateTaskType({ id, payload });
      message.success("Task type updated successfully");
      return data;
    } catch (err) {
      setError(err as any);
      message.error("Failed to update task type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

// Hook to delete a task type
export const useDeleteTaskType = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const remove = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTaskType(id);
      message.success("Task type deleted successfully");
      return true;
    } catch (err) {
      setError(err as any);
      message.error("Failed to delete task type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
};