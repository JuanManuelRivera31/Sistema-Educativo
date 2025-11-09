// src/controllers/publicaciones.controller.js
const { query } = require('../db');
const GRAPH_DATA = process.env.GRAPH_DATA || '';
const inGraph = (body) => GRAPH_DATA ? `GRAPH <${GRAPH_DATA}> { ${body} }` : body;

const Q = () => `
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>

SELECT ?p ?id ?nombre ?desc ?fecha ?formato ?licencia ?autorNombre ?temaNombre ?archivo
WHERE {
  { SELECT ?C WHERE {
      ?C a owl:Class .
      BIND( REPLACE(STR(?C), "^.*(#|/)", "") AS ?local )
      FILTER( LCASE(?local) = "publicaciontacita" )
    } LIMIT 1
  }
  ${inGraph(`
    ?p a ?C .

    # nombre (varios nombres posibles)
    OPTIONAL {
      ?p ?np ?nombre .
      FILTER(isLiteral(?nombre))
      BIND(REPLACE(STR(?np), "^.*(#|/)", "") AS ?nln)
      FILTER(LCASE(?nln) IN ("tienenombre","nombre","label","titulo","name"))
    }

    OPTIONAL { ?p ?dp ?desc .
      FILTER(isLiteral(?desc))
      BIND(REPLACE(STR(?dp), "^.*(#|/)", "") AS ?dln)
      FILTER(LCASE(?dln) IN ("tienedescripcion","descripcion","description","resumen"))
    }

    OPTIONAL { ?p ?fp ?fecha .
      FILTER(isLiteral(?fecha))
      BIND(REPLACE(STR(?fp), "^.*(#|/)", "") AS ?fln)
      FILTER(LCASE(?fln) IN ("tienefecha","tienefechacreacion","fecha","fechacreacion"))
    }

    OPTIONAL { ?p ?formp ?formato .
      FILTER(isLiteral(?formato))
      BIND(REPLACE(STR(?formp), "^.*(#|/)", "") AS ?formln)
      FILTER(LCASE(?formln) IN ("tieneformato","formato"))
    }

    OPTIONAL { ?p ?licp ?licencia .
      FILTER(isLiteral(?licencia))
      BIND(REPLACE(STR(?licp), "^.*(#|/)", "") AS ?licln)
      FILTER(LCASE(?licln) IN ("tienelicencia","licencia"))
    }

    # archivo / url del recurso
    OPTIONAL { ?p ?ap ?archivo .
      FILTER(isLiteral(?archivo))
      BIND(REPLACE(STR(?ap), "^.*(#|/)", "") AS ?aln)
      FILTER(LCASE(?aln) IN ("tienearchivo","archivo","url","enlace","ruta","path"))
    }

    OPTIONAL {
      ?p ?authPred ?au .
      BIND(REPLACE(STR(?authPred), "^.*(#|/)", "") AS ?authLN)
      FILTER(LCASE(?authLN) IN ("publicadopor","autor","tieneautor"))
      OPTIONAL {
        ?au ?anp ?autorNombre .
        FILTER(isLiteral(?autorNombre))
        BIND(REPLACE(STR(?anp), "^.*(#|/)", "") AS ?anl)
        FILTER(LCASE(?anl) IN ("tienenombre","nombre","label"))
      }
    }

    OPTIONAL {
      ?p ?temaPred ?tema .
      BIND(REPLACE(STR(?temaPred), "^.*(#|/)", "") AS ?temaLN)
      FILTER(LCASE(?temaLN) IN ("publicaciontienetema","tienetema","tema"))
      OPTIONAL {
        ?tema ?tnp ?temaNombre .
        FILTER(isLiteral(?temaNombre))
        BIND(REPLACE(STR(?tnp), "^.*(#|/)", "") AS ?tnl)
        FILTER(LCASE(?tnl) IN ("tienenombre","nombre","label"))
      }
    }
  `)}
  BIND(REPLACE(STR(?p), "^.*(#|/)", "") AS ?id)
}
ORDER BY LCASE(STR(COALESCE(?nombre, ?id)))
`;

async function listPublicaciones(req, res) {
  try {
    const r = await query.select(Q());
    const rows = r.results.bindings.map(b => ({
      iri:          b.p?.value,
      id:           b.id?.value,
      nombre:       b.nombre?.value || null,
      descripcion:  b.desc?.value || null,
      fecha:        b.fecha?.value || null,
      formato:      (b.formato?.value || '').toLowerCase(),
      licencia:     b.licencia?.value || null,
      archivoUrl:   b.archivo?.value || null,     // ← NUEVO
      autorNombre:  b.autorNombre?.value || null,
      temaNombre:   b.temaNombre?.value || null,
    }));
    res.json(rows);
  } catch (e) {
    console.error('listPublicaciones:', e);
    res.status(500).json({ error: 'Fallo listando publicaciones' });
  }
}

module.exports = { listPublicaciones };
