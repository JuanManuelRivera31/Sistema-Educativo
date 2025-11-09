import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PublicacionCard from '../../components/PublicacionCard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function PublicacionesTacitas() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/publicaciones`);
        setData(res.data || []);
      } catch (e) {
        console.error(e);
        setErr('No fue posible cargar las publicaciones');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(p =>
      (p.nombre || '').toLowerCase().includes(s) ||
      (p.descripcion || '').toLowerCase().includes(s) ||
      (p.autorNombre || '').toLowerCase().includes(s) ||
      (p.temaNombre || '').toLowerCase().includes(s)
    );
  }, [q, data]);

  const handleView = (item) => {
    // Si hay archivo, lo abrimos; si no, abre una vista interna por ID (a futuro)
    if (item.archivoUrl) {
      const url = item.archivoUrl.startsWith('http')
        ? item.archivoUrl
        : `${window.location.origin}${item.archivoUrl}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Publicación ${item.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-extrabold text-blue-900">Publicaciones tácitas</h2>
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
        filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <PublicacionCard
                key={item.iri || item.id}
                item={item}
                onView={handleView}
                onEdit={() => alert('Editar (próximamente)')}
                onDelete={() => alert('Eliminar (próximamente)')}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay publicaciones.</p>
        )
      )}
    </div>
  );
}
