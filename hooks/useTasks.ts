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
