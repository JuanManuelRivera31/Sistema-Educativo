require('dotenv').config();
const { Pool } = require('pg');

const cs = process.env.DATABASE_URL;
console.log('[PG] DATABASE_URL =', cs ? cs.replace(/:(.*?)@/, ':***@') : '(vacía)');

const pool = new Pool({ connectionString: cs });
module.exports = { pool };

