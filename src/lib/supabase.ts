import { createClient } from '@supabase/supabase-js'

// Configura el cliente de Supabase usando variables de entorno de Vite.
const urlSupabase = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKeySupabase = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Si faltan las variables NO lanzamos un error que rompa toda la app
// (eso dejaría la pantalla en blanco/roja sin login). En su lugar avisamos
// por consola: el login seguirá funcionando y solo la consulta al asistente
// fallará de forma controlada hasta configurar las variables.
if (!urlSupabase || !anonKeySupabase) {
  console.error(
    'Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY.\n' +
      'En Vercel: Project Settings → Environment Variables. Luego vuelve a desplegar (Redeploy).',
  )
}

// Cliente Supabase reutilizable para autenticación y consultas.
// Usamos valores marcador si faltan las variables para que createClient no
// lance una excepción al cargar el módulo y la interfaz pueda renderizarse.
export const supabase = createClient(
  urlSupabase ?? 'https://placeholder.supabase.co',
  anonKeySupabase ?? 'placeholder-anon-key',
)
