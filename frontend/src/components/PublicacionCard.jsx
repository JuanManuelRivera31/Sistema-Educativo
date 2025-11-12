// src/components/PublicacionCard.jsx
import { useMemo } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

/**
 * item: {
 *   iri, id, nombre, descripcion, fecha, formato, licencia,
 *   autorNombre, temaNombre, archivoUrl, mimeType, nombreArchivo
 * }
 * onDeleted?: (iri) => void
 */
export default function PublicacionCard({ item = {}, onDeleted }) {
  const {
    iri,
    id,
    nombre,
    descripcion,
    fecha,
    formato,
    licencia,
    autorNombre,
    temaNombre,
    archivoUrl,
    mimeType,
    nombreArchivo,
    etniaNombre,
  } = item;

  // Determinar el "kind" para la vista previa
  const kind = useMemo(() => {
    const f = String(formato || "").toLowerCase();
    const m = String(mimeType || "").toLowerCase();
    const url = String(archivoUrl || "").toLowerCase();

    if (!archivoUrl) return "none";

    // Imagen
    if (f === "imagen" || m.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(url)) {
      return "image";
    }
    // Video
    if (f === "video" || m.startsWith("video/") || /\.(mp4|webm|ogg|mov|mkv)$/.test(url)) {
      return "video";
    }
    // Audio
    if (f === "audio" || m.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/.test(url)) {
      return "audio";
    }
    // PDF
    if (f === "pdf" || m === "application/pdf" || /\.pdf$/.test(url)) {
      return "pdf";
    }
    // Otro
    return "unknown";
  }, [archivoUrl, formato, mimeType]);

  const noFile = !archivoUrl;

  async function handleDelete() {
    if (!iri) return;
    const ok = window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.");
    if (!ok) return;

    try {
      // Soporta dos variantes:
      // 1) /api/proyectos/:id?iri=...
      // 2) /api/proyectos?iri=...
      const url = id
        ? `${API_BASE}/api/proyectos/${encodeURIComponent(id)}?iri=${encodeURIComponent(iri)}`
        : `${API_BASE}/api/proyectos?iri=${encodeURIComponent(iri)}`;

      await axios.delete(url);
      if (typeof onDeleted === "function") onDeleted(iri);
    } catch (e) {
      console.error(e);
      alert("No fue posible eliminar la publicación");
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      {/* Vista previa */}
      <div className="aspect-video bg-slate-100 flex items-center justify-center">
        {noFile && <div className="text-slate-400 text-sm">Sin vista previa</div>}

        {!noFile && kind === "image" && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={archivoUrl} className="w-full h-full object-cover" loading="lazy" />
        )}

        {!noFile && kind === "video" && (
          <video src={archivoUrl} className="w-full h-full object-cover" controls preload="metadata" />
        )}

        {!noFile && kind === "audio" && (
          <div className="p-4 w-full">
            <audio src={archivoUrl} className="w-full" controls preload="metadata" />
          </div>
        )}

        {!noFile && kind === "pdf" && (
          <div className="p-4 text-center">
            <div className="text-slate-600 text-sm mb-2">Documento PDF</div>
            <a
              href={archivoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Abrir PDF
            </a>
          </div>
        )}

        {!noFile && kind === "unknown" && (
          <div className="p-4 text-center">
            <div className="text-slate-600 text-sm mb-2">Archivo</div>
            <a
              href={archivoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-3 py-1.5 rounded bg-slate-700 text-white text-sm hover:bg-slate-800"
            >
              Descargar {nombreArchivo ? `(${nombreArchivo})` : ""}
            </a>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-2">{nombre || "(Sin título)"}</h3>

        {descripcion && (
          <p className="text-slate-600 text-sm mt-1 line-clamp-2">{descripcion}</p>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 mt-3">
          {fecha && <span>📅 {fecha}</span>}
          {formato && <span>🗂️ {String(formato).toUpperCase()}</span>}
          {licencia && <span>⚖️ {licencia}</span>}
          {autorNombre && <span>👤 {autorNombre}</span>}
          {temaNombre && <span>🏷️ {temaNombre}</span>}
          {etniaNombre && <span>🧬 {etniaNombre}</span>}

        </div>

        {/* Acciones */}
        <div className="mt-3 flex items-center justify-between">
          {archivoUrl ? (
            <a
              href={archivoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 hover:text-blue-900 text-sm"
            >
              Abrir recurso ↗
            </a>
          ) : (
            <span className="text-slate-400 text-sm">Sin archivo</span>
          )}

          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm"
            title="Eliminar publicación"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

