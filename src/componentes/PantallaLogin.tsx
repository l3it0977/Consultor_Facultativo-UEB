import { useState } from 'react'

type PantallaLoginProps = {
  onEntrar: (nombre: string) => void
}

function PantallaLogin({ onEntrar }: PantallaLoginProps) {
  const [nombre, setNombre] = useState('')
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const manejarEnvio = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setMensajeError(null)

    if (!nombre.trim()) {
      setMensajeError('Por favor, escribe tu nombre para continuar.')
      return
    }

    onEntrar(nombre.trim())
  }

  return (
    <div className="login-wrapper">
      <div className="login-hero">
        <div className="login-icono">🏛️</div>
        <h1 className="login-facultad">Facultad de Ingeniería</h1>
        <p className="login-universidad">Universidad Evangelica Boliviana · UEB</p>
      </div>

      <section className="tarjeta">
        <h2 className="titulo">¡Bienvenido!</h2>
        <p className="texto-secundario">
          Escribe tu nombre y el asistente virtual resolverá tus dudas sobre las carreras de la facultad.
        </p>

        <form className="formulario" onSubmit={manejarEnvio}>
          <label className="grupo-campo">
            <span className="etiqueta">¿Cuál es tu nombre?</span>
            <input
              className="campo-texto"
              type="text"
              autoComplete="given-name"
              autoFocus
              placeholder="Por ejemplo: Leo"
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
            />
          </label>

          {mensajeError ? (
            <p className="mensaje-error" role="alert">
              {mensajeError}
            </p>
          ) : null}

          <button className="boton-principal" type="submit">
            Iniciar conversación
          </button>
        </form>
      </section>

      <p className="login-pie">Asistente virtual de consultas académicas</p>
    </div>
  )
}

export default PantallaLogin
