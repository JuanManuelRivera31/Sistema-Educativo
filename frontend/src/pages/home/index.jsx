import { Link } from "react-router-dom";

const SECCIONES = [
  {
    key: "publicaciones",
    title: "Publicaciones",
    to: "/publicaciones",
    img: "/img/km.png", 
    desc: "Repositorio de conocimiento tácito (textos, PDFs, imágenes, videos, audio)."
  },
  {
    key: "temas",
    title: "Temas",
    to: "/temas",
    img: "/img/temas.png", 
    desc: "Ejes temáticos y categorías para organizar el conocimiento."
  },
  {
    key: "personas",
    title: "Personas",
    to: "/personas",
    img: "/img/person.jpg", 
    desc: "Autores, docentes, estudiantes y actores relevantes."
  },
  {
    key: "recursos",
    title: "Recursos",
    to: "/recursos",
    img: "/img/resources.png",
    desc: "Materiales de apoyo, herramientas y referencias."
  },
  {
    key: "lugares",
    title: "Lugares",
    to: "/lugares",
    img: "/img/places.png", 
    desc: "Contextos geográficos y espacios educativos vinculados."
  },
  {
    key: "etnias",
    title: "Etnias",
    to: "/etnias",
    img: "/img/people.jpg",
    desc: "Diversidad cultural, tradiciones y saberes ancestrales."
  }
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900">Repositorio Escolar</h1>
        <p className="text-slate-600 mt-1">
          Explora el conocimiento tácito del sector educativo a través de estas colecciones.
        </p>
      </header>

      {/* Grid de secciones */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECCIONES.map((sec) => (
          <Link
            key={sec.key}
            to={sec.to}
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
          >
            <article className="h-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition hover:shadow-md">
              {/* Vista previa / Imagen */}
              <div className="aspect-[16/9] bg-slate-100">
                {sec.img ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img
                    src={sec.img}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    Añade una imagen para “{sec.title}”
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {sec.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 line-clamp-3">
                  {sec.desc}
                </p>

                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 text-blue-700 group-hover:text-blue-900 text-sm">
                    Ir a {sec.title} <span aria-hidden>→</span>
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}
