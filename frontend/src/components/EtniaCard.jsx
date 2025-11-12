export default function EtniaCard({ item }) {
  const { nombre, descripcion, idioma, region, pais } = item || {};
  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-slate-900">
        {nombre || '(Sin nombre)'}
      </h3>
      {descripcion && (
        <p className="text-sm text-slate-600 mt-1 line-clamp-3">{descripcion}</p>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-700 mt-3">
        {idioma && <span>🗣️ {idioma}</span>}
        {region && <span>🗺️ {region}</span>}
        {pais && <span>🌎 {pais}</span>}
      </div>
    </article>
  );
}
