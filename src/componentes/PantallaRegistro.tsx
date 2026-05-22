import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Convierte el nombre de usuario en un correo válido para Supabase Auth.
const obtenerCorreoSimulado = (nombreUsuario: string) =>
  `${nombreUsuario.trim().toLowerCase()}@chatbot.facultad`

// Pantalla de registro para nuevos usuarios del Chatbot Facultad.
function PantallaRegistro() {
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const manejarEnvio = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setMensajeError(null)
    setMensajeExito(null)

    if (!nombreUsuario.trim() || !contrasena || !confirmarContrasena) {
      setMensajeError('Completa todos los campos para continuar.')
      return
    }

    if (contrasena !== confirmarContrasena) {
      setMensajeError('Las contraseñas no coinciden.')
      return
    }

    setCargando(true)
    try {
      const correoSimulado = obtenerCorreoSimulado(nombreUsuario)
      const { error } = await supabase.auth.signUp({
        email: correoSimulado,
        password: contrasena,
        options: {
          data: {
            nombre_usuario: nombreUsuario,
          },
        },
      })

      if (error) {
        setMensajeError(`No se pudo registrar la cuenta: ${error.message}`)
        return
      }

      setMensajeExito('Registro exitoso. Ya puedes iniciar sesión.')
    } catch (error) {
      console.error('Error al registrar usuario.', error)
      setMensajeError('Ocurrió un error inesperado al registrar la cuenta.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="tarjeta">
      <h2 className="titulo">Crear cuenta</h2>
      <p className="texto-secundario">
        Regístrate con tu nombre de usuario para acceder al asistente.
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
            autoComplete="new-password"
            value={contrasena}
            onChange={(evento) => setContrasena(evento.target.value)}
          />
        </label>

        <label className="grupo-campo">
          <span className="etiqueta">Confirmar contraseña</span>
          <input
            className="campo-texto"
            type="password"
            autoComplete="new-password"
            value={confirmarContrasena}
            onChange={(evento) => setConfirmarContrasena(evento.target.value)}
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
          {cargando ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="texto-secundario">
        ¿Ya tienes cuenta?{' '}
        <a className="enlace" href="/login">
          Volver a iniciar sesión
        </a>
      </p>
    </section>
  )
}

export default PantallaRegistro
