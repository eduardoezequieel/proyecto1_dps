/**
 * Constantes y utilidades de validación.
 * Las reglas de validación de formularios están en schemas.ts (Zod).
 */

/** Longitudes máximas para evitar payloads enormes y mantener consistencia */
export const LIMITS = {
  email: 255,
  passwordMin: 6,
  passwordMax: 128,
  name: 200,
  projectName: 200,
  description: 2000,
  title: 200,
  search: 100,
} as const;

/**
 * Recorta espacios y limita longitud. Devuelve string vacío si input es null/undefined.
 */
export function trimAndCap(value: string | null | undefined, maxLength: number): string {
  const s = (value ?? '').trim();
  return s.length > maxLength ? s.slice(0, maxLength) : s;
}
