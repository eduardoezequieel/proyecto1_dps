'use client';

/** Página de proyectos (gerente): listado, crear, editar y eliminar con modal. */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import { Project, ProjectStatus, Priority } from '@/types';
import Swal from 'sweetalert2';
import { projectFormSchema, type ProjectFormInput } from '@/lib/schemas';
import { getSwalTheme, swalSuccess, swalError } from '@/lib/swal';
import { LIMITS } from '@/lib/validations';

const statusColors: Record<ProjectStatus, string> = {
  planificacion: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  en_progreso: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  completado: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const statusLabel: Record<ProjectStatus, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En Progreso',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

const priorityColors: Record<Priority, string> = {
  baja: 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-200',
  media: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const defaultForm: ProjectFormInput = {
  name: '',
  description: '',
  status: 'planificacion',
  priority: 'media',
  startDate: '',
  endDate: '',
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, isLoading, addProject, editProject, removeProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [modalEnter, setModalEnter] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultForm,
  });

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

  const openCreate = () => {
    setEditingProject(null);
    reset(defaultForm);
    setShowModal(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: ProjectFormInput) => {
    try {
      const payload = {
        name: data.name.trim(),
        description: (data.description ?? '').trim(),
        status: data.status,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
      };
      if (editingProject) {
        await editProject(editingProject.id, payload);
      } else {
        await addProject({ ...payload, managerId: user!.id });
      }
      closeModal();
      await new Promise((r) => setTimeout(r, 250));
      if (editingProject) {
        await swalSuccess(
          'Proyecto actualizado',
          'Los cambios se guardaron correctamente.'
        );
      } else {
        await swalSuccess(
          'Proyecto creado',
          'El proyecto se ha creado correctamente.'
        );
      }
    } catch {
      await swalError(
        'Error',
        'No se pudo guardar el proyecto. Intenta de nuevo.'
      );
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar proyecto?',
      text: 'Esta acción también eliminará todas las tareas relacionadas.',
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
      await removeProject(id);
      await swalSuccess(
        'Proyecto eliminado',
        'El proyecto y sus tareas relacionadas se eliminaron correctamente.'
      );
    } catch {
      await swalError(
        'No se pudo eliminar',
        'Ocurrió un error al eliminar el proyecto.'
      );
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proyectos</h1>
            <p className="text-gray-500 dark:text-gray-400">{projects.length} proyectos en total</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Nuevo Proyecto
          </button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg leading-tight">{project.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[project.priority]}`}>
                    {project.priority}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm flex-1">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status]}`}>
                    {statusLabel[project.status]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{project.endDate}</span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => openEdit(project)}
                    className="flex-1 text-sm py-1.5 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 text-sm py-1.5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Modal crear/editar proyecto */}
      {showModal && (
        <div
          role="dialog"
          aria-modal
          aria-label={editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${modalClosing ? 'opacity-0' : modalEnter ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeModal}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transition-all duration-200 ease-out ${modalClosing ? 'opacity-0 scale-95' : modalEnter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                  <input
                    {...register('name')}
                    maxLength={LIMITS.projectName}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    maxLength={LIMITS.description}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="planificacion">Planificación</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inicio</label>
                    <input
                      type="date"
                      {...register('startDate')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fin</label>
                    <input
                      type="date"
                      {...register('endDate')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
