import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, getToken } from '../api';
import TemaSelector from '../components/TemaSelector';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  if (getToken()) return <Navigate to="/dashboard" replace />;

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="orb o1" /><div className="orb o2" />
      <main className="login-card glass">
        <div className="logo logo-grande">💊</div>
        <h1>Botica Mafer</h1>
        <p className="subtitulo">Inventario · Ventas · Atención al cliente</p>
        <form onSubmit={enviar}>
          <label htmlFor="email">Correo</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <p className="mensaje-error">{error}</p>
          <button type="submit" className="btn btn-primario btn-block" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </main>
      <div className="fab-stack"><TemaSelector /></div>
    </div>
  );
}