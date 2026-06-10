import { useState } from 'react'
import { useNombre } from './hooks/useNombre'
import PantallaLogin from './componentes/PantallaLogin'
import PantallaSeleccion from './componentes/PantallaSeleccion'
import PantallaChat from './componentes/PantallaChat'
import PantallaVozAvatar from './componentes/PantallaVozAvatar'
import LogoUEB from './componentes/LogoUEB'

type Modo = 'seleccion' | 'chat' | 'voz'

function App() {
  const { nombre, setNombre, cerrarSesion } = useNombre()
  // Tras el login se muestra el selector; desde ahí se entra al chat o a la voz.
  const [modo, setModo] = useState<Modo>('seleccion')

  const volverAlInicio = () => setModo('seleccion')

  const salir = () => {
    setModo('seleccion')
    cerrarSesion()
  }

  const entrar = (nuevoNombre: string) => {
    setModo('seleccion')
    setNombre(nuevoNombre)
  }

  let pantalla
  if (!nombre) {
    pantalla = <PantallaLogin onEntrar={entrar} />
  } else if (modo === 'chat') {
    pantalla = <PantallaChat nombre={nombre} onVolver={volverAlInicio} onCerrarSesion={salir} />
  } else if (modo === 'voz') {
    pantalla = <PantallaVozAvatar nombre={nombre} onVolver={volverAlInicio} onCerrarSesion={salir} />
  } else {
    pantalla = <PantallaSeleccion nombre={nombre} onElegir={setModo} onCerrarSesion={salir} />
  }

  return (
    <>
      {/* Escudo UEB fijo arriba a la derecha, presente en todas las interfaces */}
      <LogoUEB />
      {pantalla}
    </>
  )
}

export default App
