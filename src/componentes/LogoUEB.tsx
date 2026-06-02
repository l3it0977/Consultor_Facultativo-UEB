// Insignia con el escudo oficial de la UEB.
// Se muestra fija en la esquina superior derecha de cada interfaz
// (se renderiza una sola vez en App.tsx, así aparece en todas las pantallas).
function LogoUEB() {
  return (
    <div className="logo-ueb">
      <img src="/Fondo_UEB.png" alt="Escudo de la Universidad Evangélica Boliviana" />
    </div>
  )
}

export default LogoUEB
