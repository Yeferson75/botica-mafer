import { createPortal } from 'react-dom';
import { TIENDA, soles, fechaHora, nroBoleta, METODOS } from '../utils';

export default function Boleta({ venta, onCerrar }) {
  const [icono, metodo] = METODOS[venta.metodo_pago] || METODOS.efectivo;

  const texto = encodeURIComponent(
    `*${TIENDA.nombre}* - Boleta ${nroBoleta(venta.id)}\n` +
    venta.detalle_ventas.map(d => `${d.cantidad} x ${d.productos?.nombre} = ${soles(d.subtotal)}`).join('\n') +
    `\n*TOTAL: ${soles(venta.total)}* (${metodo})\n¡Gracias por su compra!`
  );

  return createPortal(
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal modal-boleta" onClick={e => e.stopPropagation()}>
        <div className="boleta">
          <h3>💊 {TIENDA.nombre}</h3>
          <p className="centro">RUC {TIENDA.ruc}<br />{TIENDA.direccion}<br />Tel. {TIENDA.telefono}</p>
          <hr />
          <p className="centro"><b>BOLETA DE VENTA</b><br />{nroBoleta(venta.id)}</p>
          <hr />
          <p>Fecha: {fechaHora(venta.fecha)}</p>
          <p>Cliente: {venta.cliente_nombre}</p>
          {venta.cliente_documento && <p>DNI/RUC: {venta.cliente_documento}</p>}
          <p>Atendió: {venta.perfiles?.nombre || '-'}</p>
          <hr />
          <table>
            <thead><tr><th>Cant</th><th>Descripción</th><th>Importe</th></tr></thead>
            <tbody>
              {venta.detalle_ventas.map((d, i) => (
                <tr key={i}>
                  <td>{d.cantidad}</td>
                  <td>{d.productos?.nombre}<br /><small>{soles(d.precio_unitario)} c/u</small></td>
                  <td className="der">{soles(d.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr />
          <p className="linea"><b>TOTAL</b><b>{soles(venta.total)}</b></p>
          <p className="linea"><span>Pago</span><span>{icono} {metodo}</span></p>
          {venta.metodo_pago === 'efectivo' && (
            <>
              <p className="linea"><span>Recibido</span><span>{soles(venta.monto_recibido)}</span></p>
              <p className="linea"><span>Vuelto</span><span>{soles(venta.vuelto)}</span></p>
            </>
          )}
          {venta.referencia && <p className="linea"><span>N° operación</span><span>{venta.referencia}</span></p>}
          <hr />
          <p className="centro"><small>¡Gracias por su compra!<br />Comprobante de venta de uso académico,<br />no válido ante SUNAT.</small></p>
        </div>

        <div className="acciones no-print">
          <button className="btn btn-primario" onClick={() => window.print()}>🖨️ Imprimir / PDF</button>
          <a className="btn btn-ghost" href={`https://wa.me/?text=${texto}`} target="_blank" rel="noreferrer">💬 WhatsApp</a>
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}