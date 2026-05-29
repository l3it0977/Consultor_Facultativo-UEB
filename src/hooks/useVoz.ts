import { useCallback, useEffect, useRef, useState } from 'react'

// Envuelve la Web Speech API para que el avatar "hable" las respuestas.
// Expone `hablando` (true mientras pronuncia) para animar el avatar.
export function useVoz() {
  const [hablando, setHablando] = useState(false)
  const [soportado] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  )
  const vozRef = useRef<SpeechSynthesisVoice | null>(null)

  // Selecciona una voz en español en cuanto el navegador las carga.
  useEffect(() => {
    if (!soportado) return

    const elegirVoz = () => {
      const voces = window.speechSynthesis.getVoices()
      vozRef.current =
        voces.find((voz) => voz.lang.toLowerCase().startsWith('es')) ??
        voces[0] ??
        null
    }

    elegirVoz()
    window.speechSynthesis.addEventListener('voiceschanged', elegirVoz)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', elegirVoz)
    }
  }, [soportado])

  const hablar = useCallback(
    (texto: string) => {
      if (!soportado || !texto.trim()) return

      // Elimina formato markdown para que el TTS no lea "asterisco", "#", etc.
      const textoLimpio = texto
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/#{1,6}\s+/g, '')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .trim()

      window.speechSynthesis.cancel()
      const enunciado = new SpeechSynthesisUtterance(textoLimpio)
      enunciado.lang = vozRef.current?.lang ?? 'es-ES'
      if (vozRef.current) enunciado.voice = vozRef.current
      enunciado.rate = 1
      enunciado.pitch = 1
      enunciado.onstart = () => setHablando(true)
      enunciado.onend = () => setHablando(false)
      enunciado.onerror = () => setHablando(false)
      window.speechSynthesis.speak(enunciado)
    },
    [soportado],
  )

  const detener = useCallback(() => {
    if (!soportado) return
    window.speechSynthesis.cancel()
    setHablando(false)
  }, [soportado])

  return { hablar, detener, hablando, soportado }
}
