# Equipo y Proyecto

## Equipo: Ctrl+Z

| Rol             | Nombre                                 | Responsabilidades                                                                 |
|------------------|----------------------------------------|-----------------------------------------------------------------------------------|
| Scrum Master     | Alex Mauricio Flores Beltrán           | Facilitar el proceso Scrum, eliminar obstáculos, organizar reuniones y planificación. |
| Product Owner    | Rudy Gabriel Chambi Chambi             | Representar las necesidades del cliente y gestionar el Product Backlog.          |
| Desarrolladores  | Ramiro Ariel Quenta Ramos              | Desarrollar y entregar incrementos de producto según las historias de usuario.   |
| Diseñador UI/UX  | Daniel Alejandro Zamorano Gamarra      | Diseñar interfaces atractivas y funcionales para los usuarios.                   |
| QA / Tester      | Johan Leonel Chura Perez               | Validar los incrementos del producto mediante pruebas funcionales y de calidad.  |

---

## Proyecto

El proyecto **"Desarrollo de un Sistema Web para el Restaurante El Gusto de Don Justo"** tiene como objetivo diseñar e implementar un sistema web moderno, funcional y adaptable que permita promocionar los servicios del restaurante, mostrar su menú, gestionar reservas y facilitar la interacción con los clientes.

---

## Normas del Equipo

- **Comunicación:** Utilizamos **WhatsApp** para la comunicación rápida y continua, y **Google Meet** para reuniones más estructuradas.
- **Reuniones:** Celebramos reuniones de **Sprint Planning**, **Daily Scrum**, **Sprint Review** y **Sprint Retrospective** según el cronograma definido.
- **Resolución de Conflictos:** Se abordan de forma colaborativa, con participación de todas las partes involucradas y enfoque en soluciones prácticas.
- **Entrega de Trabajo:** Cada miembro del equipo se compromete a cumplir con los plazos establecidos y con la calidad esperada bajo la definición de "Hecho".

---

## Herramientas de desarrollo y gestor de base de datos

- **Editor de Código:** Visual Studio Code
- **Backend:** PHP 8.x
- **Frontend:** HTML, CSS, JavaScript, Bootstrap 5
- **Base de Datos:** Firebase Realtime Database (NoSQL)
- **Hosting / Backend en la nube:** Firebase Hosting
- **Control de versiones:** Git + GitHub

---

## Arquitectura del Sistema

El sistema adopta una arquitectura **cliente-servidor**, con separación clara entre frontend (interfaz de usuario), backend (lógica del negocio) y base de datos. Utiliza Firebase como backend en la nube, integrando autenticación, base de datos y despliegue en una plataforma unificada.

---

## Base de Datos

Se utiliza **Firebase Realtime Database**, un sistema NoSQL orientado a documentos. Las colecciones representan entidades como:

- `usuarios` (con roles: administrador, mesero, gerente, etc.)
- `platos` (menú)
- `pedidos`
- `reservas`
- `inventario`
- `reportes_ventas`

La estructura permite un acceso rápido y escalable, ideal para aplicaciones web en tiempo real como la del restaurante.

---

