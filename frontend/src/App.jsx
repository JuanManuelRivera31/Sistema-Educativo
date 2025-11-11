import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Header from "./components/Header";
import PublicacionesTacitas from "./pages/publicaciones/index.jsx";
import PublicacionNueva from "./pages/nuevaPublicacion/index.jsx";
import Home from "./pages/home/index.jsx";
import Login from "./pages/authLogin/index.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Header global (siempre visible) */}
        <Header />

        {/* Contenedor común para las páginas */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/publicaciones" element={<PublicacionesTacitas />} />

            
            <Route path="/publicaciones/nueva" element={
            <ProtectedRoute roles={['user','admin']}>
              <PublicacionNueva />
            </ProtectedRoute>
          }/>

          {/* ejemplo admin */}
          {/* <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }/> */}

            {/* <Route path="/temas" element={<Temas />} /> */}
            {/* <Route path="/personas" element={<Personas />} /> */}
            <Route path="*" element={<div style={{ padding: 12 }}>Inicio</div>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
