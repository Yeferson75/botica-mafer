const API_URL = '/api';

export const getToken = () => localStorage.getItem('token');
export const getUsuario = () => JSON.parse(localStorage.getItem('usuario') || 'null');

export function cerrarSesion() {
  localStorage.clear();
  window.location.href = '/';
}

export async function api(ruta, opciones = {}) {
  const res = await fetch(API_URL + ruta, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      ...opciones.headers
    },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined
  });

  // Token vencido: vuelve al login (solo si había sesión)
  if (res.status === 401 && getToken()) {
    cerrarSesion();
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}