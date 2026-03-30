/** Mapas compartidos de colores y labels para status y prioridad. */
import type { ProjectStatus, TaskStatus, Priority } from '@/types';

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planificacion: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  en_progreso: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  completado: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En Progreso',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pendiente: 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
  en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completada: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelada: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  baja: 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-200',
  media: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

/** Mapa combinado de status (proyecto + tarea) para el dashboard. */
export const STATUS_COLORS: Record<string, string> = {
  ...PROJECT_STATUS_COLORS,
  ...TASK_STATUS_COLORS,
};

export const STATUS_LABELS: Record<string, string> = {
  ...PROJECT_STATUS_LABELS,
  ...TASK_STATUS_LABELS,
};
