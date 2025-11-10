function resolveType({ formato, archivoUrl }) {
  const f = (formato || '').toLowerCase();
  const url = (archivoUrl || '').toLowerCase();

  // prioriza formato si viene
  if (f.includes('imagen')) return 'image';
  if (f.includes('video'))  return 'video';
  if (f.includes('audio'))  return 'audio';
  if (f.includes('pdf'))    return 'pdf';
  if (f.includes('texto') || f.includes('text')) return 'text';

  // detecta por extensión
  if (/\.(png|jpe?g|webp|gif|bmp|svg)$/.test(url)) return 'image';
  if (/\.(mp4|webm|ogg|mov|m4v)$/.test(url))       return 'video';
  if (/\.(mp3|wav|ogg|m4a|flac)$/.test(url))       return 'audio';
  if (/\.(pdf)$/.test(url))                        return 'pdf';
  return 'text';
}

export default function PublicacionCard({ item, onView, onEdit, onDelete }) {
  const {
    id, nombre, descripcion, fecha, formato, licencia,
    autorNombre, temaNombre, archivoUrl
  } = item;

  const type = resolveType({ formato, archivoUrl });

  const Preview = () => {
    if (type === 'image' && archivoUrl) {
      return (
        <img
          src={archivoUrl}
          alt={nombre || id}
          className="w-full h-48 object-cover rounded-t-2xl"
          loading="lazy"
        />
      );
    }
    if (type === 'video' && archivoUrl) {
      return (
        <video
          className="w-full h-48 rounded-t-2xl"
          controls
          preload="metadata"
        >
          <source src={archivoUrl} />
        </video>
      );
    }
    if (type === 'audio' && archivoUrl) {
      return (
        <div className="w-full h-48 flex items-center justify-center bg-slate-100 rounded-t-2xl">
          <audio controls className="w-11/12">
            <source src={archivoUrl} />
          </audio>
        </div>
      );
    }
    if (type === 'pdf' && archivoUrl) {
      return (
        <iframe
          className="w-full h-48 rounded-t-2xl"
          src={archivoUrl}
          title={nombre || id}
        />
      );
    }
    // texto / desconocido
    return (
      <div className="w-full h-48 bg-slate-100 rounded-t-2xl flex items-center justify-center px-4 text-center">
        <p className="text-slate-500 line-clamp-3">
          {descripcion || 'Sin previsualización'}
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl shadow hover:shadow-lg transition overflow-hidden bg-white border border-slate-200">
      <Preview />
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">{id}</span>
          {formato && <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100">{formato}</span>}
        </div>
        <h3 className="text-lg font-semibold leading-tight">{nombre || 'Sin título'}</h3>
        {descripcion && (
          <p className="text-sm text-slate-600 line-clamp-3">{descripcion}</p>
        )}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2">
          {autorNombre && <div><span className="font-medium">Autor:</span> {autorNombre}</div>}
          {temaNombre &&  <div><span className="font-medium">Tema:</span> {temaNombre}</div>}
          {fecha &&       <div><span className="font-medium">Fecha:</span> {fecha}</div>}
          {licencia &&    <div><span className="font-medium">Licencia:</span> {licencia}</div>}
        </div>
        <div className="pt-3 flex gap-2">
          <button
            onClick={() => onView?.(item)}
            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >Ver</button>
          <button
            onClick={() => onEdit?.(item)}
            className="px-3 py-1.5 text-sm rounded bg-amber-500 text-white hover:bg-amber-600"
          >Editar</button>
          <button
            onClick={() => onDelete?.(item)}
            className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
          >Eliminar</button>
        </div>
      </div>
    </div>
  );
}
