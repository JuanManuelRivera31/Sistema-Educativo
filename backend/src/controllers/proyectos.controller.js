
const { query } = require('../../db'); // ajusta ruta si tu db.js está en otro lado

const ONTO_BASE = (process.env.ONTO_BASE || 'http://example.org/educa').replace(/[#/]?$/, '');
const CLASS_PROYECTO = process.env.CLASS_PROYECTO || 'PublicacionTacita';

const PREFIX = `
PREFIX : <${ONTO_BASE}/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
`;

const iri = (local) => `:${local}`;
const lit = (v) => `"${String(v ?? '').replace(/"/g, '\\"')}"`;

/** GET /proyectos */
const getAllProyectos = async (req, res) => {
  try {
    const q = `
      ${PREFIX}
      SELECT ?id ?nombre ?fecha ?formato ?licencia ?tema ?temaNombre ?autor ?autorNombre
      WHERE {
        ?p rdf:type :${CLASS_PROYECTO} ;
           :tieneNombre ?nombre ;
           :tieneFechaCreacion ?fecha ;
           :tieneFormato ?formato ;
           :tieneLicencia ?licencia ;
           :publicacion_Tiene_Tema ?tema ;
           :publicadoPor ?autor .
        BIND(STRAFTER(STR(?p), "${ONTO_BASE}/") AS ?id)
        OPTIONAL { ?tema  :tieneNombre ?temaNombre }
        OPTIONAL { ?autor :tieneNombre ?autorNombre }
      }
      ORDER BY LCASE(?nombre)
    `;
    const r = await query.select(q);
    const rows = r.results.bindings.map(b => ({
      id: b.id?.value,
      nombre: b.nombre?.value,
      fecha: b.fecha?.value,
      formato: b.formato?.value,
      licencia: b.licencia?.value,
      tema: b.tema?.value,
      temaNombre: b.temaNombre?.value,
      autor: b.autor?.value,
      autorNombre: b.autorNombre?.value
    }));
    res.json(rows);
  } catch (error) {
    console.error('Error getAllProyectos:', error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

/** GET /proyectos/proyecto/:idProyecto */
const getProyecto = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const q = `
      ${PREFIX}
      SELECT ?iri ?nombre ?descripcion ?fecha ?formato ?licencia ?archivo
             ?tema ?temaNombre ?autor ?autorNombre
      WHERE {
        BIND(${iri(idProyecto)} AS ?iri)
        ?iri rdf:type :${CLASS_PROYECTO} ;
             :tieneNombre ?nombre ;
             :tieneDescripcion ?descripcion ;
             :tieneFechaCreacion ?fecha ;
             :tieneFormato ?formato ;
             :tieneLicencia ?licencia ;
             :tieneArchivo ?archivo ;
             :publicacion_Tiene_Tema ?tema ;
             :publicadoPor ?autor .
        OPTIONAL { ?tema  :tieneNombre ?temaNombre }
        OPTIONAL { ?autor :tieneNombre ?autorNombre }
      }
      LIMIT 1
    `;
    const r = await query.select(q);
    const b = r.results.bindings[0];
    if (!b) return res.status(404).json({ error: 'Proyecto no encontrado' });

    res.json({
      iri: b.iri?.value,
      nombre: b.nombre?.value,
      descripcion: b.descripcion?.value,
      fecha: b.fecha?.value,
      formato: b.formato?.value,
      licencia: b.licencia?.value,
      archivo: b.archivo?.value,
      tema: b.tema?.value,
      temaNombre: b.temaNombre?.value,
      autor: b.autor?.value,
      autorNombre: b.autorNombre?.value
    });
  } catch (error) {
    console.error('Error getProyecto:', error);
    res.status(500).json({ error: 'Error al obtener el proyecto' });
  }
};

/** POST /proyectos
 * body: { id, nombre, descripcion, fecha, formato, licencia, archivo, temaId, autorId }
 */
const createProyecto = async (req, res) => {
  try {
    const { id, nombre, descripcion, fecha, formato, licencia, archivo, temaId, autorId } = req.body;
    if (!id || !nombre || !temaId || !autorId) {
      return res.status(400).json({ error: 'id, nombre, temaId y autorId son obligatorios' });
    }
    const u = `
      ${PREFIX}
      INSERT DATA {
        :${id} rdf:type :${CLASS_PROYECTO} ;
          :tieneNombre ${lit(nombre)} ;
          :tieneDescripcion ${lit(descripcion || '')} ;
          :tieneFechaCreacion ${lit(fecha || new Date().toISOString().slice(0,10))} ;
          :tieneFormato ${lit(formato || 'otro')} ;
          :tieneLicencia ${lit(licencia || 'CC-BY')} ;
          :tieneArchivo ${lit(archivo || '')} ;
          :publicacion_Tiene_Tema :${temaId} ;
          :publicadoPor :${autorId} .
      }
    `;
    await query.update(u);
    res.status(201).json({ ok: true, id });
  } catch (error) {
    console.error('Error createProyecto:', error);
    res.status(500).json({ error: 'Error al crear el proyecto' });
  }
};

/** PUT /proyectos/:id
 * body parcial: { nombre?, descripcion?, fecha?, formato?, licencia?, archivo?, temaId?, autorId? }
 */
const updateProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, fecha, formato, licencia, archivo, temaId, autorId } = req.body;

    const del = `
      ${PREFIX}
      DELETE {
        :${id} :tieneNombre ?n ;
               :tieneDescripcion ?d ;
               :tieneFechaCreacion ?fe ;
               :tieneFormato ?fo ;
               :tieneLicencia ?li ;
               :tieneArchivo ?ar ;
               :publicacion_Tiene_Tema ?t ;
               :publicadoPor ?au .
      } WHERE {
        OPTIONAL { :${id} :tieneNombre ?n }
        OPTIONAL { :${id} :tieneDescripcion ?d }
        OPTIONAL { :${id} :tieneFechaCreacion ?fe }
        OPTIONAL { :${id} :tieneFormato ?fo }
        OPTIONAL { :${id} :tieneLicencia ?li }
        OPTIONAL { :${id} :tieneArchivo ?ar }
        OPTIONAL { :${id} :publicacion_Tiene_Tema ?t }
        OPTIONAL { :${id} :publicadoPor ?au }
      };
    `;

    const ins = [];
    if (nombre != null)      ins.push(`:tieneNombre ${lit(nombre)} ;`);
    if (descripcion != null) ins.push(`:tieneDescripcion ${lit(descripcion)} ;`);
    if (fecha != null)       ins.push(`:tieneFechaCreacion ${lit(fecha)} ;`);
    if (formato != null)     ins.push(`:tieneFormato ${lit(formato)} ;`);
    if (licencia != null)    ins.push(`:tieneLicencia ${lit(licencia)} ;`);
    if (archivo != null)     ins.push(`:tieneArchivo ${lit(archivo)} ;`);
    if (temaId != null)      ins.push(`:publicacion_Tiene_Tema :${temaId} ;`);
    if (autorId != null)     ins.push(`:publicadoPor :${autorId} ;`);

    const insUpdate = ins.length ? `
      ${PREFIX}
      INSERT { :${id} ${ins.join('\n               ')} . } WHERE {}
    ` : '';

    await query.update(del + insUpdate);
    res.json({ ok: true, id });
  } catch (error) {
    console.error('Error updateProyecto:', error);
    res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
};

/** DELETE /proyectos/:id */
const deleteProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const u = `
      ${PREFIX}
      DELETE WHERE { :${id} ?p ?o } ;
    `;
    await query.update(u);
    res.json({ ok: true, id });
  } catch (error) {
    console.error('Error deleteProyecto:', error);
    res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
};

module.exports = {
  getAllProyectos,
  getProyecto,
  createProyecto,
  updateProyecto,
  deleteProyecto
};
