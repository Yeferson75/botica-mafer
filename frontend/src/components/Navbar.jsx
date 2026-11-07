import { NavLink } from 'react-router-dom';
import { getUsuario, cerrarSesion } from '../api';

const links = [
  ['/dashboard', '📊', 'Dashboard'],
  ['/ventas', '🛒', 'Ventas'],
  ['/inventario', '📦', 'Inventario'],
  ['/historial', '🧾', 'Historial']
];

export default function Navbar() {
  const u = getUsuario();
  return (
    <>
      <div className="topbar">
        <div className="marca"><div className="logo">💊</div>Botica Mafer</div>
        <button className="btn btn-ghost" onClick={cerrarSesion}>Salir</button>
      </div>

      <aside className="sidebar">
        <div className="marca"><div className="logo">💊</div><span>Botica Mafer</span></div>
        <nav className="menu">
          {links.map(([ruta, icono, texto]) => (
            <NavLink key={ruta} to={ruta} className={({ isActive }) => (isActive ? 'activo' : '')}>
              <span>{icono}</span><em>{texto}</em>
            </NavLink>
          ))}
        </nav>
        <div className="usuario glass">
          <div className="avatar">{u?.nombre?.[0]?.toUpperCase()}</div>
          <div>
            <strong>{u?.nombre}</strong>
            <small>{u?.rol}</small>
          </div>
          <button className="btn btn-ghost" onClick={cerrarSesion} title="Cerrar sesión">⏻</button>
        </div>
      </aside>
    </>
  );
}