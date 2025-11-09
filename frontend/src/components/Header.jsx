// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/publicaciones", label: "Publicaciones" },
  { to: "/temas", label: "Temas" },
  { to: "/personas", label: "Personas" },
  { to: "/recursos", label: "Recursos" },
  { to: "/lugares", label: "Lugares" },
  { to: "/etnias", label: "Etnias" },
  { to: "/mi-cuenta", label: "Mi cuenta" },
  { to: "/admin", label: "Admin" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // si cambias de ruta, limpia el menú móvil
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Atajo: presiona "/" para enfocar el buscador
  useEffect(() => {
    const onKey = (e) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName.toLowerCase() !== "input" &&
        document.activeElement?.tagName.toLowerCase() !== "textarea"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e) => {
    e?.preventDefault();
    const q = term.trim();
    navigate(q ? `/publicaciones?q=${encodeURIComponent(q)}` : "/publicaciones");
  };

  const baseItem = "px-3 py-2 rounded-md text-sm font-medium transition";
  const active = "bg-blue-600 text-white hover:bg-blue-700";
  const inactive = "text-slate-700 hover:bg-slate-100";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-400">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
        <div className="h-16 flex items-center gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="inline-block w-4 h-6 bg-blue-600 rounded-sm" />
            <span className="text-lg font-extrabold text-blue-900">EduConocimiento</span>
          </Link>

          {/* Buscador (desktop) */}
          <form onSubmit={submit} className="hidden md:flex flex-1 items-center">
            <label htmlFor="global-search" className="sr-only">Buscar</label>
            <input
              id="global-search"
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por nombre, autor, tema…"
              className="w-full max-w-xl border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </form>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${baseItem} ${isActive ? active : inactive}`
                }
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden ml-auto inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            <svg className={`h-6 w-6 ${open ? "hidden" : "block"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className={`h-6 w-6 ${open ? "block" : "hidden"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile menu + buscador */}
        <div className={`md:hidden ${open ? "block" : "hidden"} pb-3`}>
          <form onSubmit={submit} className="mb-2">
            <label htmlFor="global-search-m" className="sr-only">Buscar</label>
            <input
              id="global-search-m"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar…"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </form>
          <div className="grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${baseItem} ${isActive ? active : inactive}`
                }
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
