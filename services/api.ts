/** Cliente HTTP para la API (json-server en localhost:3001). */
import axios from 'axios';
import { User, Project, Task } from '@/types';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// Usuarios
export const getUsers = () => api.get<User[]>('/users');
export const getUserById = (id: string) => api.get<User>(`/users/${id}`);
export const getUserByEmail = (email: string) =>
  api.get<User[]>(`/users?email=${encodeURIComponent(email)}`);

// Proyectos
export const getProjects = () => api.get<Project[]>('/projects');
export const getProjectById = (id: string) => api.get<Project>(`/projects/${id}`);
export const createProject = (project: Omit<Project, 'id' | 'createdAt'>) =>
  api.post<Project>('/projects', { ...project, createdAt: new Date().toISOString() });
export const updateProject = (id: string, project: Partial<Project>) =>
  api.patch<Project>(`/projects/${id}`, project);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`);

// Tareas
export const getTasks = () => api.get<Task[]>('/tasks');
export const getTaskById = (id: string) => api.get<Task>(`/tasks/${id}`);
export const getTasksByProject = (projectId: string) =>
  api.get<Task[]>(`/tasks?projectId=${projectId}`);
export const getTasksByUser = (userId: string) =>
  api.get<Task[]>(`/tasks?assignedTo=${userId}`);
export const createTask = (task: Omit<Task, 'id' | 'createdAt'>) =>
  api.post<Task>('/tasks', { ...task, createdAt: new Date().toISOString() });
export const updateTask = (id: string, task: Partial<Task>) =>
  api.patch<Task>(`/tasks/${id}`, task);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);

export default api;