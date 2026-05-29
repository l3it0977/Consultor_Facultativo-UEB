import { useNombre } from './hooks/useNombre'
import PantallaLogin from './componentes/PantallaLogin'
import PantallaChat from './componentes/PantallaChat'

function App() {
  const { nombre, setNombre, cerrarSesion } = useNombre()

  return nombre ? (
    <PantallaChat nombre={nombre} onCerrarSesion={cerrarSesion} />
  ) : (
    <PantallaLogin onEntrar={setNombre} />
  )
}

export default App
