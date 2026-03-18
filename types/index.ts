/** Tipos e interfaces compartidos de la aplicación. */
export type Role = 'gerente' | 'usuario';

export type ProjectStatus = 'planificacion' | 'en_progreso' | 'completado' | 'cancelado';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
export type Priority = 'baja' | 'media' | 'alta';

/** Usuario del sistema (password opcional una vez autenticado). */
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar: string;
}

/** Proyecto con fechas y estado. */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  managerId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

/** Tarea asignada a un usuario y vinculada a un proyecto. */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  createdAt: string;
}

/** Tipo del contexto de autenticación. */
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}