/** Esquemas Zod para validación de formularios (login, proyecto, tarea, filtros). */
import { z } from 'zod';
import { LIMITS } from '@/lib/validations';

/** Esquema de login: email y contraseña */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo electrónico.')
    .max(LIMITS.email, `El correo no puede superar ${LIMITS.email} caracteres.`)
    .email('El correo electrónico no tiene un formato válido.'),
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña.')
    .min(LIMITS.passwordMin, `La contraseña debe tener al menos ${LIMITS.passwordMin} caracteres.`)
    .max(LIMITS.passwordMax, `La contraseña no puede superar ${LIMITS.passwordMax} caracteres.`),
});

export type LoginInput = z.infer<typeof loginSchema>;

const projectStatusEnum = z.enum(['planificacion', 'en_progreso', 'completado', 'cancelado']);
const priorityEnum = z.enum(['baja', 'media', 'alta']);

/** Esquema del formulario de proyecto (crear/editar) */
export const projectFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'El nombre del proyecto no puede estar vacío.')
      .max(LIMITS.projectName, `El nombre no puede superar ${LIMITS.projectName} caracteres.`),
    description: z
      .string()
      .trim()
      .max(LIMITS.description, `La descripción no puede superar ${LIMITS.description} caracteres.`),
    status: projectStatusEnum,
    priority: priorityEnum,
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine(
    (data) => {
      const start = data.startDate?.trim();
      const end = data.endDate?.trim();
      if (!start || !end) return true;
      return start <= end;
    },
    { message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio.', path: ['endDate'] }
  );

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

const taskStatusEnum = z.enum(['pendiente', 'en_progreso', 'completada', 'cancelada']);

/** Esquema del formulario de tarea (crear/editar) */
export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título de la tarea no puede estar vacío.')
    .max(LIMITS.title, `El título no puede superar ${LIMITS.title} caracteres.`),
  description: z
    .string()
    .trim()
    .max(LIMITS.description, `La descripción no puede superar ${LIMITS.description} caracteres.`),
  status: taskStatusEnum,
  priority: priorityEnum,
  projectId: z.string().min(1, 'Debes seleccionar un proyecto.'),
  assignedTo: z.string().min(1, 'Debes asignar la tarea a un usuario.'),
  dueDate: z.string().min(1, 'La fecha límite es obligatoria.'),
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;

/** Esquema de filtros de tareas (rango de fechas) */
export const taskFiltersSchema = z
  .object({
    dueDateFrom: z.string(),
    dueDateTo: z.string(),
  })
  .refine(
    (data) => {
      const from = data.dueDateFrom?.trim();
      const to = data.dueDateTo?.trim();
      if (!from || !to) return true;
      return from <= to;
    },
    { message: '"Vence desde" debe ser anterior o igual a "Vence hasta".', path: ['dueDateTo'] }
  );

export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;
