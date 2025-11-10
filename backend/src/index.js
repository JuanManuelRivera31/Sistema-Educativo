require('dotenv').config(); 
const express = require('express');

const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Carpeta pública para archivos
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// Rutas
app.use('/api/publicaciones', require('./routes/publicaciones.routes'));
app.use('/api/proyectos', require('./routes/publicaciones.routes'));

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
