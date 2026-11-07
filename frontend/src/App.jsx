import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Historial from './pages/Historial';
import RutaProtegida from './components/RutaProtegida';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<RutaProtegida />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/historial" element={<Historial />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}