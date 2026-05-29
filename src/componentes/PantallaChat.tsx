import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useVoz } from '../hooks/useVoz'
import Avatar3D from './Avatar3D'
import Mensaje, { type MensajeChat } from './Mensaje'

type PantallaChatProps = {
  nombre: string
  onCerrarSesion: () => void
}

const crearId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const construirSaludo = (nombre: string) =>
  `Hola ${nombre}, soy el asistente de la Facultad de Ingeniería. ¿En qué puedo ayudarte sobre nuestras carreras?`

function PantallaChat({ nombre, onCerrarSesion }: PantallaChatProps) {
  const { hablar, detener, hablando } = useVoz()
  const [mensajes, setMensajes] = useState<MensajeChat[]>(() => [
    { id: crearId(), autor: 'bot', texto: construirSaludo(nombre) },
  ])
  const [pregunta, setPregunta] = useState('')
  const [cargando, setCargando] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    hablar(construirSaludo(nombre))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  const enviar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const texto = pregunta.trim()
    if (!texto || cargando) return

    setMensajes((prev) => [
      ...prev,
      { id: crearId(), autor: 'usuario', texto },
    ])
    setPregunta('')
    setCargando(true)

    try {
      const { data, error } = await supabase.functions.invoke('consultar', {
        body: { pregunta: texto },
      })

      if (error) throw error

      const respuesta: string =
        data?.respuesta ?? 'No pude generar una respuesta en este momento.'
      setMensajes((prev) => [
        ...prev,
        { id: crearId(), autor: 'bot', texto: respuesta },
      ])
      hablar(respuesta)
    } catch (error) {
      console.error('Error al consultar el asistente.', error)
      setMensajes((prev) => [
        ...prev,
        {
          id: crearId(),
          autor: 'bot',
          texto: 'Lo siento, ocurrió un error al consultar. Intenta de nuevo.',
        },
      ])
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="chat-root">
      {/* ── Panel izquierdo: avatar ── */}
      <aside className="avatar-panel">
        <Avatar3D hablando={hablando} />

        <p className="avatar-nombre">Asistente Virtual</p>

        <div className="avatar-estado">
          {hablando ? (
            <div className="avatar-ondas">
              <span /><span /><span /><span /><span />
            </div>
          ) : (
            <>
              <span className="avatar-estado-dot" />
              <span>En línea</span>
            </>
          )}
        </div>
      </aside>

      {/* ── Panel derecho: chat ── */}
      <div className="chat-panel-derecho">
        <header className="chat-encabezado">
          <div>
            <p className="chat-encabezado-titulo">Facultad de Ingeniería</p>
            <p className="chat-encabezado-subtitulo">Hola, {nombre} 👋</p>
          </div>
          <button
            type="button"
            className="boton-salir"
            onClick={() => {
              detener()
              onCerrarSesion()
            }}
          >
            Salir
          </button>
        </header>

        <div className="chat-mensajes">
          {mensajes.map((mensaje) => (
            <Mensaje key={mensaje.id} mensaje={mensaje} />
          ))}
          {cargando ? (
            <div className="burbuja burbuja-bot burbuja-cargando">
              <span className="dot-typing" />
              <span className="dot-typing" />
              <span className="dot-typing" />
            </div>
          ) : null}
          <div ref={finRef} />
        </div>

        <form className="chat-formulario" onSubmit={enviar}>
          <input
            className="campo-texto"
            type="text"
            placeholder="Escribe tu pregunta…"
            value={pregunta}
            onChange={(evento) => setPregunta(evento.target.value)}
            disabled={cargando}
          />
          <button className="boton-principal" type="submit" disabled={cargando}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}

export default PantallaChat
