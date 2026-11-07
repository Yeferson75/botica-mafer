import { useEffect, useState } from 'react';
import { api } from '../api';
import { soles, METODOS } from '../utils';

const etiquetas = {
  agotado: ['Agotado', 'b-bad'],
  stock_bajo: ['Stock bajo', 'b-warn'],
  por_vencer: ['Por vencer', 'b-warn'],
  vencido: ['Vencido', 'b-gris']
};

export default function Dashboard() {
  const [alertas, setAlertas] = useState(null);
  const [hoy, setHoy] = useState(null);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/alertas'), api('/ventas/resumen'), api('/productos')])
      .then(([a, h, p]) => { setAlertas(a); setHoy(h); setProductos(p); })
      .catch(e => setError(e.message));
  }, []);

  if (error) return <p className="mensaje-error">{error}</p>;
  if (!alertas || !hoy) return <p className="suave">Cargando...</p>;

  const { resumen, alertas: lista } = alertas;
  const valorInventario = productos.reduce((s, p) => s + Number(p.precio) * p.stock, 0);
  const maxMetodo = Math.max(1, ...Object.values(hoy.porMetodo));

  return (
    <>
      <div className="cabecera">
        <div>
          <h2>Panel de control</h2>
          <p className="suave">Resumen en tiempo real de Botica Mafer</p>
        </div>
      </div>

      <section className="kpis">
        <div className="kpi glass"><small>Ventas de hoy</small><strong>{soles(hoy.total)}</strong><span>💰</span></div>
        <div className="kpi glass"><small>N° de ventas</small><strong>{hoy.cantidad}</strong><span>🧾</span></div>
        <div className="kpi glass"><small>Productos activos</small><strong>{productos.length}</strong><span>📦</span></div>
        <div className="kpi glass"><small>Valor del inventario</small><strong>{soles(valorInventario)}</strong><span>🏷️</span></div>
      </section>

      <section className="kpis">
        <div className="kpi glass bad"><small>Agotados</small><strong>{resumen.agotados}</strong></div>
        <div className="kpi glass warn"><small>Stock bajo</small><strong>{resumen.stock_bajo}</strong></div>
        <div className="kpi glass warn"><small>Por vencer</small><strong>{resumen.por_vencer}</strong></div>
        <div className="kpi glass gris"><small>Vencidos</small><strong>{resumen.vencidos}</strong></div>
      </section>

      <div className="dos-col">
        <section className="glass panel-caja">
          <h3>Ventas de hoy por método de pago</h3>
          {Object.entries(hoy.porMetodo).map(([m, v]) => (
            <div className="barra-fila" key={m}>
              <span>{METODOS[m][0]} {METODOS[m][1]}</span>
              <div className="barra"><i style={{ width: `${(v / maxMetodo) * 100}%` }} /></div>
              <b>{soles(v)}</b>
            </div>
          ))}
        </section>

        <section className="glass panel-caja">
          <h3>⚠️ Requieren atención ({lista.length})</h3>
          <div className="tabla-wrap alto">
            <table>
              <thead><tr><th>Producto</th><th>Stock</th><th>Vence</th><th>Estado</th></tr></thead>
              <tbody>
                {lista.length === 0 && <tr><td colSpan="4">Sin alertas 🎉</td></tr>}
                {lista.map(p => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.stock}/{p.stock_minimo}</td>
                    <td>{p.fecha_vencimiento || '-'}</td>
                    <td>
                      {[p.alerta_stock, p.alerta_vencimiento].filter(Boolean).map(e => (
                        <span key={e} className={`badge ${etiquetas[e][1]}`}>{etiquetas[e][0]}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}