import PantallaLogin from './componentes/PantallaLogin'

function App() {
  return (
    <main className="contenedor-principal">
      <header className="encabezado">
        <h1>Chatbot Facultad</h1>
        <p className="texto-secundario">
          Accede con tu cuenta institucional para iniciar una consulta oficial.
        </p>
      </header>
      <PantallaLogin />
    </main>
  )
}

export default App
