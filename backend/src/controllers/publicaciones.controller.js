const { query } = require('../db');
const GRAPH_DATA = process.env.GRAPH_DATA || '';

const inGraph = (body) => GRAPH_DATA ? `GRAPH <${GRAPH_DATA}> { ${body} }` : body;

function buildWhere(qText) {
  const qFilter = qText ? `
    BIND(LCASE("${qText}") AS ?__q)
    FILTER(
      CONTAINS(LCASE(STR(COALESCE(?nombre,""))), ?__q) ||
      CONTAINS(LCASE(STR(COALESCE(?autorNombre,""))), ?__q) ||
      CONTAINS(LCASE(STR(COALESCE(?temaNombre,""))), ?__q) ||
      CONTAINS(LCASE(STR(COALESCE(?descripcion,""))), ?__q)
    )
  ` : '';

  return `
  { SELECT ?C WHERE {
      ?C a <http://www.w3.org/2002/07/owl#Class> .
      BIND(REPLACE(STR(?C), "^.*(#|/)", "") AS ?local)
      FILTER(LCASE(?local) = "publicaciontacita")
    } LIMIT 1
  }
  ${inGraph(`
    ?p a ?C .
    OPTIONAL {
      ?p ?np ?nombre .
      FILTER(isLiteral(?nombre))
      FILTER(LCASE(REPLACE(STR(?np),"^.*(#|/)","")) IN ("tienenombre","nombre","label","titulo","name"))
    }
    OPTIONAL {
      ?p ?dp ?descripcion .
      FILTER(isLiteral(?descripcion))
      FILTER(LCASE(REPLACE(STR(?dp),"^.*(#|/)","")) IN ("tienedescripcion","descripcion","description","resumen"))
    }
    OPTIONAL {
      ?p ?fpRaw ?fecha .
      FILTER(isLiteral(?fecha))
      FILTER(LCASE(REPLACE(STR(?fpRaw),"^.*(#|/)","")) IN ("tienefecha","tienefechacreacion","fecha","fechacreacion"))
    }
    OPTIONAL {
      ?p ?formp ?formato .
      FILTER(isLiteral(?formato))
      FILTER(LCASE(REPLACE(STR(?formp),"^.*(#|/)","")) IN ("tieneformato","formato"))
    }
    OPTIONAL {
      ?p ?licp ?licencia .
      FILTER(isLiteral(?licencia))
      FILTER(LCASE(REPLACE(STR(?licp),"^.*(#|/)","")) IN ("tienelicencia","licencia"))
    }
    OPTIONAL {
      ?p ?authPred ?autor .
      FILTER(LCASE(REPLACE(STR(?authPred),"^.*(#|/)","")) IN ("publicadopor","autor","tieneautor"))
      OPTIONAL {
        ?autor ?anp ?autorNombre .
        FILTER(isLiteral(?autorNombre))
        FILTER(LCASE(REPLACE(STR(?anp),"^.*(#|/)","")) IN ("tienenombre","nombre","label"))
      }
    }
    OPTIONAL {
      ?p ?temaPred ?tema .
      FILTER(LCASE(REPLACE(STR(?temaPred),"^.*(#|/)","")) IN ("publicaciontienetema","tienetema","tema"))
      OPTIONAL {
        ?tema ?tnp ?temaNombre .
        FILTER(isLiteral(?temaNombre))
        FILTER(LCASE(REPLACE(STR(?tnp),"^.*(#|/)","")) IN ("tienenombre","nombre","label"))
      }
    }
    ${qFilter}
  `)}
  BIND(REPLACE(STR(?p), "^.*(#|/)", "") AS ?id)
  `;
}

function buildSelect(where, order, offset, limit) {
  return `
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  SELECT ?p ?id ?nombre ?descripcion ?fecha ?fechaNorm ?formato ?licencia ?autorNombre ?temaNombre
  WHERE {
    ${where}
    # Normaliza fecha para ordenar de forma segura
    BIND(SUBSTR(STR(?fecha), 1, 10) AS ?ymd)
    BIND(
      IF(
        BOUND(?fecha) && REGEX(?ymd, "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"),
        xsd:date(?ymd),
        xsd:date("1900-01-01")
      ) AS ?fechaNorm
    )
  }
  ${order}
  OFFSET ${offset}
  LIMIT ${limit}
  `;
}

function buildCount(where) {
  // No usa xsd ni fechaNorm: solo cuenta ?p
  return `
  SELECT (COUNT(DISTINCT ?p) AS ?total)
  WHERE { ${where} }
  `;
}

exports.listPublicaciones = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || '20', 10)));
    const qText = (req.query.q || '').trim();
    const sort = (req.query.sort || 'fecha_desc').toLowerCase();

    const where = buildWhere(qText);

    let order = 'ORDER BY DESC(?fechaNorm)'; // recientes primero
    if (sort === 'fecha_asc') order = 'ORDER BY ?fechaNorm';
    if (sort === 'titulo_asc') order = 'ORDER BY LCASE(STR(COALESCE(?nombre, ?id)))';
    if (sort === 'titulo_desc') order = 'ORDER BY DESC(LCASE(STR(COALESCE(?nombre, ?id))))';

    const offset = (page - 1) * pageSize;

    const [countRes, pageRes] = await Promise.all([
      query.select(buildCount(where)),
      query.select(buildSelect(where, order, offset, pageSize))
    ]);

    const total = parseInt(countRes.results.bindings[0]?.total?.value || '0', 10);

    const items = (pageRes.results.bindings || []).map(b => ({
      iri:         b.p?.value,
      id:          b.id?.value,
      nombre:      b.nombre?.value || null,
      descripcion: b.descripcion?.value || null,
      fecha:       b.fecha?.value || null,
      fechaNorm:   b.fechaNorm?.value || null,
      formato:     b.formato?.value || null,
      licencia:    b.licencia?.value || null,
      autorNombre: b.autorNombre?.value || null,
      temaNombre:  b.temaNombre?.value || null,
    }));

    res.json({ items, total, page, pageSize });
  } catch (e) {
    console.error('listPublicaciones(paged):', e);
    res.status(500).json({ error: 'Fallo listando publicaciones' });
  }
};


function esc(str='') {
  return String(str).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
}
function ensureHash(ns) { return !ns ? 'http://example.org/educa#' : ( /[#/]$/.test(ns) ? ns : ns + '#' ); }
function isAbsIri(v='') { return /^https?:\/\/[^\s]+$/i.test(v); }
function normDate(d='') {
  // acepta "YYYY-MM-DD" o "DD/MM/YYYY" y devuelve "YYYY-MM-DD" o "" si no válida
  if (!d) return '';
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(d);
  if (iso) return d;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return '';
}
exports.createPublicacion = async (req, res) => {
  try {
    const {
      nombre, descripcion, fecha, formato, licencia,
      archivoUrl: archivoUrlBody, autorIri, temaIri
    } = req.body || {};

    if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

    const ONTO_BASE  = ensureHash(process.env.ONTO_BASE || 'http://example.org/educa#');
    const GRAPH_DATA = process.env.GRAPH_DATA || '';
    const RESOURCE_BASE = process.env.RESOURCE_BASE || 'http://localhost/resource/';
    const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:4000';

    // Archivo subido / URL
    let archivoUrl = (archivoUrlBody || '').trim();
    let archivoMime = '';
    let archivoSize = '';
    let archivoNombre = '';

    if (req.file) {
      const publicPath = `/uploads/${req.file.filename}`;
      archivoUrl = `${PUBLIC_BASE_URL}${publicPath}`;
      archivoMime = req.file.mimetype || '';
      archivoNombre = req.file.originalname || req.file.filename;
      const fullPath = path.join(UPLOAD_DIR, req.file.filename);
      const meta = await fileMeta(fullPath);
      archivoSize = String(meta.size);
    }

    // Normalizar fecha
    const fechaNorm = normDate(fecha);

    // IRIs válidos solo si son absolutos http(s)
    const autorIriOk = isAbsIri(autorIri) ? autorIri : '';
    const temaIriOk  = isAbsIri(temaIri)  ? temaIri  : '';

    // Mint IRI
    const subj = `${RESOURCE_BASE}PublicacionTacita_${Date.now()}`;

    const parts = [];
    parts.push(`<${subj}> a <${ONTO_BASE}PublicacionTacita>`);
    parts.push(`;<${ONTO_BASE}tieneNombre> "${esc(nombre)}"`);

    if (descripcion) parts.push(`;<${ONTO_BASE}tieneDescripcion> "${esc(descripcion)}"`);
    if (fechaNorm)   parts.push(`;<${ONTO_BASE}tieneFechaCreacion> "${esc(fechaNorm)}"^^<http://www.w3.org/2001/XMLSchema#date>`);
    if (formato)     parts.push(`;<${ONTO_BASE}tieneFormato> "${esc(String(formato).toLowerCase())}"`);
    if (licencia)    parts.push(`;<${ONTO_BASE}tieneLicencia> "${esc(licencia)}"`);

    if (archivoUrl)  parts.push(`;<${ONTO_BASE}tieneArchivo> "${esc(archivoUrl)}"`);
    if (archivoMime) parts.push(`;<${ONTO_BASE}mimeType> "${esc(archivoMime)}"`);
    if (archivoSize) parts.push(`;<${ONTO_BASE}tamanoBytes> "${esc(archivoSize)}"^^<http://www.w3.org/2001/XMLSchema#integer>`);
    if (archivoNombre) parts.push(`;<${ONTO_BASE}nombreArchivo> "${esc(archivoNombre)}"`);

    if (autorIriOk)  parts.push(`;<${ONTO_BASE}publicadoPor> <${autorIriOk}>`);
    if (temaIriOk)   parts.push(`;<${ONTO_BASE}publicacionTieneTema> <${temaIriOk}>`);

    parts.push('.');

    const body = parts.join('\n  ');
    const update = `
      INSERT DATA {
        ${GRAPH_DATA ? `GRAPH <${GRAPH_DATA}> {` : ''}
          ${body}
        ${GRAPH_DATA ? `}` : ''}
      }
    `;

    if (process.env.NODE_ENV !== 'production') {
      console.log('\n[SPARQL UPDATE PREVIEW]\n', update, '\n');
    }

    await query.update(update);

    res.status(201).json({
      iri: subj,
      nombre, descripcion, fecha: fechaNorm || fecha,
      formato: String(formato || '').toLowerCase(),
      licencia, archivoUrl, archivoMime, archivoSize, archivoNombre,
      autorIri: autorIriOk, temaIri: temaIriOk
    });
  } catch (e) {
    console.error('createPublicacion:', e);
    res.status(500).json({ error: 'No fue posible crear la publicación' });
  }
};