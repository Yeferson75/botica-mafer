const supabase = require('../config/supabase');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', data.user.id)
    .single();

  if (!perfil) {
    return res.status(403).json({ error: 'El usuario no tiene perfil asignado' });
  }

  res.json({
    token: data.session.access_token,
    usuario: { id: data.user.id, email: data.user.email, ...perfil }
  });
};