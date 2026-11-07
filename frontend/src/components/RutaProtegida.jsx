import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { getToken } from '../api';
import Navbar from './Navbar';
import TemaSelector from './TemaSelector';

export default function RutaProtegida() {
  const { pathname } = useLocation();
  if (!getToken()) return <Navigate to="/" replace />;

  return (
    <div className="app">
      <Navbar />
      <main className="contenido">
        <Outlet />
      </main>
      <div className="fab-stack">
        {pathname !== '/ventas' && (
          <Link to="/ventas" className="fab fab-venta" title="Nueva venta">🛒 <span>Nueva venta</span></Link>
        )}
        <TemaSelector />
      </div>
    </div>
  );
}