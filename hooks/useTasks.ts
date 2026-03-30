/** Hook para listar, crear, editar y eliminar tareas; si se pasa userId, filtra por asignado. */
import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { getTasks, getTasksByUser, createTask, updateTask, deleteTask } from '@/services/api';

export function useTasks(userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = userId ? await getTasksByUser(userId) : await getTasks();
      setTasks(res.data || []);
    } catch {
      setError('Error al cargar tareas');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const res = await createTask(task);
    setTasks((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const editTask = useCallback(async (id: string, data: Partial<Task>) => {
    const res = await updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  }, []);

  const removeTask = useCallback(async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, isLoading, error, refetch: fetchTasks, addTask, editTask, removeTask };
}
