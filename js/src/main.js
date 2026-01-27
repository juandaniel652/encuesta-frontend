/**
 * Main Entry Point
 * Punto de entrada principal de la aplicación modular
 * Se carga después de appData.js y appUI.js para compatibilidad
 */

import { AppController } from './controllers/AppController.js';

/**
 * Inicializa la aplicación modular
 */
function initModularApp() {
  // Verificar que los elementos del DOM existan
  if (!document.getElementById('campaignList')) {
    console.error('Elementos del DOM no encontrados. Verifica que el HTML esté cargado.');
    return;
  }

  // Inicializar el controlador de la aplicación
  const app = new AppController();
  app.init();

  // Exponer el controlador globalmente para debugging (opcional)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.__APP_CONTROLLER__ = app;
    console.log('🚀 Aplicación modular inicializada en modo desarrollo');
    console.log('💡 Accede al controlador via: window.__APP_CONTROLLER__');
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModularApp);
} else {
  // DOM ya está listo
  initModularApp();
}