import { AppController } from './controllers/AppController.js';

export default function initModularApp() {
  const app = new AppController();
  app.init();

  if (window.location.hostname === 'localhost') {
    window.__APP_CONTROLLER__ = app;
    console.log('🚀 App inicializada (dev mode)');
  }
}
