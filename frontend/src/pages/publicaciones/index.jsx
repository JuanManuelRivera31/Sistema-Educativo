// src/pages/publicaciones/index.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import PublicacionCard from "../../components/PublicacionCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

function useQuery() {
  const loc = useLocation();
  const nav = useNavigate();
  const params = new URLSearchParams(loc.search);

  const get = (k, def) => params.get(k) ?? def;
  const setMany = (obj) => {
    const p = new URLSearchParams(loc.search);
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") p.delete(k);
      else p.set(k, String(v));
    });
    nav({ search: p.toString() }, { replace: true });
  };

  return { params, get, setMany };
}

export default function PublicacionesTacitas() {
  const { get, setMany } = useQuery();
  const [state, setState] = useState({
    items: [],
    total: 0,
    loading: true,
    error: "",
  });

  const page = Math.max(1, parseInt(get("page", "1"), 10));
  const pageSize = Math.max(1, parseInt(get("pageSize", "12"), 10));
  const sort = get("sort", "fecha_desc");
  const q = get("q", "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: "" }));
        const url = `${API_BASE}/api/proyectos?page=${page}&pageSize=${pageSize}&sort=${encodeURIComponent(
          sort
        )}&q=${encodeURIComponent(q)}`;
        const res = await axios.get(url);
        setState({
          items: res.data.items || [],
          total: res.data.total || 0,
          loading: false,
          error: "",
        });
      } catch (e) {
        console.error(e);
        setState({
          items: [],
          total: 0,
          loading: false,
          error: "No fue posible cargar las publicaciones",
        });
      }
    };
    fetchData();
  }, [page, pageSize, sort, q]);

  const totalPages = Math.max(1, Math.ceil(state.total / pageSize));

  // 🔴 NUEVO: actualizar la lista local tras eliminar, sin recargar
  const handleDeleted = (iriEliminada) => {
    setState((s) => {
      const items = s.items.filter((it) => it.iri !== iriEliminada);
      const total = Math.max(0, s.total - 1);

      // Si la página quedó vacía y no es la primera, retrocede una página
      if (items.length === 0 && page > 1) {
        // Cambia la URL (esto disparará el useEffect y recargará datos)
        setMany({ page: page - 1 });
        return s; // devolvemos el estado actual (lo recargará el efecto)
      }

      // Si aún hay elementos en la página, actualiza estado inmediatamente
      return { ...s, items, total };
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-blue-900">
          Publicaciones tácitas
        </h2>

        <div className="flex gap-2 flex-wrap">
          <input
            value={q}
            onChange={(e) => setMany({ q: e.target.value, page: 1 })}
            placeholder="Buscar por nombre, autor o tema…"
            className="border rounded px-3 py-2 w-64"
          />
          <select
            value={sort}
            onChange={(e) => setMany({ sort: e.target.value, page: 1 })}
            className="border rounded px-2 py-2"
            title="Orden"
          >
            <option value="fecha_desc">Más recientes</option>
            <option value="fecha_asc">Más antiguas</option>
            <option value="titulo_asc">Título A–Z</option>
            <option value="titulo_desc">Título Z–A</option>
          </select>
          <select
            value={pageSize}
            onChange={(e) => setMany({ pageSize: e.target.value, page: 1 })}
            className="border rounded px-2 py-2"
            title="Tamaño página"
          >
            <option value="12">12</option>
            <option value="20">20</option>
            <option value="36">36</option>
          </select>

            <a
              href="/publicaciones/nueva"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Agregar publicación
            </a>
        </div>
      </div>

      {state.loading && <p className="text-gray-500">Cargando…</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}

      {!state.loading && !state.error && (
        state.items.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.items.map((item) => (
                <PublicacionCard
                  key={item.iri || item.id}
                  item={item}
                  onDeleted={handleDeleted} // ← pasa el callback
                />
              ))}
            </div>

            {/* Paginador */}
            <div className="flex items-center justify-between mt-6">
              <span className="text-slate-700">
                Página {page} de {totalPages} • {state.total} resultados
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setMany({ page: page - 1 })}
                  className="px-3 py-1.5 rounded border disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setMany({ page: page + 1 })}
                  className="px-3 py-1.5 rounded border disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No hay publicaciones.</p>
        )
      )}
    </div>
  );
}

