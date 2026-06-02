import { useNombre } from './hooks/useNombre'
import PantallaLogin from './componentes/PantallaLogin'
import PantallaChat from './componentes/PantallaChat'
import LogoUEB from './componentes/LogoUEB'

function App() {
  const { nombre, setNombre, cerrarSesion } = useNombre()

  return (
    <>
      {/* Escudo UEB fijo arriba a la derecha, presente en todas las interfaces */}
      <LogoUEB />

      {nombre ? (
        <PantallaChat nombre={nombre} onCerrarSesion={cerrarSesion} />
      ) : (
        <PantallaLogin onEntrar={setNombre} />
      )}
    </>
  )
}

export default App
