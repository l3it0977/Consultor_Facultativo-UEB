import { useCallback, useEffect, useRef, useState } from 'react'

type Opciones = {
  // Se llama al terminar de grabar, con el audio listo para enviar al servidor.
  onAudio: (audioBase64: string, mimeType: string) => void
  onError?: (mensaje: string) => void
}

// Tiempo máximo de grabación (seguridad, por si el usuario olvida detener).
const LIMITE_MS = 20000

// Formatos que intentamos usar al grabar, en orden de preferencia.
const FORMATOS = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
]

const elegirFormato = (): string => {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const formato of FORMATOS) {
    if (MediaRecorder.isTypeSupported(formato)) return formato
  }
  return ''
}

// Graba la voz del usuario con el micrófono (getUserMedia + MediaRecorder) y
// entrega el audio en base64. No depende del servicio de reconocimiento del
// navegador: la transcripción la hace Gemini en el servidor.
export function useGrabacionVoz({ onAudio, onError }: Opciones) {
  const [grabando, setGrabando] = useState(false)
  const [soportado] = useState(
    () =>
      typeof navigator !== 'undefined' &&
      typeof navigator.mediaDevices?.getUserMedia === 'function' &&
      typeof window !== 'undefined' &&
      'MediaRecorder' in window,
  )

  const grabadorRef = useRef<MediaRecorder | null>(null)
  const trozosRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const temporizadorRef = useRef<number | null>(null)

  const onAudioRef = useRef(onAudio)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onAudioRef.current = onAudio
  }, [onAudio])
  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const liberarStream = () => {
    streamRef.current?.getTracks().forEach((pista) => pista.stop())
    streamRef.current = null
  }

  const limpiarTemporizador = () => {
    if (temporizadorRef.current !== null) {
      clearTimeout(temporizadorRef.current)
      temporizadorRef.current = null
    }
  }

  const detener = useCallback(() => {
    limpiarTemporizador()
    const grabador = grabadorRef.current
    if (grabador && grabador.state !== 'inactive') {
      grabador.stop() // dispara onstop, que entrega el audio
    }
  }, [])

  const iniciar = useCallback(async () => {
    if (!soportado || grabadorRef.current?.state === 'recording') return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const formato = elegirFormato()
      const grabador = new MediaRecorder(
        stream,
        formato ? { mimeType: formato } : undefined,
      )
      trozosRef.current = []

      grabador.ondataavailable = (evento) => {
        if (evento.data.size > 0) trozosRef.current.push(evento.data)
      }

      grabador.onstop = () => {
        setGrabando(false)
        limpiarTemporizador()
        liberarStream()

        const tipo = grabador.mimeType || formato || 'audio/webm'
        const blob = new Blob(trozosRef.current, { type: tipo })
        trozosRef.current = []

        if (blob.size === 0) {
          onErrorRef.current?.('No se grabó audio. Intenta de nuevo.')
          return
        }

        const lector = new FileReader()
        lector.onloadend = () => {
          const resultado = typeof lector.result === 'string' ? lector.result : ''
          const base64 = resultado.split(',')[1] ?? ''
          // Para Gemini enviamos el tipo sin "; codecs=...".
          const mimeLimpio = tipo.split(';')[0]
          if (base64) onAudioRef.current(base64, mimeLimpio)
          else onErrorRef.current?.('No se pudo procesar el audio. Intenta de nuevo.')
        }
        lector.readAsDataURL(blob)
      }

      grabador.onerror = () => {
        setGrabando(false)
        limpiarTemporizador()
        liberarStream()
        onErrorRef.current?.('Ocurrió un problema al grabar. Intenta de nuevo.')
      }

      grabadorRef.current = grabador
      grabador.start()
      setGrabando(true)
      temporizadorRef.current = window.setTimeout(detener, LIMITE_MS)
    } catch (error) {
      console.error('[voz] no se pudo acceder al micrófono:', error)
      liberarStream()
      const nombre = (error as { name?: string })?.name
      const mensaje =
        nombre === 'NotAllowedError' || nombre === 'SecurityError'
          ? 'No diste permiso al micrófono. Actívalo en el navegador (icono de la barra de direcciones) e intenta otra vez.'
          : nombre === 'NotFoundError'
            ? 'No se detectó ningún micrófono. Conecta uno e inténtalo de nuevo.'
            : 'No se pudo acceder al micrófono. Revisa los permisos del navegador.'
      onErrorRef.current?.(mensaje)
    }
  }, [soportado, detener])

  // Limpieza al desmontar el componente.
  useEffect(() => {
    return () => {
      limpiarTemporizador()
      const grabador = grabadorRef.current
      if (grabador && grabador.state !== 'inactive') grabador.stop()
      liberarStream()
    }
  }, [])

  return { grabando, iniciar, detener, soportado }
}
