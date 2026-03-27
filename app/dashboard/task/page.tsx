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
