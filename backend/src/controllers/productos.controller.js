const supabase = require('../config/supabase');

exports.listar = async (req, res) => {
  const { buscar, categoria } = req.query;

  // Diagnóstico temporal
  const todos = await supabase.from('productos').select('id, activo');
  console.log('Clave empieza con:', (process.env.SUPABASE_KEY || 'VACIA').slice(0, 10));
  console.log('Total filas visibles:', todos.data?.length, '| error:', todos.error?.message);
  console.log('Filas activas:', todos.data?.filter(p => p.activo).length);

  let query = supabase
    .from('productos')
    .select('*, categorias(nombre)')
    .eq('activo', true)
    .order('nombre');

  if (buscar) query = query.ilike('nombre', `%${buscar}%`);
  if (categoria) query = query.eq('categoria_id', categoria);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.obtener = async (req, res) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(data);
};

exports.crear = async (req, res) => {
  const { nombre, categoria_id, precio, stock, stock_minimo, fecha_vencimiento } = req.body;

  if (!nombre || precio === undefined) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }
  if (precio < 0 || stock < 0) {
    return res.status(400).json({ error: 'Precio y stock no pueden ser negativos' });
  }

  const { data, error } = await supabase
    .from('productos')
    .insert({ nombre, categoria_id, precio, stock, stock_minimo, fecha_vencimiento })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

exports.actualizar = async (req, res) => {
  const { nombre, categoria_id, precio, stock, stock_minimo, fecha_vencimiento } = req.body;

  const { data, error } = await supabase
    .from('productos')
    .update({ nombre, categoria_id, precio, stock, stock_minimo, fecha_vencimiento })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.desactivar = async (req, res) => {
  const { error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Producto desactivado' });
};

exports.categorias = async (req, res) => {
  const { data, error } = await supabase.from('categorias').select('*').order('nombre');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};