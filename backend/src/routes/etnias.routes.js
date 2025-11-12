const { Router } = require('express');
const { listEtnias } = require('../controllers/etnias.controller');

const router = Router();

// GET /api/etnias?page=1&pageSize=20&sort=nombre_asc&q=
router.get('/', listEtnias);

module.exports = router;
