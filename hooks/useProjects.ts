/** Hook para listar, crear, editar y eliminar proyectos (y sus tareas al eliminar). */
import { useState, useEffect } from 'react';
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

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await getProjects();
      setProjects(res.data);
    } catch {
      setError('Error al cargar proyectos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  /** Crea un proyecto y lo añade a la lista. */
  const addProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    const res = await createProject(project);
    setProjects((prev) => [...prev, res.data]);
    return res.data;
  };

  /** Actualiza un proyecto por id. */
  const editProject = async (id: string, data: Partial<Project>) => {
    const res = await updateProject(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    return res.data;
  };

  /** Elimina el proyecto y todas sus tareas. */
  const removeProject = async (id: string) => {
    const tasksResponse = await getTasksByProject(id);
    await Promise.all(tasksResponse.data.map((task) => deleteTask(task.id)));
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, isLoading, error, refetch: fetchProjects, addProject, editProject, removeProject };
}
