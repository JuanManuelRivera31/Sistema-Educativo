// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

function signToken(user, roles = []) {
  return jwt.sign(
    { sub: user.id, correo: user.correo, roles },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: process.env.JWT_EXPIRES || '8h' }
  );
}

function authRequired(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

function hasRole(...roles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    if (roles.some(r => userRoles.includes(r))) return next();
    return res.status(403).json({ error: 'Sin permisos' });
  };
}

module.exports = { signToken, authRequired, hasRole };
