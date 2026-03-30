'use client';

/** Página de proyectos (gerente): listado, crear, editar y eliminar con modal. */
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useModal } from '@/hooks/useModal';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types';
import { type ProjectFormInput } from '@/lib/schemas';
import { swalSuccess, swalError, swalConfirmDelete } from '@/lib/swal';
import { PROJECT_STATUS_COLORS as statusColors, PROJECT_STATUS_LABELS as statusLabel, PRIORITY_COLORS as priorityColors } from '@/lib/constants';
import ProjectModal from '@/components/projects/ProjectModal';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, isLoading, error, refetch, addProject, editProject, removeProject } = useProjects();
  const modal = useModal();
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const openCreate = () => {
    setEditingProject(null);
    modal.open();
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    modal.open();
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
      modal.close();
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
    if (!await swalConfirmDelete('¿Eliminar proyecto?', 'Esta acción también eliminará todas las tareas relacionadas.')) return;
    try {
      await removeProject(id);
      await swalSuccess('Proyecto eliminado', 'El proyecto y sus tareas relacionadas se eliminaron correctamente.');
    } catch {
      await swalError('No se pudo eliminar', 'Ocurrió un error al eliminar el proyecto.');
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
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-700 dark:text-red-400 mb-3">{error}</p>
            <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Reintentar</button>
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

      <ProjectModal
        isOpen={modal.isOpen}
        isEntering={modal.isEntering}
        isClosing={modal.isClosing}
        onClose={modal.close}
        editingProject={editingProject}
        onSubmit={onSubmit}
      />
    </div>
  );
}
