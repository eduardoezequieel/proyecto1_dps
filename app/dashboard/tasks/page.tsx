'use client';

/** Página de tareas (gerente): listado con filtros, crear, editar y eliminar. */
import { useState, useEffect, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useModal } from '@/hooks/useModal';
import { useAuth } from '@/context/AuthContext';
import { getProjects, getUsers } from '@/services/api';
import { Task, Project, User } from '@/types';
import { taskFiltersSchema, type TaskFormInput } from '@/lib/schemas';
import { swalSuccess, swalError, swalConfirmDelete } from '@/lib/swal';
import { TASK_STATUS_COLORS as statusColors, TASK_STATUS_LABELS as statusLabel } from '@/lib/constants';
import TaskFilterDrawer, { type TaskFilters, defaultFilters } from '@/components/tasks/TaskFilterDrawer';
import TaskModal from '@/components/tasks/TaskModal';

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, isLoading, error, refetch, addTask, editTask, removeTask } = useTasks();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const modal = useModal();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([getProjects(), getUsers()]).then(([pRes, uRes]) => {
      setProjects(pRes.data);
      setUsers(uRes.data.filter((u) => u.role === 'usuario'));
    });
  }, []);


  const getProjectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name ?? id;

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const titleMatch = !filters.search.trim() ||
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()));
    const projectMatch = !filters.projectId || task.projectId === filters.projectId;
    const statusMatch = !filters.status || task.status === filters.status;
    const priorityMatch = !filters.priority || task.priority === filters.priority;
    const assignedMatch = !filters.assignedTo || task.assignedTo === filters.assignedTo;
    const dueFromMatch = !filters.dueDateFrom || (task.dueDate && task.dueDate >= filters.dueDateFrom);
    const dueToMatch = !filters.dueDateTo || (task.dueDate && task.dueDate <= filters.dueDateTo);
    return titleMatch && projectMatch && statusMatch && priorityMatch && assignedMatch && dueFromMatch && dueToMatch;
  }), [tasks, filters]);

  const hasActiveFilters = useMemo(() => Object.values(filters).some((v) => v !== ''), [filters]);
  const clearFilters = () => setFilters(defaultFilters);

  const filterDateResult = taskFiltersSchema.safeParse({
    dueDateFrom: filters.dueDateFrom,
    dueDateTo: filters.dueDateTo,
  });
  const filterDateError = !filterDateResult.success
    ? filterDateResult.error.issues[0]?.message ?? null
    : null;

  const openCreate = () => {
    setEditingTask(null);
    modal.open();
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    modal.open();
  };

  const handleModalSubmit = async (data: TaskFormInput) => {
    try {
      const payload = {
        title: data.title.trim(),
        description: (data.description ?? '').trim(),
        status: data.status,
        priority: data.priority,
        projectId: data.projectId,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate,
      };
      if (editingTask) {
        await editTask(editingTask.id, payload);
      } else {
        await addTask({ ...payload, createdBy: user!.id });
      }
      modal.close();
      await new Promise((r) => setTimeout(r, 250));
      await swalSuccess(
        editingTask ? 'Tarea actualizada' : 'Tarea creada',
        editingTask ? 'Los cambios se guardaron correctamente.' : 'La tarea se ha creado correctamente.'
      );
    } catch {
      await swalError('Error', 'No se pudo guardar la tarea. Intenta de nuevo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!await swalConfirmDelete('¿Eliminar esta tarea?', 'Esta acción no se puede deshacer.')) return;
    try {
      await removeTask(id);
      await swalSuccess('Tarea eliminada', 'La tarea se eliminó correctamente.');
    } catch {
      await swalError('No se pudo eliminar', 'Ocurrió un error al eliminar la tarea.');
    }
  };

  return (
    <div className="space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">Tareas</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'}
              {hasActiveFilters ? ' (filtradas)' : ` de ${tasks.length} en total`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${showFilters ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-500' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
            >
              Filtros {hasActiveFilters ? `(${Object.values(filters).filter(Boolean).length})` : ''}
            </button>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full sm:w-auto"
            >
              + Nueva Tarea
            </button>
          </div>
        </div>

        <TaskFilterDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={setFilters}
          projects={projects}
          users={users}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          dateError={filterDateError}
        />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-700 dark:text-red-400 mb-3">{error}</p>
            <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Reintentar</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto min-w-0">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase min-w-[140px]">Tarea</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell min-w-[120px]">Proyecto</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell min-w-[100px]">Asignado a</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Estado</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell whitespace-nowrap">Vence</th>
                  <th className="px-4 sm:px-6 py-3 whitespace-nowrap" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {hasActiveFilters ? 'Ninguna tarea coincide con los filtros. Prueba a cambiar o limpiar los filtros.' : 'No hay tareas.'}
                    </td>
                  </tr>
                ) : filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-[160px] sm:max-w-none" title={task.title}>{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{task.priority}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell text-sm text-gray-600 dark:text-gray-300 min-w-0">
                      <span className="block truncate max-w-[140px]" title={getProjectName(task.projectId)}>{getProjectName(task.projectId)}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell text-sm text-gray-600 dark:text-gray-300 min-w-0">
                      <span className="block truncate max-w-[100px]" title={getUserName(task.assignedTo)}>{getUserName(task.assignedTo)}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                        {statusLabel[task.status]}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{task.dueDate}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 justify-end shrink-0">
                        <button
                          onClick={() => openEdit(task)}
                          className="text-xs px-3 py-1.5 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 shrink-0"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-xs px-3 py-1.5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <TaskModal
        isOpen={modal.isOpen}
        isEntering={modal.isEntering}
        isClosing={modal.isClosing}
        onClose={modal.close}
        editingTask={editingTask}
        projects={projects}
        users={users}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
