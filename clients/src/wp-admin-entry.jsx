import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

function mount() {
  const el = document.getElementById('wpam-auctions-root');
  if (el) {
    createRoot(el).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}

if (document.readyState !== 'loading') {
  mount();
} else {
  document.addEventListener('DOMContentLoaded', mount);
}

export default mount;
