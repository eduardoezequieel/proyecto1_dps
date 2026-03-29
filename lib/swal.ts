/** Helpers de SweetAlert2 con estilo según tema claro/oscuro. */
import Swal from 'sweetalert2';

/** Detecta tema oscuro y devuelve opciones de estilo para SweetAlert2. */
export function getSwalTheme() {
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    color: isDarkMode ? '#f3f4f6' : '#1f2937',
    customClass: {
      popup: isDarkMode ? 'border border-gray-700' : '',
    },
  };
}

/** Muestra un modal de éxito (se cierra solo si hay text). */
export function swalSuccess(title: string, text?: string) {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer: text ? 1800 : undefined,
    showConfirmButton: !text,
    ...getSwalTheme(),
  });
}

/** Muestra un modal de error. */
export function swalError(title: string, text?: string) {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Entendido',
    ...getSwalTheme(),
  });
}

/** Muestra un modal de advertencia. */
export function swalWarning(title: string, text?: string) {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    ...getSwalTheme(),
  });
}
