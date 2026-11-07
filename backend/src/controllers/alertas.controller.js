const supabase = require('../config/supabase');

// GET /api/alertas
// Devuelve productos con stock bajo/agotado y productos por vencer/vencidos
exports.listar = async (req, res) => {
  const { data, error } = await supabase
    .from('alertas_inventario')
    .select('*')
    .order('stock', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const resumen = {
    agotados: data.filter(p => p.alerta_stock === 'agotado').length,
    stock_bajo: data.filter(p => p.alerta_stock === 'stock_bajo').length,
    por_vencer: data.filter(p => p.alerta_vencimiento === 'por_vencer').length,
    vencidos: data.filter(p => p.alerta_vencimiento === 'vencido').length
  };

  res.json({ resumen, alertas: data });
};