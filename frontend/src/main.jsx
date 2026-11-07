import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

document.documentElement.dataset.theme = localStorage.getItem('tema') || 'aurora';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);