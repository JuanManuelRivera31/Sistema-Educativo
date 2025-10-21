const { Router } = require('express');
const { getAllProyectos, getProyecto, getSesionesOrdenio, createProyecto, deleteProyecto, updateProyecto } = require('../controllers/ordenios.controller');

const router = Router();

// Usa rutas más limpias
router.get('/', getAllProyectos);
router.get('/proyecto/:idProyecto', getProyecto);
router.post('/', createProyecto);
router.delete('/:id', deleteProyecto); 
router.put('/:id', updateProyecto);    

module.exports = router;
