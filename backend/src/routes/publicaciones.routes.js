const { Router } = require('express');
// const {
//   getAllProyectos, getProyecto, createProyecto, deleteProyecto, updateProyecto
// } = require('../controllers/proyectos.controller');
const { listPublicaciones, createPublicacion } = require('../controllers/publicaciones.controller');
const { upload } = require('../utils/upload');

const router = Router();

router.get('/', listPublicaciones);
router.post('/', upload.single('archivo'), createPublicacion);

module.exports = router;

