const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mime = require('mime-types');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

// asegúrate de que exista
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = mime.extension(file.mimetype) || path.extname(file.originalname).replace('.', '') || 'bin';
    const safeBase = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9-_]+/gi, '_')
      .slice(0, 60);
    const stamp = Date.now();
    cb(null, `${safeBase || 'file'}_${stamp}.${ext}`);
  }
});

// límites y filtro básicos (ajusta a tu gusto)
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    // permitir cualquier mimetype común; si quieres restringir, valida aquí
    if (!file.mimetype) return cb(new Error('Tipo MIME inválido'));
    cb(null, true);
  }
});

async function fileMeta(fullPath) {
  const stat = fs.statSync(fullPath);
  const buf = fs.readFileSync(fullPath);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  return { size: stat.size, sha256 };
}

module.exports = { upload, fileMeta, UPLOAD_DIR };
