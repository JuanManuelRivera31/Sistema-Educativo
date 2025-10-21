const express = require('express');
const morgan = require('morgan');
const connectToMongo = require('./mongo');
const cors = require('cors');
const path = require('path');

// const ordeniosRoutes = require('./routes/ordenios.routes');
// const usuariosRoutes = require('./routes/usuarios.routes');
// const vacasRoutes = require('./routes/vacas.routes');
// const imagesRoutes = require('./routes/img.routes');
// const inventarioRoutes = require('./routes/inventario.routes');
// const ventasRoutes = require('./routes/ventas.routes');
// const preciosRoutes = require('./routes/precios.routes');
// const tiposEntregaRoutes = require('./routes/tiposEntrega.routes');
// const metodosPagoRoutes = require('./routes/metodoPago.routes');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Rutas
// app.use('/api/usuarios', usuariosRoutes);
// app.use('/api/ordenios', ordeniosRoutes);
// app.use('/api/vacas', vacasRoutes);
// app.use('/api/images', imagesRoutes);
// app.use('/api/inventarios', inventarioRoutes);
// app.use('/api/ventas', ventasRoutes);
// app.use('/api/precios-litro', preciosRoutes);
// app.use('/api/tipos-entrega', tiposEntregaRoutes);
// app.use('/api/metodos-pago', metodosPagoRoutes);


// // Servir imágenes
// app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// // Conexión a Mongo
// connectToMongo();

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
