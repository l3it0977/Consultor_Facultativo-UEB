import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Convierte el nombre de usuario en un correo válido para Supabase Auth.
const obtenerCorreoSimulado = (nombreUsuario: string) =>
  `${nombreUsuario.trim().toLowerCase()}@chatbot.facultad`

// Pantalla principal de inicio de sesión del Chatbot Facultad.
function PantallaLogin() {
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const manejarEnvio = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setMensajeError(null)
    setMensajeExito(null)

    if (!nombreUsuario.trim() || !contrasena) {
      setMensajeError('Completa el nombre de usuario y la contraseña.')
      return
    }

    setCargando(true)
    try {
      const correoSimulado = obtenerCorreoSimulado(nombreUsuario)
      const { error } = await supabase.auth.signInWithPassword({
        email: correoSimulado,
        password: contrasena,
      })

      if (error) {
        setMensajeError(`No se pudo iniciar sesión: ${error.message}`)
        return
      }

      setMensajeExito('Sesión iniciada correctamente.')
    } catch (error) {
      console.error('Error al iniciar sesión.', error)
      setMensajeError('Ocurrió un error inesperado al iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="tarjeta">
      <h2 className="titulo">Iniciar sesión</h2>
      <p className="texto-secundario">
        Ingresa con tu nombre de usuario para acceder al asistente.
      </p>

      <form className="formulario" onSubmit={manejarEnvio}>
        <label className="grupo-campo">
          <span className="etiqueta">Nombre de usuario</span>
          <input
            className="campo-texto"
            type="text"
            autoComplete="username"
            value={nombreUsuario}
            onChange={(evento) => setNombreUsuario(evento.target.value)}
          />
        </label>

        <label className="grupo-campo">
          <span className="etiqueta">Contraseña</span>
          <input
            className="campo-texto"
            type="password"
            autoComplete="current-password"
            value={contrasena}
            onChange={(evento) => setContrasena(evento.target.value)}
          />
        </label>

        {mensajeError ? (
          <p className="mensaje-error" role="alert">
            {mensajeError}
          </p>
        ) : null}

        {mensajeExito ? (
          <p className="mensaje-exito" role="status">
            {mensajeExito}
          </p>
        ) : null}

        <button className="boton-principal" type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>

      <p className="texto-secundario">
        ¿No tienes cuenta?{' '}
        <a className="enlace" href="/registro">
          Crear usuario
        </a>
      </p>
    </section>
  )
}

export default PantallaLogin
