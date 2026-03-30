/** Drawer lateral con filtros avanzados para la lista de tareas. */
import { TaskStatus, Project, User } from '@/types';
import { TASK_STATUS_LABELS as statusLabel } from '@/lib/constants';
import { LIMITS } from '@/lib/validations';

export interface TaskFilters {
  search: string;
  projectId: string;
  status: string;
  priority: string;
  assignedTo: string;
  dueDateFrom: string;
  dueDateTo: string;
}

export const defaultFilters: TaskFilters = {
  search: '',
  projectId: '',
  status: '',
  priority: '',
  assignedTo: '',
  dueDateFrom: '',
  dueDateTo: '',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: TaskFilters;
  onFiltersChange: (fn: (prev: TaskFilters) => TaskFilters) => void;
  projects: Project[];
  users: User[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  dateError: string | null;
}

export default function TaskFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  projects,
  users,
  hasActiveFilters,
  onClearFilters,
  dateError,
}: Props) {
  return (
    <>
      <div
        role="presentation"
        aria-hidden={!isOpen}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        aria-modal
        aria-label="Filtros de tareas"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
          <button
            type="button"
            onClick={onClose}
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
              onChange={(e) => onFiltersChange((f) => ({ ...f, search: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proyecto</label>
            <select
              value={filters.projectId}
              onChange={(e) => onFiltersChange((f) => ({ ...f, projectId: e.target.value }))}
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
              onChange={(e) => onFiltersChange((f) => ({ ...f, status: e.target.value }))}
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
              onChange={(e) => onFiltersChange((f) => ({ ...f, priority: e.target.value }))}
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
              onChange={(e) => onFiltersChange((f) => ({ ...f, assignedTo: e.target.value }))}
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
              onChange={(e) => onFiltersChange((f) => ({ ...f, dueDateFrom: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vence hasta</label>
            <input
              type="date"
              value={filters.dueDateTo}
              onChange={(e) => onFiltersChange((f) => ({ ...f, dueDateTo: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dateError && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400" role="alert">{dateError}</p>
            )}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-600 flex gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${hasActiveFilters ? 'flex-1' : 'w-full'}`}
          >
            Ver resultados
          </button>
        </div>
      </div>
    </>
  );
}
