import Navb from '../assets/nav/nav';
export default function App() {
  return (
    
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Navb />

      {/* Contenido derecho */}
      <div style={{ overflowY: 'auto',  width: '100%' }}>
    <div style={overlayStyle}>
      <h1 style={textStyle}>Bienvenido</h1>
    </div>
      </div>
    </div>
  )
}

/* --- ESTILOS EN JS (inline + animación global) --- */
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "linear-gradient(135deg, #4f46e5, #9333ea, #ec4899)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}

const textStyle = {
  fontSize: "5rem",
  fontWeight: "900",
  color: "white",
  textShadow: "0 0 20px rgba(0,0,0,0.5)",
  animation: "pulse 2s infinite",
  letterSpacing: "4px",
}

/* Animación para el texto */
const styleSheet = document.createElement("style")
styleSheet.innerHTML = `
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}
`
document.head.appendChild(styleSheet)
