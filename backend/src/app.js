const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./config/supabase');
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const ventasRoutes = require('./routes/ventas.routes');
const alertasRoutes = require('./routes/alertas.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Front-end compilado
const dist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(dist));

app.get('/api/health', async (req, res) => {
  const { error } = await supabase.from('productos').select('id').limit(1);
  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, mensaje: 'Botica Mafer API conectada a Supabase' });
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/alertas', alertasRoutes);

// Rutas /api que no existen
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Cualquier otra ruta devuelve la app React
app.use((req, res) => res.sendFile(path.join(dist, 'index.html')));

module.exports = app;