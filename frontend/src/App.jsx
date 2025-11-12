// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';

// import Header from "./components/Header";
// import PublicacionesTacitas from "./pages/publicaciones/index.jsx";
// import PublicacionNueva from "./pages/nuevaPublicacion/index.jsx";
// import Home from "./pages/home/index.jsx";
// import Login from "./pages/authLogin/index.jsx";
// import Register from "./pages/authRegister/index.jsx";

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         {/* Header global (siempre visible) */}
//         <Header />

//         {/* Contenedor común para las páginas */}
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />

//             <Route path="/publicaciones" element={
//             <PublicacionesTacitas />} />

//             {/* <Route path="/publicaciones/nueva" element={
//             <PublicacionNueva />} /> */}

//             {/* <Route path="/publicaciones" element={

//             <ProtectedRoute roles={['user','admin']}>
//               <PublicacionesTacitas />
//             </ProtectedRoute>
//             }/> */}
            
//             /* <Route path="/publicaciones/nueva" element={

//             <ProtectedRoute roles={['user','admin']}>
//               <PublicacionNueva />
//             </ProtectedRoute>
//           }/> */

//           {/* ejemplo admin */}
//           {/* <Route path="/admin" element={
//             <ProtectedRoute roles={['admin']}>
//               <AdminPanel />
//             </ProtectedRoute>
//           }/> */}

//             {/* <Route path="/temas" element={<Temas />} /> */}
//             {/* <Route path="/personas" element={<Personas />} /> */}
//             <Route path="*" element={<div style={{ padding: 12 }}>Inicio</div>} />
//           </Routes>
//         </main>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Home from './pages/home'; // Asegúrate que exporte default
import PublicacionesTacitas from './pages/publicaciones';
import PublicacionNueva from './pages/nuevaPublicacion';
import Login from './pages/authLogin/index.jsx';
import Register from './pages/authRegister/index.jsx';

// Dummies de ejemplo (crea luego estos componentes)
const Temas = () => <div>Temas</div>;
const Personas = () => <div>Personas</div>;
const Recursos = () => <div>Recursos</div>;
const Lugares = () => <div>Lugares</div>;
const Etnias = () => <div>Etnias</div>;
const MiCuenta = () => <div>Mi cuenta</div>;
const Admin = () => <div>Panel Admin</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas de auth SIN header */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Resto de rutas envueltas en el layout (con header condicional) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/publicaciones" element={<PublicacionesTacitas />} />
          <Route path="/publicaciones/nueva" element={
            <ProtectedRoute><PublicacionNueva /></ProtectedRoute>
          }/>
          <Route path="/temas" element={
            <ProtectedRoute><Temas /></ProtectedRoute>
          }/>
          <Route path="/personas" element={
            <ProtectedRoute><Personas /></ProtectedRoute>
          }/>
          <Route path="/recursos" element={
            <ProtectedRoute><Recursos /></ProtectedRoute>
          }/>
          <Route path="/lugares" element={
            <ProtectedRoute><Lugares /></ProtectedRoute>
          }/>
          <Route path="/etnias" element={
            <ProtectedRoute><Etnias /></ProtectedRoute>
          }/>
          <Route path="/mi-cuenta" element={
            <ProtectedRoute><MiCuenta /></ProtectedRoute>
          }/>
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>
          }/>

          {/* 404 */}
          <Route path="*" element={<div>Ruta no encontrada</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
