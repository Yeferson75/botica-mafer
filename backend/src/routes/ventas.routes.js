const router = require('express').Router();
const ctrl = require('../controllers/ventas.controller');
const { verificarToken } = require('../middlewares/auth');

router.use(verificarToken);

router.post('/', ctrl.registrar);
router.get('/resumen', ctrl.resumen);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

module.exports = router;
