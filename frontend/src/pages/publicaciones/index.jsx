// src/pages/Publicaciones.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import PublicacionCard from "../../components/PublicacionCard.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

function useQueryParam(key, initial = "") {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const value = params.get(key) ?? initial;

  const setValue = (v) => {
    const p = new URLSearchParams(location.search);
    if (!v) p.delete(key); else p.set(key, v);
    navigate({ search: p.toString() }, { replace: true });
  };
  return [value, setValue];
}

export default function Publicaciones() {
  const [remote, setRemote] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useQueryParam("q", ""); // ← se conecta con ?q=

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/proyectos`);
        setRemote(res.data || []);
      } catch (e) {
        console.error(e);
        setErr("No fue posible cargar las publicaciones");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return remote;
    return remote.filter(p =>
      (p.nombre || "").toLowerCase().includes(s) ||
      (p.descripcion || "").toLowerCase().includes(s) ||
      (p.autorNombre || "").toLowerCase().includes(s) ||
      (p.temaNombre || "").toLowerCase().includes(s)
    );
  }, [remote, q]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-extrabold text-blue-900">Publicaciones tácitas</h2>

        {/* buscador local (sincronizado con ?q=) */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, autor o tema…"
          className="border rounded px-3 py-2 w-80"
        />
      </div>

      {loading && <p className="text-gray-500">Cargando…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {!loading && !err && (
        data.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(item => (
              <PublicacionCard key={item.iri || item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay publicaciones.</p>
        )
      )}
    </div>
  );
}
