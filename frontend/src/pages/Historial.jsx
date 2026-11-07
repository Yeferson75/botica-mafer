import { useEffect, useState } from 'react';
import { api } from '../api';
import { soles, fechaHora, nroBoleta, METODOS } from '../utils';
import Boleta from '../components/Boleta';

export default function Historial() {
  const [ventas, setVentas] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [boleta, setBoleta] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/ventas').then(setVentas).catch(e => setError(e.message));
  }, []);

  async function ver(id) {
    try { setBoleta(await api(`/ventas/${id}`)); }
    catch (e) { setError(e.message); }
  }

  const lista = ventas.filter(v => filtro === 'todos' || v.metodo_pago === filtro);
  const suma = lista.reduce((s, v) => s + Number(v.total), 0);

  return (
    <>
      <div className="cabecera">
        <div><h2>Historial de ventas</h2><p className="suave">{lista.length} ventas · {soles(suma)}</p></div>
      </div>
      {error && <p className="mensaje-error">{error}</p>}

      <div className="chips">
        <button className={`chip ${filtro === 'todos' ? 'sel' : ''}`} onClick={() => setFiltro('todos')}>Todos</button>
        {Object.entries(METODOS).map(([id, [i, n]]) => (
          <button key={id} className={`chip ${filtro === id ? 'sel' : ''}`} onClick={() => setFiltro(id)}>{i} {n}</button>
        ))}
      </div>

      <div className="glass tabla-wrap">
        <table>
          <thead><tr><th>Boleta</th><th>Fecha</th><th>Cliente</th><th>Atendió</th><th>Pago</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan="7">Sin ventas</td></tr>}
            {lista.map(v => (
              <tr key={v.id}>
                <td>{nroBoleta(v.id)}</td>
                <td>{fechaHora(v.fecha)}</td>
                <td>{v.cliente_nombre}</td>
                <td>{v.perfiles?.nombre || '-'}</td>
                <td>{METODOS[v.metodo_pago]?.join(' ')}</td>
                <td><b>{soles(v.total)}</b></td>
                <td><button className="btn btn-ghost" onClick={() => ver(v.id)}>🧾 Ver boleta</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {boleta && <Boleta venta={boleta} onCerrar={() => setBoleta(null)} />}
    </>
  );
}