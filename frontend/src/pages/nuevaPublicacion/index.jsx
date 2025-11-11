import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function PublicacionNueva() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      fecha: new Date().toISOString().slice(0,10),
      formato: "texto",
      licencia: "CC-BY",
      archivoUrl: "",     // opción: pegar URL directa si no adjuntas archivo
      autorIri: "",
      temaIri: "",
      archivo: null       // file input
    }
  });
  const navigate = useNavigate();
  const archivo = watch("archivo");

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === "archivo") {
          if (v && v[0]) fd.append("archivo", v[0]);
        } else {
          if (v !== undefined && v !== null) fd.append(k, v);
        }
      });
      await axios.post(`${API_BASE}/api/proyectos`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      reset();
      navigate("/publicaciones?page=1&sort=fecha_desc");
    } catch (e) {
      console.error(e);
      alert("No fue posible crear la publicación");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-4">
        Nueva publicación tácita
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            className="w-full border rounded px-3 py-2"
            {...register("nombre", { required: "El nombre es obligatorio" })}
            placeholder="Título de la publicación"
          />
          {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[100px]"
            {...register("descripcion")}
            placeholder="Resumen o notas"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de creación</label>
            <input type="date" className="w-full border rounded px-3 py-2" {...register("fecha")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Formato</label>
            <select className="w-full border rounded px-3 py-2" {...register("formato")}>
              <option value="texto">Texto</option>
              <option value="pdf">PDF</option>
              <option value="imagen">Imagen</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Licencia</label>
          <input className="w-full border rounded px-3 py-2" {...register("licencia")} placeholder="CC-BY, CC0, etc." />
        </div>

        {/* O pones URL directa... */}
        <div>
          <label className="block text-sm font-medium mb-1">URL del archivo (opcional)</label>
          <input className="w-full border rounded px-3 py-2" {...register("archivoUrl")} placeholder="https://... o /repositorio/archivo.pdf" />
          <p className="text-xs text-slate-500 mt-1">Si adjuntas archivo abajo, esta URL se ignorará.</p>
        </div>

        {/* ...o adjuntas un archivo para subir */}
        <div>
          <label className="block text-sm font-medium mb-1">Adjuntar archivo (opcional)</label>
          <input type="file" {...register("archivo")} name="archivo" className="block w-full text-sm" />
          {archivo?.[0] && (
            <p className="text-xs text-slate-600 mt-1">
              Seleccionado: {archivo[0].name} ({Math.round(archivo[0].size/1024)} KB)
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Autor (IRI)</label>
            <input className="w-full border rounded px-3 py-2" {...register("autorIri")} placeholder="http://.../Persona_123" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tema (IRI)</label>
            <input className="w-full border rounded px-3 py-2" {...register("temaIri")} placeholder="http://.../Tema_abc" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded border bg-white hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60">
            {isSubmitting ? 'Guardando…' : 'Crear publicación'}
          </button>
        </div>
      </form>
    </div>
  );
}