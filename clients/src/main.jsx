import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('wpam-auctions-root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
