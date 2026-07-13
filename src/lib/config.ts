// URL base del contenido remoto (catálogo + cursos), en Supabase Storage.
// Vacío = sin remoto: la app usa solo el contenido bundleado + el cacheado.
//
// Formato del bucket público de Supabase:
//   https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/
// El catálogo se busca en `${CONTENT_BASE_URL}catalog.json`
// y cada curso en `${CONTENT_BASE_URL}courses/<id>.json`.
//
// ⚠️ Si tu proyecto Supabase es OTRO, cambiá el project-ref de abajo.
export const CONTENT_BASE_URL =
  'https://wfbsfbhpzxmbwiwrfbgd.supabase.co/storage/v1/object/public/content/'

// Supabase: auth (cuenta opcional) + sincronización de progreso.
// Mismo proyecto que el contenido. La publishable key es pública (segura en el cliente).
export const SUPABASE_URL = 'https://wfbsfbhpzxmbwiwrfbgd.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_i775W2v1ULEUEaXA9n6JKQ_vCiwztmk'

// Precios de cada ruta premium (solo display; el cobro real va por Google Play
// Billing cuando la app esté publicada). Keyed por id de ruta.
export const PATH_PRICES: Record<string, string> = {
  'python-avanzado': 'US$ 14,99',
  'python-ia-datos': 'US$ 19,99',
}
