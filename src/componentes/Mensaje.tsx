export type Autor = 'usuario' | 'bot'

export type MensajeChat = {
  id: string
  autor: Autor
  texto: string
}

type MensajeProps = {
  mensaje: MensajeChat
}

// Burbuja individual de la conversación.
function Mensaje({ mensaje }: MensajeProps) {
  const clase = mensaje.autor === 'usuario' ? 'burbuja-usuario' : 'burbuja-bot'
  return (
    <div className={`burbuja ${clase}`}>
      <p>{mensaje.texto}</p>
    </div>
  )
}

export default Mensaje
