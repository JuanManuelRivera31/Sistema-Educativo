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
  const navigate = useNavigate();
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: "" });

  const page = Math.max(1, parseInt(get("page", "1"), 10));
  const pageSize = Math.max(1, parseInt(get("pageSize", "21"), 10));
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
        setState({ items: res.data.items || [], total: res.data.total || 0, loading: false, error: "" });
      } catch (e) {
        console.error(e);
        setState({ items: [], total: 0, loading: false, error: "No fue posible cargar las publicaciones" });
      }
    };
    fetchData();
  }, [page, pageSize, sort, q]);

  const totalPages = Math.max(1, Math.ceil(state.total / pageSize));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Toolbar responsive */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
          Publicaciones tácitas
        </h2>

        {/* Controles: en móvil se apilan; en desktop van en fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-2 md:w-auto md:grid-cols-none md:flex md:items-center">
          <input
            value={q}
            onChange={(e) => setMany({ q: e.target.value, page: 1 })}
            placeholder="Buscar por nombre, autor o tema…"
            className="border rounded px-3 py-2 w-full md:w-80"
          />

          <select
            value={sort}
            onChange={(e) => setMany({ sort: e.target.value, page: 1 })}
            className="border rounded px-2 py-2 w-full md:w-auto"
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
            className="border rounded px-2 py-2 w-full md:w-auto"
            title="Tamaño página"
          >
            <option value="12">12</option>
            <option value="20">20</option>
            <option value="36">36</option>
          </select>

          <button
            onClick={() => navigate("/publicaciones/nueva")}
            className="w-full md:w-auto font-semibold px-4 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:translate-y-[1px]"
          >
            Agregar publicación
          </button>
        </div>
      </div>

      {state.loading && <p className="text-gray-500">Cargando…</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}

      {!state.loading && !state.error && (
        state.items.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {state.items.map((item) => (
                <PublicacionCard key={item.iri || item.id} item={item} />
              ))}
            </div>

            {/* Paginador responsive */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
              <span className="text-sm text-slate-600 text-center sm:text-left">
                Página {page} de {totalPages} • {state.total} resultados
              </span>
              <div className="flex justify-center sm:justify-end gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setMany({ page: page - 1 })}
                  className="px-3 py-1.5 rounded border bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setMany({ page: page + 1 })}
                  className="px-3 py-1.5 rounded border bg-white hover:bg-slate-50 disabled:opacity-50"
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
