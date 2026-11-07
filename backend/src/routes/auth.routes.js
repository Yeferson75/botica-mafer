const router = require('express').Router();
const { login } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth');

router.post('/login', login);

// Ruta para comprobar quién está logueado
router.get('/me', verificarToken, (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;