const router = require('express').Router();
const ctrl = require('../controllers/productos.controller');
const { verificarToken, soloRoles } = require('../middlewares/auth');

// Todas las rutas requieren estar logueado
router.use(verificarToken);

// Admin y vendedor pueden consultar
router.get('/categorias/todas', ctrl.categorias);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

// Solo admin puede modificar
router.post('/', soloRoles('admin'), ctrl.crear);
router.put('/:id', soloRoles('admin'), ctrl.actualizar);
router.delete('/:id', soloRoles('admin'), ctrl.desactivar);

module.exports = router;