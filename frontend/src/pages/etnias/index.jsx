import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import EtniaCard from "../../components/EtniaCard";

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

  return { get, setMany };
}

export default function EtniasPage() {
  const { get, setMany } = useQuery();
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: "" });

  const page = Math.max(1, parseInt(get("page", "1"), 10));
  const pageSize = Math.max(1, parseInt(get("pageSize", "20"), 10));
  const sort = get("sort", "nombre_asc");
  const q = get("q", "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(s => ({ ...s, loading: true, error: "" }));
        const url = `${API_BASE}/api/etnias?page=${page}&pageSize=${pageSize}&sort=${encodeURIComponent(sort)}&q=${encodeURIComponent(q)}`;
        const res = await axios.get(url);
        setState({ items: res.data.items || [], total: res.data.total || 0, loading: false, error: "" });
      } catch (e) {
        console.error(e);
        setState({ items: [], total: 0, loading: false, error: "No fue posible cargar las etnias" });
      }
    };
    fetchData();
  }, [page, pageSize, sort, q]);

  const totalPages = Math.max(1, Math.ceil(state.total / pageSize));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-extrabold text-blue-900">Etnias</h2>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setMany({ q: e.target.value, page: 1 })}
            placeholder="Buscar por nombre, idioma, región, país…"
            className="border rounded px-3 py-2 w-80"
          />
          <select
            value={sort}
            onChange={(e) => setMany({ sort: e.target.value, page: 1 })}
            className="border rounded px-2 py-2"
            title="Orden"
          >
            <option value="nombre_asc">Nombre A–Z</option>
            <option value="nombre_desc">Nombre Z–A</option>
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
        </div>
      </div>

      {state.loading && <p className="text-gray-500">Cargando…</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}

      {!state.loading && !state.error && (
        state.items.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.items.map(item => (
                <EtniaCard key={item.iri || item.id} item={item} />
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <span className="text-slate-900">
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
          <p className="text-gray-500">No hay etnias.</p>
        )
      )}
    </div>
  );
}
