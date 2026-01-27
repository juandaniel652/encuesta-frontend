AndrosNet - Sistema de Gestión de Campañas

🏗️ *Arquitectura*

*Patrón MVC (Model-View-Controller)*

- _Models (/src/models/)_

Representan la estructura de datos:

- _Campaign.js_: Maneja datos de campañas, validación y operaciones
- _Question.js_: Gestiona preguntas y sus opciones
- _Response.js_: Administra respuestas de encuestas

- _Views (/src/views/)_

Componentes de UI que renderizan la interfaz:

CampaignListView.js: Lista de campañas con filtrado
CampaignEditorView.js: Editor completo de campañas
CampaignRunnerView.js: Formulario de respuesta
ResponsesView.js: Visualización de reportes estadísticos

- _Controllers (/src/controllers/)_
Coordinan la lógica entre modelos y vistas:

AppController.js: Controlador central de la aplicación

- _Services (/src/services/)_
Servicios que encapsulan lógica específica:

storageService.js: Abstracción de localStorage
apiService.js: Comunicación con backend

- _Utils (/src/utils/)_
Utilidades reutilizables:

helpers.js: Funciones auxiliares (escape HTML, formato de fechas, etc.)

- _Config (/src/config/)_
Configuración centralizada:

constants.js: Constantes y configuraciones

-----------------------------------------------

*🚀 Características*

✅ _Modularidad_

- Cada módulo tiene una responsabilidad única (SRP)
- Fácil mantenimiento y testing
- Imports/exports ES6 modules

✅ _Escalabilidad_

- Fácil agregar nuevas vistas o funcionalidades
- Servicios desacoplados y reutilizables
- Arquitectura preparada para crecimiento

✅ _Mantenibilidad_

- Código documentado con JSDoc
- Nombres descriptivos y claros
- Separación clara de responsabilidades

✅ _Profesionalismo_

- Patrón de diseño MVC
- Singleton para servicios
- Manejo centralizado de errores