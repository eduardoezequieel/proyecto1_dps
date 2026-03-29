/** Hook para listar, crear, editar y eliminar tareas; si se pasa userId, filtra por asignado. */
import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { getTasks, createTask, updateTask, deleteTask } from '@/services/api';

export function useTasks(userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await getTasks();
      const data = res.data || [];
      // Si hay userId, filtrar por asignado (evita fallos de filtro por tipo en json-server)
      setTasks(userId ? data.filter((t) => String(t.assignedTo) === String(userId)) : data);
    } catch {
      setError('Error al cargar tareas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [userId]);

  /** Crea una tarea y la añade a la lista. */
  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const res = await createTask(task);
    setTasks((prev) => [...prev, res.data]);
    return res.data;
  };

  /** Actualiza una tarea por id. */
  const editTask = async (id: string, data: Partial<Task>) => {
    const res = await updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  };

  /** Elimina una tarea por id. */
  const removeTask = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, isLoading, error, refetch: fetchTasks, addTask, editTask, removeTask };
}
