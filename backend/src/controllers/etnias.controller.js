const { query } = require('../db');

const inGraph = (body) => {
  const GRAPH_DATA = process.env.GRAPH_DATA || '';
  return GRAPH_DATA ? `GRAPH <${GRAPH_DATA}> { ${body} }` : body;
};

function buildWhere(qText) {
  const qFilter = qText ? `
    BIND(LCASE("${qText}") AS ?__q)
    FILTER(
      CONTAINS(LCASE(STR(COALESCE(?nombre,""))), ?__q) ||
      CONTAINS(LCASE(STR(COALESCE(?descripcion,""))), ?__q) ||
      CONTAINS(LCASE(STR(COALESCE(?idioma,""))), ?__q) ||
      CONTAINS(LCASE(STR(COALESCE(?region,""))), ?__q) ||
      CONTAINS(LCASE(STR(COALESCE(?pais,""))), ?__q)
    )
  ` : '';

  return `
  { SELECT ?C WHERE {
      ?C a <http://www.w3.org/2002/07/owl#Class> .
      BIND(LCASE(REPLACE(STR(?C), "^.*(#|/)", "")) AS ?local)
      FILTER(?local IN ("etnia","etnias","grupoetnico","grupoétnico"))
    } LIMIT 1 }

  ${inGraph(`
    ?e a ?C .

    OPTIONAL {
      ?e ?np ?nombre .
      FILTER(isLiteral(?nombre))
      FILTER(LCASE(REPLACE(STR(?np),"^.*(#|/)","")) IN ("tienenombre","nombre","label","titulo","name"))
    }

    OPTIONAL {
      ?e ?dp ?descripcion .
      FILTER(isLiteral(?descripcion))
      FILTER(LCASE(REPLACE(STR(?dp),"^.*(#|/)","")) IN ("tienedescripcion","descripcion","description","resumen"))
    }

    OPTIONAL {
      ?e ?ip ?idioma .
      FILTER(isLiteral(?idioma))
      FILTER(LCASE(REPLACE(STR(?ip),"^.*(#|/)","")) IN ("tieneidioma","idioma","lengua"))
    }

    OPTIONAL {
      ?e ?rp ?region .
      FILTER(isLiteral(?region))
      FILTER(LCASE(REPLACE(STR(?rp),"^.*(#|/)","")) IN ("tieneregion","region","zona","area"))
    }

    OPTIONAL {
      ?e ?pp ?pais .
      FILTER(isLiteral(?pais))
      FILTER(LCASE(REPLACE(STR(?pp),"^.*(#|/)","")) IN ("tienepais","pais"))
    }

    ${qFilter}
  `)}

  BIND(REPLACE(STR(?e), "^.*(#|/)", "") AS ?id)
  `;
}

function buildSelect(where, order, offset, limit) {
  return `
  SELECT ?e ?id ?nombre ?descripcion ?idioma ?region ?pais
  WHERE {
    ${where}
  }
  ${order}
  OFFSET ${offset}
  LIMIT ${limit}
  `;
}

function buildCount(where) {
  return `
  SELECT (COUNT(DISTINCT ?e) AS ?total)
  WHERE { ${where} }
  `;
}

exports.listEtnias = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || '20', 10)));
    const qText = (req.query.q || '').trim();
    const sort = (req.query.sort || 'nombre_asc').toLowerCase();

    const where = buildWhere(qText);

    let order = 'ORDER BY LCASE(STR(COALESCE(?nombre, ?id)))';
    if (sort === 'nombre_desc') order = 'ORDER BY DESC(LCASE(STR(COALESCE(?nombre, ?id))))';

    const offset = (page - 1) * pageSize;

    const [countRes, pageRes] = await Promise.all([
      query.select(buildCount(where)),
      query.select(buildSelect(where, order, offset, pageSize))
    ]);

    const total = parseInt(countRes.results.bindings?.[0]?.total?.value || '0', 10);

    const items = (pageRes.results.bindings || []).map(b => ({
      iri:         b.e?.value,
      id:          b.id?.value,
      nombre:      b.nombre?.value || null,
      descripcion: b.descripcion?.value || null,
      idioma:      b.idioma?.value || null,
      region:      b.region?.value || null,
      pais:        b.pais?.value || null,
    }));

    res.json({ items, total, page, pageSize });
  } catch (e) {
    console.error('listEtnias:', e);
    res.status(500).json({ error: 'Fallo listando etnias' });
  }
};
