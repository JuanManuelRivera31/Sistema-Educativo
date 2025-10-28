const { Router } = require('express');
// const {
//   getAllProyectos, getProyecto, createProyecto, deleteProyecto, updateProyecto
// } = require('../controllers/proyectos.controller');
const { listPublicaciones } = require('../controllers/publicaciones.controller');

const router = Router();

// router.get('/', getAllProyectos);
// router.get('/proyecto/:idProyecto', getProyecto);
// router.post('/', createProyecto);
// router.delete('/:id', deleteProyecto);
// router.put('/:id', updateProyecto);
router.get('/', listPublicaciones);

module.exports = router;

