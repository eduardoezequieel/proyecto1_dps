import Swal from 'sweetalert2';

export function swalError(title: string, text: string) {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
  });
}
