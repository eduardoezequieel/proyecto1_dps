'use client';

/** Página de tareas (gerente): listado con filtros, crear, editar y eliminar. */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { getProjects, getUsers } from '@/services/api';
import { Task, TaskStatus, Priority, Project, User } from '@/types';
import Swal from 'sweetalert2';
import { taskFormSchema, taskFiltersSchema, type TaskFormInput } from '@/lib/schemas';
import { getSwalTheme, swalSuccess, swalError } from '@/lib/swal';
import { LIMITS } from '@/lib/validations';

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

const defaultForm: TaskFormInput = {
  title: '',
  description: '',
  status: 'pendiente',
  priority: 'media',
  projectId: '',
  assignedTo: '',
  dueDate: '',
};

interface TaskFilters {
  search: string;
  projectId: string;
  status: string;
  priority: string;
  assignedTo: string;
  dueDateFrom: string;
  dueDateTo: string;
}

const defaultFilters: TaskFilters = {
  search: '',
  projectId: '',
  status: '',
  priority: '',
  assignedTo: '',
  dueDateFrom: '',
  dueDateTo: '',
};

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, isLoading, addTask, editTask, removeTask } = useTasks();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [modalEnter, setModalEnter] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultForm,
  });

  useEffect(() => {
    Promise.all([getProjects(), getUsers()]).then(([pRes, uRes]) => {
      setProjects(pRes.data);
      setUsers(uRes.data.filter((u) => u.role === 'usuario'));
    });
  }, []);

  useEffect(() => {
    if (showModal) {
      setModalEnter(false);
      const t = requestAnimationFrame(() => requestAnimationFrame(() => setModalEnter(true)));
      return () => cancelAnimationFrame(t);
    } else {
      setModalEnter(false);
    }
  }, [showModal]);

  const closeModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setModalClosing(false);
    }, 200);
  };

  const getProjectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name ?? id;

  const filteredTasks = tasks.filter((task) => {
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
  });

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');
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
    reset(defaultForm);
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: TaskFormInput) => {
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
      closeModal();
      await new Promise((r) => setTimeout(r, 250));
      if (editingTask) {
        await swalSuccess(
          'Tarea actualizada',
          'Los cambios se guardaron correctamente.'
        );
      } else {
        await swalSuccess(
          'Tarea creada',
          'La tarea se ha creado correctamente.'
        );
      }
    } catch {
      await swalError(
        'Error',
        'No se pudo guardar la tarea. Intenta de nuevo.'
      );
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar esta tarea?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      ...getSwalTheme(),
    });

    if (!result.isConfirmed) return;

    try {
      await removeTask(id);
      await swalSuccess(
        'Tarea eliminada',
        'La tarea se eliminó correctamente.'
      );
    } catch {
      await swalError(
        'No se pudo eliminar',
        'Ocurrió un error al eliminar la tarea.'
      );
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

        {/* Drawer de filtros */}
        <>
          <div
            role="presentation"
            aria-hidden={!showFilters}
            onClick={() => setShowFilters(false)}
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          />
          <div
            aria-modal
            aria-label="Filtros de tareas"
            className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl flex flex-col transition-transform duration-300 ease-out ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar (título/descripción)</label>
                <input
                  type="text"
                  maxLength={LIMITS.search}
                  placeholder="Texto..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proyecto</label>
                <select
                  value={filters.projectId}
                  onChange={(e) => setFilters((f) => ({ ...f, projectId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {(Object.entries(statusLabel) as [TaskStatus, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignado a</label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => setFilters((f) => ({ ...f, assignedTo: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vence desde</label>
                <input
                  type="date"
                  value={filters.dueDateFrom}
                  onChange={(e) => setFilters((f) => ({ ...f, dueDateFrom: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vence hasta</label>
                <input
                  type="date"
                  value={filters.dueDateTo}
                  onChange={(e) => setFilters((f) => ({ ...f, dueDateTo: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {filterDateError && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400" role="alert">{filterDateError}</p>
                )}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-600 flex gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className={`px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${hasActiveFilters ? 'flex-1' : 'w-full'}`}
              >
                Ver resultados
              </button>
            </div>
          </div>
        </>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
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

      {showModal && (
        <div
          role="dialog"
          aria-modal
          aria-label={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${modalClosing ? 'opacity-0' : modalEnter ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeModal}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-all duration-200 ease-out ${modalClosing ? 'opacity-0 scale-95' : modalEnter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                  <input
                    {...register('title')}
                    maxLength={LIMITS.title}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea
                    {...register('description')}
                    rows={2}
                    maxLength={LIMITS.description}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proyecto</label>
                    <select
                      {...register('projectId')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    {errors.projectId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.projectId.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignar a</label>
                    <select
                      {...register('assignedTo')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    {errors.assignedTo && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assignedTo.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                    <select
                      {...register('priority')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha límite</label>
                  <input
                    type="date"
                    {...register('dueDate')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueDate.message}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
