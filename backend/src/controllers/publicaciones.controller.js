// src/controllers/publicaciones.controller.js
const { query } = require('../db');
const GRAPH_DATA = process.env.GRAPH_DATA || ''; // deja vacío si cargaste al "default"

const inGraph = (body) => GRAPH_DATA ? `GRAPH <${GRAPH_DATA}> { ${body} }` : body;

const Q = (body) => `
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
SELECT ?p ?id ?nombre ?desc ?fecha ?formato ?licencia ?autorNombre ?temaNombre
WHERE {
  { SELECT ?C WHERE {
      ?C a owl:Class .
      BIND( REPLACE(STR(?C), "^.*(#|/)", "") AS ?local )
      FILTER( LCASE(?local) = "publicaciontacita" )
    } LIMIT 1
  }
  ${inGraph(`
    ?p a ?C .
    OPTIONAL {
      ?p ?namePred ?nombre .
      FILTER( isLiteral(?nombre) )
      BIND( REPLACE(STR(?namePred), "^.*(#|/)", "") AS ?nameLN )
      FILTER( LCASE(?nameLN) IN ("tienenombre","nombre","label","titulo","name") )
    }
    OPTIONAL {
      ?p ?dPred ?desc .
      FILTER( isLiteral(?desc) )
      BIND( REPLACE(STR(?dPred), "^.*(#|/)", "") AS ?dLN )
      FILTER( LCASE(?dLN) IN ("tienedescripcion","descripcion","description","resumen") )
    }
    OPTIONAL {
      ?p ?fPred ?fecha .
      FILTER( isLiteral(?fecha) )
      BIND( REPLACE(STR(?fPred), "^.*(#|/)", "") AS ?fLN )
      FILTER( LCASE(?fLN) IN ("tienefecha","tienefechacreacion","fecha","fechacreacion") )
    }
    OPTIONAL {
      ?p ?formPred ?formato .
      FILTER( isLiteral(?formato) )
      BIND( REPLACE(STR(?formPred), "^.*(#|/)", "") AS ?formLN )
      FILTER( LCASE(?formLN) IN ("tieneformato","formato") )
    }
    OPTIONAL {
      ?p ?licPred ?licencia .
      FILTER( isLiteral(?licencia) )
      BIND( REPLACE(STR(?licPred), "^.*(#|/)", "") AS ?licLN )
      FILTER( LCASE(?licLN) IN ("tienelicencia","licencia") )
    }
    OPTIONAL {
      ?p ?authPred ?au .
      BIND( REPLACE(STR(?authPred), "^.*(#|/)", "") AS ?authLN )
      FILTER( LCASE(?authLN) IN ("publicadopor","autor","tieneautor") )
      OPTIONAL {
        ?au ?anp ?autorNombre .
        FILTER( isLiteral(?autorNombre) )
        BIND( REPLACE(STR(?anp), "^.*(#|/)", "") AS ?anl )
        FILTER( LCASE(?anl) IN ("tienenombre","nombre","label") )
      }
    }
    OPTIONAL {
      ?p ?temaPred ?tema .
      BIND( REPLACE(STR(?temaPred), "^.*(#|/)", "") AS ?temaLN )
      FILTER( LCASE(?temaLN) IN ("publicaciontienetema","tienetema","tema") )
      OPTIONAL {
        ?tema ?tnp ?temaNombre .
        FILTER( isLiteral(?temaNombre) )
        BIND( REPLACE(STR(?tnp), "^.*(#|/)", "") AS ?tnl )
        FILTER( LCASE(?tnl) IN ("tienenombre","nombre","label") )
      }
    }
  `)}
  BIND( REPLACE(STR(?p), "^.*(#|/)", "") AS ?id )
}
ORDER BY LCASE(STR(COALESCE(?nombre, ?id)))
`;

async function listPublicaciones(req, res) {
  try {
    const r = await query.select(Q(''));
    const rows = r.results.bindings.map(b => ({
      iri:          b.p?.value,
      id:           b.id?.value,
      nombre:       b.nombre?.value || null,
      descripcion:  b.desc?.value || null,
      fecha:        b.fecha?.value || null,
      formato:      b.formato?.value || null,
      licencia:     b.licencia?.value || null,
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
