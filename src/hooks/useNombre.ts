import { useCallback, useState } from 'react'

const CLAVE_ALMACENAMIENTO = 'chatbot_facultad_nombre'

// Maneja el nombre del usuario (login solo-nombre) persistido en localStorage.
export function useNombre() {
  const [nombre, setNombreState] = useState<string>(
    () => localStorage.getItem(CLAVE_ALMACENAMIENTO) ?? '',
  )

  const setNombre = useCallback((nuevoNombre: string) => {
    const limpio = nuevoNombre.trim()
    localStorage.setItem(CLAVE_ALMACENAMIENTO, limpio)
    setNombreState(limpio)
  }, [])

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(CLAVE_ALMACENAMIENTO)
    setNombreState('')
  }, [])

  return { nombre, setNombre, cerrarSesion }
}
