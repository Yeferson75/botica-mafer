import { useState } from 'react';

const TEMAS = [
  ['aurora', 'Aurora', '#22d3ee'],
  ['cosmos', 'Cosmos', '#a78bfa'],
  ['esmeralda', 'Esmeralda', '#059669'],
  ['coral', 'Coral', '#f43f5e']
];

export function aplicarTema(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem('tema', t);
}

export default function TemaSelector() {
  const [abierto, setAbierto] = useState(false);
  const [actual, setActual] = useState(localStorage.getItem('tema') || 'aurora');

  function elegir(t) {
    aplicarTema(t);
    setActual(t);
    setAbierto(false);
  }

  return (
    <div className="tema-wrap">
      {abierto && (
        <div className="tema-panel glass">
          <small>Tema de color</small>
          {TEMAS.map(([id, nombre, color]) => (
            <button key={id} className={`tema-op ${actual === id ? 'sel' : ''}`} onClick={() => elegir(id)}>
              <span className="punto" style={{ background: color }} /> {nombre}
            </button>
          ))}
        </div>
      )}
      <button className="fab" title="Cambiar tema" onClick={() => setAbierto(!abierto)}>🎨</button>
    </div>
  );
}