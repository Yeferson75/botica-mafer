import { useEffect, useState } from 'react';
import { api } from '../api';
import { soles, METODOS, emojiCat } from '../utils';
import Boleta from '../components/Boleta';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [cat, setCat] = useState('Todas');
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState('');
  const [documento, setDocumento] = useState('');
  const [metodo, setMetodo] = useState('efectivo');
  const [recibido, setRecibido] = useState('');
  const [referencia, setReferencia] = useState('');
  const [error, setError] = useState('');
  const [boleta, setBoleta] = useState(null);

  const cargar = () => api('/productos').then(setProductos).catch(e => setError(e.message));
  useEffect(() => { cargar(); }, []);

  const cats = ['Todas', ...new Set(productos.map(p => p.categorias?.nombre).filter(Boolean))];
  const visibles = productos.filter(p =>
    (cat === 'Todas' || p.categorias?.nombre === cat) &&
    p.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const vuelto = metodo === 'efectivo' && recibido !== '' ? Math.max(0, Number(recibido) - total) : 0;

  function agregar(p) {
    if (p.stock === 0) return;
    setCarrito(actual => {
      const item = actual.find(i => i.id === p.id);
      if (item) return actual.map(i => i.id === p.id ? { ...i, cantidad: Math.min(i.stock, i.cantidad + 1) } : i);
      return [...actual, { id: p.id, nombre: p.nombre, precio: Number(p.precio), stock: p.stock, cantidad: 1 }];
    });
  }

  const cambiarCantidad = (id, d) =>
    setCarrito(a => a.map(i => i.id === id ? { ...i, cantidad: Math.min(i.stock, Math.max(1, i.cantidad + d)) } : i));
  const quitar = id => setCarrito(a => a.filter(i => i.id !== id));

  async function cobrar() {
    setError('');
    if (carrito.length === 0) return setError('Agrega al menos un producto');
    if (metodo === 'efectivo' && recibido !== '' && Number(recibido) < total) {
      return setError('El monto recibido es menor al total');
    }
    try {
      const venta = await api('/ventas', {
        method: 'POST',
        body: {
          cliente_nombre: cliente,
          cliente_documento: documento,
          metodo_pago: metodo,
          monto_recibido: metodo === 'efectivo' && recibido !== '' ? Number(recibido) : null,
          referencia,
          items: carrito.map(i => ({ producto_id: i.id, cantidad: i.cantidad }))
        }
      });
      setBoleta(venta);
      setCarrito([]); setCliente(''); setDocumento(''); setRecibido(''); setReferencia(''); setBuscar('');
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="cabecera">
        <div><h2>Punto de venta</h2><p className="suave">Toca un producto para agregarlo al carrito</p></div>
      </div>

      <div className="pos">
        <section className="glass panel-caja">
          <input type="search" placeholder="🔍 Buscar producto..." value={buscar}
                 onChange={e => setBuscar(e.target.value)} autoFocus autoComplete="off" />
          <div className="chips">
            {cats.map(c => (
              <button key={c} className={`chip ${cat === c ? 'sel' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="grid-prod catalogo">
            {visibles.length === 0 && <p className="suave">Sin resultados</p>}
            {visibles.map(p => (
              <button key={p.id} className="prod" disabled={p.stock === 0} onClick={() => agregar(p)}>
                <span className="emoji">{emojiCat(p.categorias?.nombre)}</span>
                <b>{p.nombre}</b>
                <strong>{soles(p.precio)}</strong>
                <small className={p.stock <= p.stock_minimo ? 'txt-warn' : ''}>
                  {p.stock === 0 ? 'Agotado' : `Stock: ${p.stock}`}
                </small>
              </button>
            ))}
          </div>
        </section>

        <aside className="glass panel-caja carrito" id="carrito">
          <h3>🛒 Carrito</h3>
          <div className="dos-inputs">
            <input placeholder="Cliente (opcional)" value={cliente} onChange={e => setCliente(e.target.value)} />
            <input placeholder="DNI / RUC" value={documento} onChange={e => setDocumento(e.target.value)} />
          </div>

          <div className="items">
            {carrito.length === 0 && <p className="suave centro">Carrito vacío</p>}
            {carrito.map(i => (
              <div className="item" key={i.id}>
                <div><b>{i.nombre}</b><small>{soles(i.precio)} c/u</small></div>
                <div className="cant">
                  <button onClick={() => cambiarCantidad(i.id, -1)}>−</button>
                  <span>{i.cantidad}</span>
                  <button onClick={() => cambiarCantidad(i.id, 1)}>+</button>
                </div>
                <strong>{soles(i.precio * i.cantidad)}</strong>
                <button className="x" onClick={() => quitar(i.id)}>✕</button>
              </div>
            ))}
          </div>

          <div className="metodos">
            {Object.entries(METODOS).map(([id, [icono, nombre]]) => (
              <button key={id} className={`metodo ${metodo === id ? 'sel' : ''}`} onClick={() => setMetodo(id)}>
                <span>{icono}</span>{nombre}
              </button>
            ))}
          </div>

          {metodo === 'efectivo' && (
            <>
              <input type="number" min="0" step="0.10" placeholder="Monto recibido (S/)"
                     value={recibido} onChange={e => setRecibido(e.target.value)} />
              <div className="chips">
                <button className="chip" onClick={() => setRecibido(total.toFixed(2))}>Exacto</button>
                {[10, 20, 50, 100, 200].map(n => (
                  <button key={n} className="chip" onClick={() => setRecibido(String(n))}>S/ {n}</button>
                ))}
              </div>
              {recibido !== '' && <p className="linea-vuelto">Vuelto: <b>{soles(vuelto)}</b></p>}
            </>
          )}

          {(metodo === 'yape' || metodo === 'plin') && (
            <>
              <p className="aviso">Pide al cliente que pague al número de la botica y confirma el pago en tu app antes de cobrar.</p>
              <input placeholder="N° de operación (opcional)" value={referencia} onChange={e => setReferencia(e.target.value)} />
            </>
          )}

          <p className="total">Total <span>{soles(total)}</span></p>
          <p className="mensaje-error">{error}</p>
          <button className="btn btn-primario btn-block btn-cobrar" onClick={cobrar}>COBRAR {soles(total)}</button>
          {carrito.length > 0 && (
            <button className="btn btn-ghost btn-block" onClick={() => setCarrito([])}>Vaciar carrito</button>
          )}
        </aside>
      </div>

      {boleta && <Boleta venta={boleta} onCerrar={() => setBoleta(null)} />}
    </>
  );
}