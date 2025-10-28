import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import PublicacionesTacitas from './pages/publicaciones/index.jsx'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/publicaciones">Publicaciones</Link>
      </nav>
      <Routes>
        <Route path="/publicaciones" element={<PublicacionesTacitas />} />
        <Route path="*" element={<div style={{ padding: 12 }}>Inicio</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App   