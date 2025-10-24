const { Router } = require('express');
const {
  getAllProyectos, getProyecto, createProyecto, deleteProyecto, updateProyecto
} = require('../controllers/proyectos.controller');

const router = Router();

router.get('/', getAllProyectos);
router.get('/proyecto/:idProyecto', getProyecto);
router.post('/', createProyecto);
router.delete('/:id', deleteProyecto);
router.put('/:id', updateProyecto);

module.exports = router;

