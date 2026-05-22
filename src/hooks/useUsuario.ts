import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Hook centralizado para manejar la sesión y el usuario autenticado.
export const useUsuario = () => {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [sesion, setSesion] = useState<Session | null>(null)

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }
        setSesion(data.session)
        setUsuario(data.session?.user ?? null)
      } catch (error) {
        console.error('No se pudo recuperar la sesión.', error)
        window.alert('No se pudo recuperar la sesión actual.')
      }
    }

    void cargarSesion()

    const { data } = supabase.auth.onAuthStateChange((evento, sesionActual) => {
      if (evento === 'SIGNED_OUT') {
        setSesion(null)
        setUsuario(null)
        return
      }

      setSesion(sesionActual)
      setUsuario(sesionActual?.user ?? null)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const cerrarSesion = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('No se pudo cerrar la sesión.', error)
      window.alert('No se pudo cerrar la sesión.')
    }
  }, [])

  return { usuario, sesion, cerrarSesion }
}
