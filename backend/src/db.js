// backend/db.js
const fetch = require('node-fetch');

const SPARQL_QUERY = process.env.SPARQL_QUERY;
const SPARQL_UPDATE = process.env.SPARQL_UPDATE;

if (!SPARQL_QUERY || !SPARQL_UPDATE) {
  console.warn('[SPARQL] Variables de entorno SPARQL_QUERY / SPARQL_UPDATE no definidas');
}

async function ensureOk(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`SPARQL ${res.status}: ${text}`);
  }
  return res;
}

async function sparqlSelect(query) {
  const res = await fetch(SPARQL_QUERY, {
    method: 'POST',
    headers: { 'content-type': 'application/sparql-query' },
    body: query
  }).then(ensureOk);
  return res.json(); // devuelve JSON SPARQL (bindings)
}

async function sparqlUpdate(updateQuery) {
  const res = await fetch(SPARQL_UPDATE, {
    method: 'POST',
    headers: { 'content-type': 'application/sparql-update' },
    body: updateQuery
  }).then(ensureOk);
  return true;
}

module.exports = {
  query: { // para que “se sienta” similar a pool.query(...)
    select: sparqlSelect,
    update: sparqlUpdate
  }
};
