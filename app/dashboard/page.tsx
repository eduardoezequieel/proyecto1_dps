'use client';

/** Página principal del dashboard: resumen de proyectos y tareas según el rol. */
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProjects, getTasks, getTasksByUser } from '@/services/api';
import { Project, Task } from '@/types';
import Link from 'next/link';
import { STATUS_COLORS as statusColors, STATUS_LABELS as statusLabel } from '@/lib/constants';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-6 text-white ${color} shadow`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-90 mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'gerente') {
          const [pRes, tRes] = await Promise.all([getProjects(), getTasks()]);
          setProjects(pRes.data);
          setTasks(tRes.data);
        } else if (user?.id) {
          const tRes = await getTasksByUser(user.id);
          setTasks(tRes.data || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const pendingTasks = tasks.filter((t) => t.status === 'pendiente').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'en_progreso').length;
  const completedTasks = tasks.filter((t) => t.status === 'completada').length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bienvenido, {user?.name} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {user?.role === 'gerente'
            ? 'Vista general del sistema de gestión'
            : 'Aquí están tus tareas asignadas'}
        </p>
      </div>

      {/* Estadísticas */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user?.role === 'gerente' && (
            <StatCard label="Total Proyectos" value={projects.length} color="bg-purple-500" />
          )}
          <StatCard label="Total Tareas" value={tasks.length} color="bg-blue-500" />
          <StatCard label="Pendientes" value={pendingTasks} color="bg-yellow-500" />
          <StatCard label="En Progreso" value={inProgressTasks} color="bg-orange-500" />
          <StatCard label="Completadas" value={completedTasks} color="bg-green-500" />
        </div>
      )}

      {/* Proyectos recientes (solo gerente) */}
      {user?.role === 'gerente' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Proyectos Recientes</h2>
            <Link href="/dashboard/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Ver todos →
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{project.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{project.description.slice(0, 60)}...</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status]}`}>
                    {statusLabel[project.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tareas recientes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {user?.role === 'gerente' ? 'Tareas Recientes' : 'Mis Tareas'}
          </h2>
          <Link
            href={user?.role === 'gerente' ? '/dashboard/tasks' : '/dashboard/my-tasks'}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay tareas asignadas</p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{task.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vence: {task.dueDate}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                  {statusLabel[task.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
