import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export default function Header() {
  const navigate = useNavigate();

  const token = localStorage.getItem('auth_token');
  const roles = (() => {
    try { return JSON.parse(localStorage.getItem('auth_roles') || '[]'); }
    catch { return []; }
  })();
  const isAdmin = roles.includes('admin');

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); }
    catch { return null; }
  })();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'bg-blue-100 text-blue-800' : 'text-slate-700 hover:text-slate-900'
    }`;

  const onLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_roles');
    navigate('/login', { replace: true });
  };

  // Menú principal (solo con sesión)
  const mainLinks = useMemo(() => ([
    { to: '/', label: 'Inicio' },
    { to: '/publicaciones', label: 'Publicaciones' },
    { to: '/temas', label: 'Temas' },
    { to: '/personas', label: 'Personas' },
    { to: '/recursos', label: 'Recursos' },
    { to: '/lugares', label: 'Lugares' },
    { to: '/etnias', label: 'Etnias' },
    { to: '/mi-cuenta', label: 'Mi cuenta' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]), [isAdmin]);

  return (
    <header className="bg-white border-b border-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="inline-block w-2.5 h-6 bg-blue-600 rounded-sm" />
            <span className="text-2xl font-extrabold text-blue-900">EduConocimiento</span>
          </Link>

        {/* Si NO hay token → Login / Registrarse */}
        {!token ? (
          <nav className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-black text-blue-600 hover:text-blue-900">Iniciar sesión</Link>
                <Link to="/register" className="text-sm font-black text-blue-600 hover:text-blue-900">Registrarse</Link>
                <Link to="/about" className="text-sm font-black text-blue-600 hover:text-blue-900">Nosotros</Link>
          </nav>
        ) : (
          // Si hay token → menú completo + usuario + salir
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-1">
              {mainLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'} >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Menú compacto en pantallas pequeñas (simple versión) */}
            <div className="md:hidden">
              <select
                className="border rounded px-2 py-2 text-sm"
                onChange={(e) => e.target.value && navigate(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Menú</option>
                {mainLinks.map(l => (
                  <option key={l.to} value={l.to}>{l.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700">
                {user?.nombre ? `Hola, ${user.nombre}` : user?.correo || ''}
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
