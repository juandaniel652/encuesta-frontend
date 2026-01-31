(async function loadModularSystem() {
  try {
    const { default: initApp } = await import('./src/main.js');
    initApp(); // 👈 ESTO ES LO QUE TE FALTABA
    console.log('✅ Sistema modular cargado exitosamente');
  } catch (error) {
    console.error('❌ Error cargando sistema modular:', error);
  }
})();
