/** Hook para listar, crear, editar y eliminar proyectos (y sus tareas al eliminar). */
import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getTasksByProject,
  deleteTask,
} from '@/services/api';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getProjects();
      setProjects(res.data);
    } catch {
      setError('Error al cargar proyectos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt'>) => {
    const res = await createProject(project);
    setProjects((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const editProject = useCallback(async (id: string, data: Partial<Project>) => {
    const res = await updateProject(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    return res.data;
  }, []);

  const removeProject = useCallback(async (id: string) => {
    const tasksResponse = await getTasksByProject(id);
    await Promise.all(tasksResponse.data.map((task) => deleteTask(task.id)));
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { projects, isLoading, error, refetch: fetchProjects, addProject, editProject, removeProject };
}
