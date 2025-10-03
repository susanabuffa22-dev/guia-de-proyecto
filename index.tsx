import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Envuelve el arranque de la aplicación en un bloque try...catch
// para atrapar cualquier error fatal que cause la "pantalla en blanco".
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("No se pudo encontrar el elemento 'root' para montar la aplicación.");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
  console.error("Error crítico al cargar la aplicación:", error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // Muestra un mensaje de error claro en la pantalla para que el usuario sepa qué ha pasado.
    rootElement.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; background-color: #fee2e2; border-left: 5px solid #ef4444; color: #b91c1c; margin: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Error Crítico al Cargar la Aplicación</h2>
        <p style="margin-bottom: 1rem;">Hubo un problema grave que impidió que la aplicación se iniciara. Esto suele deberse a un error de configuración o a un problema al cargar los módulos de la aplicación.</p>
        <p style="margin-bottom: 0.5rem;"><strong>Mensaje de Error:</strong></p>
        <pre style="white-space: pre-wrap; word-wrap: break-word; background: #fff; padding: 1rem; border-radius: 4px; border: 1px solid #fca5a5; font-family: monospace;">${error.stack || error.message}</pre>
        <p style="margin-top: 1.5rem;">Por favor, revisa la configuración mencionada en el error o abre la consola del desarrollador (presiona F12) para más detalles técnicos.</p>
      </div>
    `;
  }
}
