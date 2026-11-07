const supabase = require('../config/supabase');

const METODOS = ['efectivo', 'yape', 'plin', 'tarjeta'];
const DETALLE = '*, perfiles(nombre), detalle_ventas(cantidad, precio_unitario, subtotal, productos(nombre))';

exports.registrar = async (req, res) => {
  const { cliente_nombre, cliente_documento, items, metodo_pago = 'efectivo', monto_recibido, referencia } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
  }
  for (const item of items) {
    if (!item.producto_id || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      return res.status(400).json({ error: 'Cada producto necesita producto_id y una cantidad entera mayor a 0' });
    }
  }
  if (!METODOS.includes(metodo_pago)) {
    return res.status(400).json({ error: 'Método de pago no válido' });
  }

  const { data: ventaId, error } = await supabase.rpc('registrar_venta', {
    p_usuario_id: req.usuario.id,
    p_cliente: cliente_nombre || '',
    p_items: items,
    p_metodo: metodo_pago,
    p_recibido: monto_recibido ?? null,
    p_documento: cliente_documento || '',
    p_referencia: referencia || ''
  });
  if (error) return res.status(400).json({ error: error.message });

  const { data: venta } = await supabase.from('ventas').select(DETALLE).eq('id', ventaId).single();
  res.status(201).json(venta);
};

// Resumen de HOY para el dashboard (hora de Perú, UTC-5)
exports.resumen = async (req, res) => {
  const lima = new Date(Date.now() - 5 * 3600 * 1000);
  lima.setUTCHours(0, 0, 0, 0);
  const desde = new Date(lima.getTime() + 5 * 3600 * 1000).toISOString();

  let query = supabase.from('ventas').select('total, metodo_pago').gte('fecha', desde);
  if (req.usuario.rol !== 'admin') query = query.eq('usuario_id', req.usuario.id);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const porMetodo = { efectivo: 0, yape: 0, plin: 0, tarjeta: 0 };
  let total = 0;
  data.forEach(v => {
    total += Number(v.total);
    porMetodo[v.metodo_pago] = (porMetodo[v.metodo_pago] || 0) + Number(v.total);
  });
  res.json({ cantidad: data.length, total, porMetodo });
};

exports.listar = async (req, res) => {
  let query = supabase
    .from('ventas')
    .select('*, perfiles(nombre)')
    .order('fecha', { ascending: false })
    .limit(200);
  if (req.usuario.rol !== 'admin') query = query.eq('usuario_id', req.usuario.id);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.obtener = async (req, res) => {
  const { data, error } = await supabase.from('ventas').select(DETALLE).eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Venta no encontrada' });
  if (req.usuario.rol !== 'admin' && data.usuario_id !== req.usuario.id) {
    return res.status(403).json({ error: 'No puedes ver esta venta' });
  }
  res.json(data);
};