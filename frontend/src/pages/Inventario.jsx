import { useEffect, useState } from 'react';
import { api, getUsuario } from '../api';
import { soles, emojiCat } from '../utils';

const vacio = { nombre: '', categoria_id: '', precio: '', stock: '', stock_minimo: 5, fecha_vencimiento: '' };

export default function Inventario() {
  const esAdmin = getUsuario()?.rol === 'admin';
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [cat, setCat] = useState('Todas');
  const [errorLista, setErrorLista] = useState('');
  const [form, setForm] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  const cargar = () => api('/productos').then(d => setProductos(d || [])).catch(e => setErrorLista(e.message));

  useEffect(() => {
    cargar();
    api('/productos/categorias/todas').then(setCategorias).catch(e => setErrorLista(e.message));
  }, []);

  const visibles = productos.filter(p =>
    (cat === 'Todas' || p.categorias?.nombre === cat) &&
    p.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  function estado(p) {
    if (p.stock === 0) return ['Agotado', 'b-bad'];
    if (p.stock <= p.stock_minimo) return ['Stock bajo', 'b-warn'];
    return ['Disponible', 'b-ok'];
  }

  function abrir(p) {
    setEditandoId(p ? p.id : null);
    setError('');
    setForm(p
      ? { nombre: p.nombre, categoria_id: p.categoria_id ?? '', precio: p.precio, stock: p.stock,
          stock_minimo: p.stock_minimo, fecha_vencimiento: p.fecha_vencimiento || '' }
      : { ...vacio, categoria_id: categorias[0]?.id ?? '' });
  }

  const cambiar = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function guardar(e) {
    e.preventDefault();
    const body = {
      nombre: form.nombre,
      categoria_id: Number(form.categoria_id),
      precio: Number(form.precio),
      stock: Number(form.stock),
      stock_minimo: Number(form.stock_minimo),
      fecha_vencimiento: form.fecha_vencimiento || null
    };
    try {
      if (editandoId) await api(`/productos/${editandoId}`, { method: 'PUT', body });
      else await api('/productos', { method: 'POST', body });
      setForm(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function quitar(id) {
    if (!confirm('¿Quitar este producto del inventario?')) return;
    try { await api(`/productos/${id}`, { method: 'DELETE' }); cargar(); }
    catch (err) { setErrorLista(err.message); }
  }

  function exportar() {
    const filas = [['Producto', 'Categoría', 'Precio', 'Stock', 'Mínimo', 'Vence'],
      ...visibles.map(p => [p.nombre, p.categorias?.nombre || '', p.precio, p.stock, p.stock_minimo, p.fecha_vencimiento || ''])];
    const csv = '\uFEFF' + filas.map(f => f.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'inventario-botica-mafer.csv';
    a.click();
  }

  const cats = ['Todas', ...categorias.map(c => c.nombre)];

  return (
    <>
      <div className="cabecera">
        <div><h2>Inventario</h2><p className="suave">{visibles.length} de {productos.length} productos</p></div>
        <div className="acciones-cab">
          <button className="btn btn-ghost" onClick={exportar}>⬇️ Exportar CSV</button>
          {esAdmin && <button className="btn btn-primario" onClick={() => abrir(null)}>＋ Nuevo producto</button>}
        </div>
      </div>
      {errorLista && <p className="mensaje-error">{errorLista}</p>}

      <input type="search" placeholder="🔍 Buscar producto..." value={buscar} onChange={e => setBuscar(e.target.value)} />
      <div className="chips">
        {cats.map(c => (
          <button key={c} className={`chip ${cat === c ? 'sel' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="glass tabla-wrap">
        <table>
          <thead>
            <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Mín.</th><th>Vence</th><th>Estado</th>{esAdmin && <th></th>}</tr>
          </thead>
          <tbody>
            {visibles.length === 0 && <tr><td colSpan={esAdmin ? 8 : 7}>No hay productos</td></tr>}
            {visibles.map(p => {
              const [txt, clase] = estado(p);
              return (
                <tr key={p.id}>
                  <td>{emojiCat(p.categorias?.nombre)} {p.nombre}</td>
                  <td>{p.categorias?.nombre || '-'}</td>
                  <td>{soles(p.precio)}</td>
                  <td><b>{p.stock}</b></td>
                  <td>{p.stock_minimo}</td>
                  <td>{p.fecha_vencimiento || '-'}</td>
                  <td><span className={`badge ${clase}`}>{txt}</span></td>
                  {esAdmin && (
                    <td className="nowrap">
                      <button className="btn btn-ghost" onClick={() => abrir(p)}>✏️</button>{' '}
                      <button className="btn btn-peligro" onClick={() => quitar(p.id)}>🗑️</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="modal-fondo">
          <form className="modal" onSubmit={guardar}>
            <h3>{editandoId ? 'Editar producto' : 'Nuevo producto'}</h3>
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={cambiar} required />
            <label>Categoría</label>
            <select name="categoria_id" value={form.categoria_id} onChange={cambiar} required>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <div className="dos-inputs">
              <div><label>Precio (S/)</label>
                <input name="precio" type="number" step="0.01" min="0" value={form.precio} onChange={cambiar} required /></div>
              <div><label>Stock</label>
                <input name="stock" type="number" min="0" value={form.stock} onChange={cambiar} required /></div>
            </div>
            <div className="dos-inputs">
              <div><label>Stock mínimo</label>
                <input name="stock_minimo" type="number" min="0" value={form.stock_minimo} onChange={cambiar} required /></div>
              <div><label>Vencimiento</label>
                <input name="fecha_vencimiento" type="date" value={form.fecha_vencimiento} onChange={cambiar} /></div>
            </div>
            <p className="mensaje-error">{error}</p>
            <div className="acciones">
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primario">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}