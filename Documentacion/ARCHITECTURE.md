Open/Closed Principle (OCP)

Fácil extender sin modificar
Agregar nuevas vistas sin tocar existentes
Cambiar storage sin afectar lógica

Liskov Substitution (LSP)

Todos los modelos tienen métodos toJSON() y fromJSON()
Intercambiables donde se espere serialización

Interface Segregation (ISP)

Callbacks específicos por vista
No se fuerza a implementar métodos innecesarios

Dependency Inversion (DIP)

Controller depende de abstracciones (servicios)
Fácil cambiar implementación de servicios

