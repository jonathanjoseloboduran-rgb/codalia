# Seguridad — Codalia

Última auditoría: 2026-07-13. App de aprendizaje (Vite + Capacitor) con
Supabase para auth, progreso y certificados.

## Invariantes (NO romper)

1. **La clave de Supabase en el cliente es la ANON/publishable — nunca la
   `service_role`.** La anon es pública por diseño; la seguridad real la dan
   las políticas RLS. Si alguna vez se necesita la service_role, va en un
   backend/edge function, jamás en el APK o el bundle web.
2. **RLS activado con políticas de dueño** (verificado):
   - `user_progress`: `auth.uid() = user_id` para TODO (using + with check).
   - `certificates`: lectura pública (verificación de certificados es el
     propósito), escritura/actualización solo del dueño autenticado.
   Cualquier tabla nueva nace con RLS + política explícita — sin excepciones.
3. **Los certificados son verificables públicamente a propósito**: solo deben
   contener datos que el usuario acepta publicar (nombre en el certificado,
   nivel, fecha). Nunca agregar email, user_id visible u otros datos a esa
   tabla sin restringir la política de select.
4. **Entitlements premium**: hoy se guardan client-side (scaffold). Cuando el
   cobro real entre por Google Play Billing, la fuente de verdad de qué rutas
   están desbloqueadas debe validarse contra el recibo de compra — el estado
   local es cache, no autoridad.
5. **Sin secretos en el repo**: no hay `.env` con claves privadas; los IDs de
   AdMob son públicos por naturaleza (van en el APK).

## Riesgos aceptados

- `certificates` con select público permite enumerar todos los certificados
  emitidos (nombre + nivel + fecha). Es coherente con un certificado
  verificable; si algún día molesta, cambiar a lookup solo por código vía
  función RPC.
- Entitlements client-side hasta que exista Billing: un usuario técnico puede
  desbloquearse rutas editando su storage local. Riesgo asumido en fase
  gratuita/beta; se cierra con la validación de recibos (invariante 4).
