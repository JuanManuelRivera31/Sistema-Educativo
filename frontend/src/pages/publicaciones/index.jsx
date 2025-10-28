import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
// import Navbar from '../../components/navbar'; // si ya la tienes, descomenta

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
    const needles = q.trim().toLowerCase();
    if (!needles) return data;
    return data.filter(p =>
      (p.nombre || '').toLowerCase().includes(needles) ||
      (p.descripcion || '').toLowerCase().includes(needles) ||
      (p.autorNombre || '').toLowerCase().includes(needles) ||
      (p.temaNombre || '').toLowerCase().includes(needles)
    );
  }, [q, data]);

  return (
    <>
      {/* <Navbar /> */}
      <div className="max-w-6xl mx-auto p-6">
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

        {!loading && !err && (filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Nombre</th>
                  <th className="border px-3 py-2">Descripción</th>
                  <th className="border px-3 py-2">Fecha</th>
                  <th className="border px-3 py-2">Formato</th>
                  <th className="border px-3 py-2">Licencia</th>
                  <th className="border px-3 py-2">Autor</th>
                  <th className="border px-3 py-2">Tema</th>
                  <th className="border px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.iri} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 font-mono">{p.id}</td>
                    <td className="border px-3 py-2">{p.nombre}</td>
                    <td className="border px-3 py-2 truncate max-w-xs">{p.descripcion}</td>
                    <td className="border px-3 py-2">{p.fecha}</td>
                    <td className="border px-3 py-2">{p.formato}</td>
                    <td className="border px-3 py-2">{p.licencia}</td>
                    <td className="border px-3 py-2">{p.autorNombre || p.autorIri}</td>
                    <td className="border px-3 py-2">{p.temaNombre || p.temaIri}</td>
                    <td className="border px-3 py-2">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 text-sm bg-blue-600 text-white rounded">Ver</button>
                        <button className="px-2 py-1 text-sm bg-amber-500 text-white rounded">Editar</button>
                        <button className="px-2 py-1 text-sm bg-red-600 text-white rounded">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay publicaciones.</p>
        ))}
      </div>
    </>
  );
}
