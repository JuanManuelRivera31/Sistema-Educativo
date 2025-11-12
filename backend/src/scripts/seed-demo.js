// backend/scripts/seed-demo.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const cs = process.env.DATABASE_URL;
    if (!cs) {
      console.error('Falta DATABASE_URL en .env');
      process.exit(1);
    }
    const pool = new Pool({ connectionString: cs });

    const ddl = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      correo TEXT UNIQUE NOT NULL,
      nombre TEXT,
      hash TEXT NOT NULL,
      creado_en TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      nombre TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS usuario_rol (
      usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
      rol_id INT REFERENCES roles(id) ON DELETE CASCADE,
      PRIMARY KEY (usuario_id, rol_id)
    );
    INSERT INTO roles(nombre) VALUES ('admin') ON CONFLICT (nombre) DO NOTHING;
    INSERT INTO roles(nombre) VALUES ('user')  ON CONFLICT (nombre) DO NOTHING;
    `;
    await pool.query(ddl);

    const email = 'demo@demo.com';
    const pass  = '123456';
    const hash = await bcrypt.hash(pass, 10);

    const upsertUser = `
      INSERT INTO usuarios (correo, nombre, hash)
      VALUES ($1,$2,$3)
      ON CONFLICT (correo) DO UPDATE SET nombre=EXCLUDED.nombre
      RETURNING id, correo;
    `;
    const { rows } = await pool.query(upsertUser, [email, 'Usuario Demo', hash]);
    const uid = rows[0].id;

    const giveRoles = `
      INSERT INTO usuario_rol (usuario_id, rol_id)
      SELECT $1, r.id FROM roles r WHERE r.nombre IN ('admin','user')
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(giveRoles, [uid]);

    console.log('✔ Seed OK. Usuario:', email, 'clave:', pass);
    await pool.end();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
