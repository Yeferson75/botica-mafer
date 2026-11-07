export const TIENDA = {
  nombre: 'Botica Mafer',
  ruc: '20000000001',            // cámbialo por el RUC que quieras mostrar
  direccion: 'Av. Principal 123',
  telefono: '999 888 777'
};

export const soles = n => 'S/ ' + Number(n || 0).toFixed(2);
export const nroBoleta = id => `B001-${String(id).padStart(6, '0')}`;
export const fechaHora = f => new Date(f).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });

export const METODOS = {
  efectivo: ['💵', 'Efectivo'],
  yape: ['📱', 'Yape'],
  plin: ['💜', 'Plin'],
  tarjeta: ['💳', 'Tarjeta']
};

const EMOJI = {
  'Analgésicos': '💊', 'Antibióticos': '🧪', 'Vitaminas': '🍊', 'Cuidado personal': '🧴',
  'Resfrío y gripe': '🤧', 'Digestivo': '🌿', 'Alergias': '🌸', 'Primeros auxilios': '🩹',
  'Bebé y mamá': '🍼', 'Dermocuidado': '✨', 'Nutrición': '🥛'
};
export const emojiCat = c => EMOJI[c] || '💊';