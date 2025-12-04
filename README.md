#  AdminCon (Prototipado de Alta Fidelidad) | Sistema de Gestión de Comunidades Residenciales [Frontend MVP] Proyecto de mejora para validacion de practica laboral para Comunidad Parque Suizo 900]

Este proyecto es la **capa de presentación y lógica del cliente** para un futuro sistema full-stack. Su propósito es demostrar la arquitectura de navegación, la persistencia de datos en el cliente y las funcionalidades esenciales de los módulos.

---

## 1.  Arquitectura y Tecnologías (Estado Actual)

El sistema opera como una **Aplicación de Múltiples Páginas (MPA)**, con lógica de estado distribuida en el navegador.

| Herramienta | Función |
| :--- | :--- |
| **Vite** | Empaquetador y Servidor de desarrollo (MPA). |
| **JavaScript (Vanilla JS)** | Lógica de la aplicación, control del DOM, validación y gestión de estado. |
| **Tailwind CSS** | Estilizado modular y responsivo. |
| **LocalStorage** | **Capa de Datos Simulada (Backend Mocking)**. Se utiliza actualmente para persistir la autenticación y los datos de la comunidad /resitemporalmentedentesuh. Proximamente se integrara base de datos real  . |

---

## 2. Módulos Implementados (Funcionalidad Actual)

Las siguientes funcionalidades están completas y operativas en el Frontend:

### A. Gestión de Propietarios (CRUD)
* **Control de Estado:** Funcionalidad CRUD completa para agregar, listar y eliminar propietarios.
* **Vínculo Dinámico:** La cantidad de propietarios se refleja dinámicamente en el Dashboard.

### B. Módulo Financiero (Reporte de Balance)
* **Cálculo de Balance:** Lógica de cálculo implementada para sumar Ingresos y Egresos y determinar el Balance Neto.
* **Visualización:** Reportes mensuales/anuales con filtros de periodo y tabla de historial de transacciones.
* **Input de Datos:** Lógica base lista para conectarse al formulario de `nueva-transaccion`.

### C. Sistema de Navegación
* **Rutas Dinámicas:** El `comunidadId` se pasa automáticamente por la URL en todas las vistas (Dashboard, Residentes, Pagos/Gastos).
* **Control de Estado Activo:** Lógica de JS para marcar el enlace activo del Sidebar con color azul en cada recarga de página.
* **Autenticación:** Flujo de Login y Registro operativo (con datos guardados en `localStorage`).

---

## 3. 🛠️ Instrucciones de Ejecución

Para levantar el proyecto en su estado actual (Frontend MVP):

1.  **Navegar:** Ir a la carpeta `frontend/`.
2.  **Instalar dependencias:** `npm install`
3.  **Ejecutar Servidor:** `npm run dev`
    * *La aplicación se abrirá en `http://localhost:5173/` (página de Login/Registro).*

---

### Próximos Pasos

El siguiente paso es la **implementación del Backend con FastAPI y MySQL** para reemplazar la capa simulada de `localStorage`.
