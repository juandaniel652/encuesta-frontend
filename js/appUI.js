/**
 * appUI.js - Cargador del sistema modular
 * Este archivo carga el sistema modular usando ES6 modules
 */

console.log('🎨 appUI.js cargado - Inicializando sistema modular...');

// Cargar el sistema modular usando import dinámico
(async function loadModularSystem() {
  try {
    // Import dinámico del main module
    const { default: initApp } = await import('./src/main.js');
    
    console.log('✅ Sistema modular cargado exitosamente');
  } catch (error) {
    console.error('❌ Error cargando sistema modular:', error);
    
    // Mostrar error al usuario
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
      contentArea.innerHTML = `
        <div style="padding: 20px; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 20px;">
          <h3 style="color: #c00; margin-top: 0;">Error al cargar la aplicación</h3>
          <p>Hubo un problema al inicializar el sistema modular.</p>
          <details style="margin-top: 10px;">
            <summary style="cursor: pointer; font-weight: 600;">Ver detalles técnicos</summary>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; margin-top: 10px;">${error.message}\n${error.stack}</pre>
          </details>
          <p style="margin-top: 15px; font-size: 0.9em;">
            <strong>Posibles soluciones:</strong>
          </p>
          <ul style="font-size: 0.9em;">
            <li>Verifica que estés usando un servidor HTTP (no file://)</li>
            <li>Asegúrate de que todos los archivos en /js/src/ estén presentes</li>
            <li>Revisa la consola del navegador para más detalles</li>
          </ul>
        </div>
      `;
    }
  }
})();