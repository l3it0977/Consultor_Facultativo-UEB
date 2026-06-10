import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useVoz } from '../hooks/useVoz'
import { useGrabacionVoz } from '../hooks/useGrabacionVoz'
import Avatar3D from './Avatar3D'

type PantallaVozAvatarProps = {
  nombre: string
  onVolver: () => void
  onCerrarSesion: () => void
}

const construirSaludo = (nombre: string) =>
  `Hola ${nombre}, soy el asistente de la Facultad de Ingeniería. Toca el micrófono y pregúntame lo que quieras sobre nuestras carreras.`

type Estado = 'inactivo' | 'grabando' | 'procesando' | 'hablando'

function PantallaVozAvatar({ nombre, onVolver, onCerrarSesion }: PantallaVozAvatarProps) {
  const { hablar, detener: detenerVoz, hablando } = useVoz()
  const [cargando, setCargando] = useState(false)
  const [pregunta, setPregunta] = useState('')
  // El saludo inicial se muestra de entrada (sin setState en un efecto).
  const [respuesta, setRespuesta] = useState(() => construirSaludo(nombre))
  const [textoFallback, setTextoFallback] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)

  // Envía la consulta a la Edge Function (por audio o por texto) y locuta la respuesta.
  const consultar = async (
    body: { pregunta?: string; audio?: string; mimeType?: string },
    preguntaMostrada?: string,
  ) => {
    if (cargando) return
    setAviso(null)
    if (preguntaMostrada !== undefined) setPregunta(preguntaMostrada)
    setRespuesta('')
    setCargando(true)
    detenerVoz() // por si el avatar seguía hablando

    try {
      const { data, error } = await supabase.functions.invoke('consultar', { body })
      if (error) throw error

      // Si vino por audio, el servidor nos devuelve la transcripción para mostrarla.
      if (typeof data?.pregunta === 'string' && data.pregunta) setPregunta(data.pregunta)

      const r: string =
        data?.respuesta ?? 'No pude generar una respuesta en este momento.'
      setRespuesta(r)
      hablar(r)
    } catch (error) {
      console.error('Error al consultar el asistente.', error)
      const r = 'Lo siento, no te entendí o hubo un error. Toca el micrófono e intenta de nuevo.'
      setRespuesta(r)
      hablar(r)
    } finally {
      setCargando(false)
    }
  }

  // Audio grabado → se envía para transcribir (Gemini) y responder.
  const manejarAudio = (audioBase64: string, mimeType: string) => {
    console.log('[voz] audio grabado, enviando para transcribir…', mimeType)
    void consultar({ audio: audioBase64, mimeType })
  }

  const { grabando, iniciar, detener: detenerGrabacion, soportado } =
    useGrabacionVoz({
      onAudio: manejarAudio,
      onError: (mensaje) => setAviso(mensaje),
    })

  // Saludo de bienvenida hablado al entrar a la pantalla.
  useEffect(() => {
    hablar(construirSaludo(nombre))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Al salir de la pantalla, cortamos cualquier locución en curso.
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [])

  const alternarMicrofono = () => {
    if (cargando) return
    if (grabando) {
      detenerGrabacion() // detiene y envía lo grabado
      return
    }
    setAviso(null)
    detenerVoz() // no grabamos nuestra propia voz
    void iniciar()
  }

  const salirCon = (accion: () => void) => {
    detenerVoz()
    detenerGrabacion()
    accion()
  }

  const estado: Estado = grabando
    ? 'grabando'
    : cargando
      ? 'procesando'
      : hablando
        ? 'hablando'
        : 'inactivo'

  const textoEstado =
    estado === 'grabando'
      ? 'Grabando… toca para enviar'
      : estado === 'procesando'
        ? 'Pensando…'
        : estado === 'hablando'
          ? 'Respondiendo…'
          : 'Toca el micrófono para hablar'

  return (
    <div className="voz-root">
      {/* ── Controles superiores (la esquina derecha la ocupa el escudo UEB) ── */}
      <div className="voz-barra">
        <button
          type="button"
          className="voz-boton-icono"
          onClick={() => salirCon(onVolver)}
          aria-label="Volver al inicio"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Inicio</span>
        </button>

        <button
          type="button"
          className="voz-boton-icono voz-boton-salir"
          onClick={() => salirCon(onCerrarSesion)}
          aria-label="Salir"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span>Salir</span>
        </button>
      </div>

      {/* ── Avatar a pantalla completa ── */}
      <div className="voz-escena">
        <Avatar3D hablando={hablando} className="voz-avatar-escena" />
      </div>

      {/* ── Subtítulos (pregunta + respuesta) ── */}
      <div className="voz-subtitulos">
        {pregunta ? <p className="voz-pregunta">{pregunta}</p> : null}
        <p className="voz-respuesta" aria-live="polite">
          {cargando ? (
            <span className="voz-typing" aria-label="Pensando">
              <span className="dot-typing" />
              <span className="dot-typing" />
              <span className="dot-typing" />
            </span>
          ) : (
            respuesta
          )}
        </p>
      </div>

      {/* ── Micrófono + estado ── */}
      <div className="voz-controles">
        {soportado ? (
          <>
            <button
              type="button"
              className={`voz-microfono voz-microfono-${estado}`}
              onClick={alternarMicrofono}
              disabled={cargando}
              aria-label={grabando ? 'Detener y enviar' : 'Tocar para hablar'}
            >
              {grabando ? (
                // Detener (cuadrado)
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="7" y="7" width="10" height="10" rx="2" />
                </svg>
              ) : (
                // Micrófono
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <path d="M12 19v3" />
                  <path d="M8 22h8" />
                </svg>
              )}
            </button>
            <p className="voz-estado" aria-live="polite">
              {textoEstado}
            </p>
          </>
        ) : (
          // Sin soporte de grabación: permitimos escribir la pregunta.
          <form
            className="voz-fallback"
            onSubmit={(evento) => {
              evento.preventDefault()
              const texto = textoFallback.trim()
              if (!texto || cargando) return
              setTextoFallback('')
              void consultar({ pregunta: texto }, texto)
            }}
          >
            <input
              className="campo-texto"
              type="text"
              placeholder="Tu navegador no permite el micrófono. Escribe tu pregunta…"
              value={textoFallback}
              onChange={(evento) => setTextoFallback(evento.target.value)}
              disabled={cargando}
            />
            <button className="chat-enviar" type="submit" disabled={cargando} aria-label="Enviar pregunta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
              </svg>
            </button>
          </form>
        )}

        {aviso ? (
          <p className="voz-aviso" role="alert">
            {aviso}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default PantallaVozAvatar
