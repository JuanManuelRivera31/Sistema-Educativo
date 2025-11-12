const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db.pg');
const jwt = require('jsonwebtoken');

const router = express.Router();
const DEBUG = process.env.DEBUG_AUTH === '1';

function signToken(user, roles = []) {
  return jwt.sign(
    { sub: user.id, correo: user.correo || user.email, roles },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: process.env.JWT_EXPIRES || '8h' }
  );
}

// ---------- HELPERS ----------
async function findUserAny(correoOEmail) {
  // 1) Tabla "usuarios" (correo/hash)
  const q1 = `
    SELECT id, correo, nombre, hash AS password_hash, 'usuarios' AS source
    FROM usuarios
    WHERE correo = $1
    LIMIT 1
  `;
  try {
    const r1 = await pool.query(q1, [correoOEmail]);
    if (r1.rowCount > 0) return r1.rows[0];
  } catch {}

  // 2) Tabla "app_user" (email/password_hash/full_name)
  const q2 = `
    SELECT id, email AS correo, full_name AS nombre, password_hash, 'app_user' AS source
    FROM app_user
    WHERE email = $1
    LIMIT 1
  `;
  try {
    const r2 = await pool.query(q2, [correoOEmail]);
    if (r2.rowCount > 0) return r2.rows[0];
  } catch {}

  return null;
}

async function findRolesAny(userId, source) {
  // Si tienes tabla usuario_rol/roles para "usuarios"
  if (source === 'usuarios') {
    try {
      const r = await pool.query(
        `SELECT r.nombre
           FROM roles r
           JOIN usuario_rol ur ON ur.rol_id = r.id
          WHERE ur.usuario_id = $1`,
        [userId]
      );
      if (r.rowCount > 0) return r.rows.map(x => x.nombre);
    } catch {}
  }

  // Si usas array roles en "app_user"
  if (source === 'app_user') {
    try {
      const r = await pool.query(
        `SELECT roles FROM app_user WHERE id = $1`,
        [userId]
      );
      if (r.rowCount > 0 && Array.isArray(r.rows[0].roles)) {
        return r.rows[0].roles;
      }
    } catch {}
  }

  return ['user'];
}

// ---------- RUTAS ----------
router.post('/login', async (req, res) => {
  try {
    // Normaliza entrada
    const correo = (req.body?.correo ?? req.body?.email ?? '').toString().trim().toLowerCase();
    const contrasena =
      (req.body?.contrasenausuario ??
       req.body?.contrasenaUsuario ??
       req.body?.password ?? '').toString();

    if (DEBUG) console.log('LOGIN BODY (norm):', { correo, contrasena_len: contrasena.length });

    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Faltan credenciales' });
    }

    const user = await findUserAny(correo);
    if (DEBUG) console.log('USER ENCONTRADO:', user?.correo, 'source:', user?.source);

    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    // Comparación bcrypt + logs
    const ok = await bcrypt.compare(contrasena, user.password_hash || '');
    if (DEBUG) {
      console.log('COMPARE:', {
        ok,
        hash_len: (user.password_hash || '').length,
        starts_with: (user.password_hash || '').slice(0, 7)
      });
    }

    // Fallback de depuración SOLO con DEBUG_AUTH=1 para demo/admin y clave 123456
    if (!ok && DEBUG && (correo === 'demo@demo.com' || correo === 'admin@educo.com') && contrasena === '123456') {
      console.log('[DEBUG] Forzando ok para demo/admin con 123456 (sólo depuración)');
    } else if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const roles = await findRolesAny(user.id, user.source);
    const token = signToken(user, roles);

    res.json({
      usuario: { id: user.id, correo: user.correo, nombre: user.nombre || null },
      roles,
      token
    });
  } catch (e) {
    console.error('login:', e);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


// (Opcional) Registro usando tabla "usuarios"
router.post('/register', async (req, res) => {
  try {
    const correo = (req.body?.correo || req.body?.email || '').trim();
    const nombre = (req.body?.nombre || req.body?.fullName || '').trim();
    const password = req.body?.contrasenausuario || req.body?.contrasenaUsuario || req.body?.password;

    if (!correo || !password || !nombre) {
      return res.status(400).json({ message: 'Faltan campos' });
    }
    const hash = await bcrypt.hash(password, 10);

    const ins = `
      INSERT INTO usuarios (correo, nombre, hash)
      VALUES ($1,$2,$3)
      RETURNING id, correo, nombre
    `;
    const { rows } = await pool.query(ins, [correo, nombre, hash]);
    const u = rows[0];

    const token = signToken({ id: u.id, correo: u.correo }, ['user']);
    res.status(201).json({ usuario: u, roles: ['user'], token });
  } catch (e) {
    if (String(e.message).toLowerCase().includes('unique')) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }
    console.error('register:', e);
    res.status(500).json({ message: 'Error registrando' });
  }
});

// ---------- DEV (quítalas en prod) ----------
router.get('/dev/users', async (_req, res) => {
  try {
    const a = await pool.query('SELECT id, correo, nombre, length(hash) AS len FROM usuarios ORDER BY id ASC');
    const b = await pool.query('SELECT id, email AS correo, full_name AS nombre, length(password_hash) AS len FROM app_user ORDER BY id ASC');
    res.json({ usuarios: a.rows, app_user: b.rows });
  } catch (e) {
    res.status(500).json({ message: 'Error listando usuarios' });
  }
});

module.exports = router;
