const router = require('express').Router();
const ctrl = require('../controllers/alertas.controller');
const { verificarToken } = require('../middlewares/auth');

router.use(verificarToken);

router.get('/', ctrl.listar);

module.exports = router;