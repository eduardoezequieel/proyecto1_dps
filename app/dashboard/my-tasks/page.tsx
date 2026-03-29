'use client';

/** Página mis tareas (usuario): tareas asignadas agrupadas por estado, con cambio de estado. */
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus } from '@/types';

const statusColors: Record<TaskStatus, string> = {
  pendiente: 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
  en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completada: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelada: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const statusLabel: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

const priorityBadge: Record<string, string> = {
  baja: 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-200',
  media: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export default function MyTasksPage() {
  const { user } = useAuth();
  const { tasks, isLoading, editTask } = useTasks(user?.id);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    setUpdatingId(task.id);
    await editTask(task.id, { status: newStatus });
    setUpdatingId(null);
  };

  const grouped = {
    pendiente: tasks.filter((t) => t.status === 'pendiente'),
    en_progreso: tasks.filter((t) => t.status === 'en_progreso'),
    completada: tasks.filter((t) => t.status === 'completada'),
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Tareas</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona y actualiza el estado de tus tareas</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
            <p className="text-gray-400 dark:text-gray-500 text-lg">No tienes tareas asignadas</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {(['pendiente', 'en_progreso', 'completada'] as TaskStatus[]).map((status) => (
              <div key={status} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">{statusLabel[status]}</h3>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {grouped[status as keyof typeof grouped].length}
                  </span>
                </div>
                <div className="space-y-3">
                  {grouped[status as keyof typeof grouped].map((task) => (
                    <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm leading-tight">{task.title}</h4>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ml-2 flex-shrink-0 ${priorityBadge[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Vence: {task.dueDate}</p>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                        disabled={updatingId === task.id}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="completada">Completada</option>
                      </select>
                    </div>
                  ))}
                  {grouped[status as keyof typeof grouped].length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">Sin tareas</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
