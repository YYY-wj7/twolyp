// Global error handler - show errors on page instead of blank screen
window.addEventListener('error', (e) => {
  document.getElementById('root').innerHTML = 
    '<div style="padding:20px;font-family:monospace"><h2>App Error</h2><pre style="color:red;white-space:pre-wrap">' + 
    (e.message || e.error?.message || String(e.error || e)) + '</pre><p>Check browser console for details.</p></div>';
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  document.getElementById('root').innerHTML = 
    '<div style="padding:20px;font-family:monospace"><h2>Render Error</h2><pre style="color:red;white-space:pre-wrap">' + 
    (e.message || String(e)) + '</pre></div>';
}
