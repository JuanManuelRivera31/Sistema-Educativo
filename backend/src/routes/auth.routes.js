const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../db.pg');
const { signToken, authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body || {};
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Faltan campos' });
    }
    const hash = await bcrypt.hash(password, 10);
    const q = `
      INSERT INTO app_user(email, password_hash, full_name)
      VALUES ($1,$2,$3)
      RETURNING id, email, full_name AS "fullName", roles
    `;
    const { rows } = await pool.query(q, [email, hash, fullName]);
    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (e) {
    if (String(e.message).includes('unique')) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }
    console.error(e);
    res.status(500).json({ error: 'Error registrando' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, full_name AS "fullName", roles FROM app_user WHERE email=$1',
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    delete user.password_hash;
    const token = signToken(user);
    res.json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error login' });
  }
});

// GET /api/auth/me
router.get('/me', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, full_name AS "fullName", roles FROM app_user WHERE id=$1',
    [req.user.sub]
  );
  res.json({ user: rows[0] || null });
});

module.exports = router;
