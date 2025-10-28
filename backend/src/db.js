// backend/src/db.js
const SPARQL_QUERY  = process.env.SPARQL_QUERY;
const SPARQL_UPDATE = process.env.SPARQL_UPDATE;

if (!SPARQL_QUERY || !SPARQL_UPDATE) {
  console.warn('[SPARQL] Falta SPARQL_QUERY / SPARQL_UPDATE en .env');
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
  return res.json();
}

async function sparqlUpdate(updateQuery) {
  await fetch(SPARQL_UPDATE, {
    method: 'POST',
    headers: { 'content-type': 'application/sparql-update' },
    body: updateQuery
  }).then(ensureOk);
  return true;
}

module.exports = {
  query: { select: sparqlSelect, update: sparqlUpdate }
};
