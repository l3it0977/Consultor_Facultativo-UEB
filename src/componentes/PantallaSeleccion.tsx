type Modo = 'chat' | 'voz'

type PantallaSeleccionProps = {
  nombre: string
  onElegir: (modo: Modo) => void
  onCerrarSesion: () => void
}

// Tras iniciar sesión, el usuario elige cómo quiere consultar:
// hablar con el avatar (voz) o el chat escrito de siempre.
function PantallaSeleccion({ nombre, onElegir, onCerrarSesion }: PantallaSeleccionProps) {
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
        <h1 className="login-facultad">Hola, {nombre} 👋</h1>
        <p className="login-universidad">¿Cómo quieres consultar hoy?</p>
      </div>

      <section className="tarjeta seleccion-tarjeta">
        {/* Opción principal: la nueva interfaz de voz */}
        <button type="button" className="seleccion-opcion" onClick={() => onElegir('voz')}>
          <span className="seleccion-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <path d="M12 19v3" />
              <path d="M8 22h8" />
            </svg>
          </span>
          <span className="seleccion-textos">
            <span className="seleccion-titulo">Hablar con el avatar</span>
            <span className="seleccion-desc">Habla por el micrófono y el avatar te responde con voz.</span>
          </span>
          <span className="seleccion-flecha">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
        </button>

        {/* Chat escrito de siempre */}
        <button type="button" className="seleccion-opcion" onClick={() => onElegir('chat')}>
          <span className="seleccion-icono seleccion-icono-suave">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
            </svg>
          </span>
          <span className="seleccion-textos">
            <span className="seleccion-titulo">Chat escrito</span>
            <span className="seleccion-desc">Escribe tus preguntas y lee las respuestas.</span>
          </span>
          <span className="seleccion-flecha">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
        </button>

        <button type="button" className="seleccion-salir" onClick={onCerrarSesion}>
          Cambiar de usuario
        </button>
      </section>

      <p className="login-pie">Asistente virtual de consultas académicas</p>
    </div>
  )
}

export default PantallaSeleccion
