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
        <div className="login-emblema">
          {/* Birrete académico */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 10 12 5 2 10l10 5 10-5Z" />
            <path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5" />
            <path d="M22 10v6" />
          </svg>
        </div>
        <h1 className="login-facultad">Facultad de Ingeniería</h1>
        <p className="login-universidad">Universidad Evangélica Boliviana · UEB</p>
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
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {mensajeError}
            </p>
          ) : null}

          <button className="boton-principal" type="submit">
            Iniciar conversación
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </section>

      <p className="login-pie">Asistente virtual de consultas académicas</p>
    </div>
  )
}

export default PantallaLogin
