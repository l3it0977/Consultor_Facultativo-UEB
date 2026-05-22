import { createClient } from '@supabase/supabase-js'

// Configura el cliente de Supabase usando variables de entorno de Vite.
const urlSupabase = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKeySupabase = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!urlSupabase || !anonKeySupabase) {
  throw new Error('Faltan variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.')
}

// Cliente Supabase reutilizable para autenticación y consultas.
export const supabase = createClient(urlSupabase, anonKeySupabase)
