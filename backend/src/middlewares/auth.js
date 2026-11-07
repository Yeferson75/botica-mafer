const supabase = require('../config/supabase');

// Verifica que el token sea válido y carga el usuario en req.usuario
exports.verificarToken = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', data.user.id)
    .single();

  if (!perfil) {
    return res.status(403).json({ error: 'Usuario sin perfil' });
  }

  req.usuario = { id: data.user.id, email: data.user.email, ...perfil };
  next();
};

// Restringe una ruta a ciertos roles: soloRoles('admin')
exports.soloRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'No tienes permisos para esta acción' });
  }
  next();
};