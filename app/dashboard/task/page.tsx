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
