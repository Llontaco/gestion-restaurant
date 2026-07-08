# Plan de Gestión de Configuración

## Sistema de Quiosco de Pedidos — QUIOSKO (Fresh Coffee)

**Curso:** Gestión de Configuración y Mantenimiento del Software – G9
**Versión del documento:** 3.0
**Fecha de actualización:** 07/07/2026

**Integrantes:**

- Llontop Falcón Henry Alessandro
- Romero Cuyubamba Fernando Gael
- Garcia Rosales Mathias Sebastian
- Rosales Rojas Cesar Christopher
- Kevin Mendoza Chamorro
- Guevara Laiza Christian
- Sebastian Malca Aguero

---

## Historial de versiones del documento

| Versión | Fecha | Descripción del cambio |
|---|---|---|
| 1.0 | 2026-05 | Versión inicial del plan (frontend con datos de prueba). |
| 2.0 | 2026-06 | Incorporación del backend Express + Prisma con MySQL local. |
| 3.0 | 2026-07-07 | Actualización integral: despliegue en Vercel (serverless) con PostgreSQL en Neon, autenticación y roles (ADMIN/CLIENT), login con Google, CRUD de categorías, módulo "Mis Pedidos" y ciclo de vida completo de órdenes, delivery con Google Maps y cobro por kilómetro, pasarela de pagos Mercado Pago (Checkout Pro), chatbot con IA (Google Gemini) y moneda en Soles peruanos (S/ PEN). Se eliminan referencias residuales a otros proyectos. |

---

# 1. Introducción

El proyecto **QUIOSKO (Fresh Coffee)** es un sistema web de quiosco digital de pedidos para restaurantes, desarrollado con un stack full-stack en TypeScript:

- **Frontend:** React 18 + Vite 5 + TypeScript + TailwindCSS (SPA con React Router v6).
- **Backend:** Express 4 + TypeScript + Prisma ORM, ejecutado como **funciones serverless en Vercel**.
- **Base de datos:** **PostgreSQL en Neon** (Vercel Postgres), con conexión pooled (PgBouncer) para el entorno serverless.

El sistema permite a los clientes navegar el menú por categorías, armar su pedido en un carrito, elegir **recojo en local o delivery con ubicación en Google Maps**, **pagar en línea con Mercado Pago** y hacer seguimiento de sus pedidos. Incluye un **panel de administración** protegido por roles para gestionar productos, categorías y el ciclo de vida de las órdenes, y un **chatbot con IA (Google Gemini)** que asiste a los clientes sobre el menú y el uso de la aplicación.

## 1.1 Propósito

El propósito de este Plan de Gestión de Configuración (SCMP) es garantizar la integridad del software a lo largo de su ciclo de vida. Esto abarca el establecimiento de un marco formal para identificar Elementos de Configuración (EC), controlar sus versiones, gestionar solicitudes de cambio de manera trazable y asegurar liberaciones estables y reproducibles en los entornos de desarrollo y producción (Vercel).

## 1.2 Alcance

El ámbito de este documento es el proyecto QUIOSKO y establece un plan formal para administrar los productos de trabajo generados durante su desarrollo, incluyendo:

- Los componentes de software del frontend y del backend (repositorio `Llontaco/gestion-restaurant`).
- El esquema de base de datos (Prisma) y sus migraciones en producción.
- Las configuraciones de despliegue (dos proyectos Vercel: frontend y backend) y las variables de entorno.
- Las integraciones con servicios externos: Mercado Pago, Google Maps, Google Identity Services y Google Gemini.
- La documentación técnica y funcional, los casos de prueba y demás artefactos que formen parte de las líneas base del proyecto.

---

# 2. Gestión de Configuración

Se describen las responsabilidades y responsables para la realización de las actividades de gestión de configuración dentro del proyecto.

## 2.1 Organización

La estructura administrativa de la gestión se organiza en torno a los componentes principales del sistema QUIOSKO: **Frontend (SPA)**, **Backend (API REST serverless)**, **Base de Datos (PostgreSQL/Neon)**, **Integraciones externas (pagos, mapas, IA, autenticación)** e **Infraestructura de despliegue (Vercel)**. Esta organización permite identificar con precisión el impacto de los cambios y garantizar la trazabilidad e integridad de los productos de trabajo.

## 2.2 Requisitos

El presente apartado especifica los requisitos funcionales y no funcionales del sistema QUIOSKO (Fresh Coffee).

La **versión 3.0** incorpora la operación en producción sobre Vercel con base de datos PostgreSQL en Neon, la autenticación de usuarios con roles, el cobro por delivery, los pagos en línea y el asistente con IA, reemplazando la configuración local con MySQL descrita en la versión 2.0.

### 2.2.1 Requisitos Funcionales

**a. Gestión de Productos (solo administrador)**

- **RF-01. Registro de Productos:** El sistema debe permitir registrar nuevos productos indicando nombre, precio (en S/), categoría e imagen (archivo o emoji).
- **RF-02. Consulta de Productos:** El sistema debe permitir listar productos registrados con búsqueda por nombre, filtro por categoría y paginación server-side.
- **RF-03. Modificación de Productos:** El administrador debe poder editar la información de productos existentes; al subir una nueva imagen se elimina la anterior.
- **RF-04. Eliminación de Productos:** El administrador debe poder eliminar productos registrados junto con su imagen asociada.

**b. Gestión de Categorías (solo administrador)**

- **RF-05. Consulta de Categorías:** El sistema debe permitir visualizar las categorías disponibles para la organización de productos.
- **RF-06. CRUD de Categorías:** El administrador debe poder crear, editar y eliminar categorías, con validación de nombres duplicados y **bloqueo de borrado** cuando la categoría tenga productos asociados.
- **RF-07. Asociación Producto-Categoría:** Cada producto debe estar asociado obligatoriamente a una categoría existente.

**c. Usuarios, Autenticación y Roles**

- **RF-08. Registro e Inicio de Sesión:** El sistema debe permitir registrarse e iniciar sesión con correo y contraseña. Todo registro público crea un usuario con rol **CLIENT**.
- **RF-09. Inicio de Sesión con Google:** El sistema debe ofrecer el botón "Continuar con Google" (Google Identity Services); el backend verifica el token y su audiencia (`GOOGLE_CLIENT_ID`) y crea el usuario como CLIENT si no existe. Las cuentas Google no requieren contraseña local.
- **RF-10. Control de Acceso por Roles:** El sistema debe distinguir roles **ADMIN** y **CLIENT**. Las rutas `/vistas/admin/*` están protegidas (`RequireAdmin`); los clientes solo acceden al Quiosco y a "Mis Pedidos". La cuenta de administrador se siembra por script, no por registro público.

**d. Gestión de Órdenes**

- **RF-11. Creación de Pedidos:** Los clientes deben poder armar pedidos desde el quiosco (carrito con cantidades y total). La orden queda asociada al usuario autenticado (`Order.userId`).
- **RF-12. Consulta de Órdenes Pendientes:** El panel de administración debe mostrar las órdenes aún no completadas, en orden de llegada.
- **RF-13. Consulta de Órdenes Listas:** El sistema debe mostrar en pantalla de cocina/display las órdenes listas para entregar, excluyendo las ya finalizadas.
- **RF-14. Actualización del Estado de una Orden:** El administrador debe poder marcar una orden como **completada** (lista) y luego como **finalizada** (entregada), retirándola del display.
- **RF-15. Mis Pedidos (cliente):** El cliente debe poder consultar sus pedidos con estados *En preparación → ¡Listo para recoger! → Entregado*, con auto-refresco cada 5 segundos.

**e. Delivery**

- **RF-16. Tipo de Entrega:** En el carrito, el cliente debe poder elegir **Recojo en local (gratis)** o **Delivery**.
- **RF-17. Ubicación en Mapa:** Para delivery, el cliente debe indicar su ubicación en un mapa de Google Maps (clic o arrastre del marcador) y registrar dirección y referencia. El punto de origen es el local (Puerta 1 UNMSM, Av. Venezuela cdra. 34).
- **RF-18. Cobro por Kilómetro:** El sistema debe calcular la distancia (Haversine × factor de ruta 1.3) y aplicar la tarifa de **S/ 1.50/km** con **radio máximo de 10 km**. El cliente debe ver el aviso del cargo y aceptarlo explícitamente antes de confirmar; el cargo se suma al total. El administrador debe ver dirección, distancia, cargo y enlace a Google Maps con la ubicación del cliente.

**f. Pagos en Línea (Mercado Pago — Checkout Pro)**

- **RF-19. Creación de Preferencia de Pago:** Al confirmar, el backend debe crear la preferencia de pago **recalculando los precios desde la base de datos** y re-validando el cargo de delivery en el servidor (anti-manipulación), y redirigir al cliente a Mercado Pago (tarjetas, Yape, etc.).
- **RF-20. Registro de la Orden solo con Pago Aprobado:** La orden debe registrarse únicamente cuando Mercado Pago confirme el pago aprobado (verificación server-side del pago). El registro es **idempotente** (`paymentId` único). El administrador ve el distintivo "✓ Pagado".
- **RF-21. Webhook de Respaldo:** Si el cliente no retorna al sitio, la notificación webhook de Mercado Pago debe registrar la orden igualmente. Si el pago falla o queda pendiente, el carrito se restaura para reintentar.

**g. Asistente con IA (Chatbot)**

- **RF-22. Chatbot del Menú:** El sistema debe ofrecer un widget flotante de chat que recomiende productos, informe precios reales (leídos de la BD en cada consulta) y explique el uso de la app. El asistente está **limitado por prompt** al dominio del menú/aplicación y rechaza temas ajenos. La API key de Gemini reside exclusivamente en el backend (`POST /api/chat` como proxy seguro).

**h. Persistencia y Servicios**

- **RF-23. Almacenamiento de Información:** El sistema debe almacenar usuarios, productos, categorías y órdenes (con datos de delivery y pago) en **PostgreSQL (Neon)** a través de Prisma ORM.
- **RF-24. Servicios API REST:** El backend debe exponer endpoints REST para productos, categorías, órdenes, autenticación, chat y pagos, más un health check (`GET /api/health`).
- **RF-25. Inicialización de Datos:** El sistema debe permitir cargar datos iniciales mediante scripts de población (`seed.ts` con el menú en soles y `seedAdmin.ts` con la cuenta de administrador).

### 2.2.2 Historias de Usuario (HU)

Cada requisito funcional se formaliza como Historia de Usuario bajo el formato "Como … quiero … para …", con sus criterios de aceptación:

- **HU-01 (RF-01 a RF-04):** Como administrador, quiero registrar, listar, buscar, editar y eliminar productos con su imagen y precio en soles, para mantener actualizado el catálogo del quiosco. *Criterio:* los cambios persisten, la búsqueda filtra por nombre y la lista se pagina.
- **HU-02 (RF-05 a RF-07):** Como administrador, quiero gestionar las categorías (crear, editar, eliminar) y que cada producto pertenezca a una categoría válida, para organizar el menú. *Criterio:* no se puede eliminar una categoría con productos ni guardar un producto sin categoría.
- **HU-03 (RF-08 a RF-10):** Como usuario, quiero registrarme e iniciar sesión (con correo o con Google) y que el sistema respete mi rol, para acceder solo a las vistas que me corresponden. *Criterio:* un CLIENT no puede abrir `/vistas/admin/*`; solo el ADMIN ve el panel.
- **HU-04 (RF-11 a RF-15):** Como cliente y como personal del local, quiero generar pedidos y seguir su estado (en preparación, listo, entregado), para gestionar la atención de órdenes de extremo a extremo. *Criterio:* la orden transita correctamente entre estados y "Mis Pedidos" se actualiza solo.
- **HU-05 (RF-16 a RF-18):** Como cliente, quiero elegir delivery marcando mi ubicación en el mapa y conocer y aceptar el cargo por distancia antes de pagar, para recibir mi pedido en casa. *Criterio:* el cargo se calcula por km, se muestra antes de confirmar y respeta el radio máximo de 10 km.
- **HU-06 (RF-19 a RF-21):** Como negocio, quiero cobrar en línea con Mercado Pago y que la orden solo se registre con pago aprobado y verificado en el servidor, para eliminar pedidos no pagados y manipulación de precios. *Criterio:* precios recalculados desde la BD, registro idempotente y webhook de respaldo.
- **HU-07 (RF-22):** Como cliente, quiero un chatbot que me recomiende productos con precios reales y me explique la app, para decidir mi pedido más rápido. *Criterio:* responde solo sobre el menú/aplicación y usa datos actuales de la BD.
- **HU-08 (RF-23 a RF-25):** Como equipo de desarrollo, quiero persistir toda la información en PostgreSQL mediante una API REST serverless e inicializar datos por scripts, para garantizar un almacenamiento confiable y reproducible. *Criterio:* los endpoints responden en producción y los datos sobreviven a los despliegues.

### 2.2.3 Matriz de Trazabilidad (Requisito – HU – Funcionalidad – Código)

| Requisito | HU | Funcionalidad | Código (repositorio) |
|---|---|---|---|
| RF-01 a RF-04 | HU-01 | CRUD de productos con imágenes y paginación | `src/pages/AdminProducts.tsx`, `AdminNewProduct.tsx`, `AdminEditProduct.tsx`; `backend/src/routes/products.ts`; `src/services/api.ts` |
| RF-05 a RF-07 | HU-02 | CRUD de categorías y asociación | `src/pages/AdminCategories.tsx`; `backend/src/routes/categories.ts`; `backend/prisma/schema.prisma` |
| RF-08 a RF-10 | HU-03 | Autenticación, Google Sign-In y roles | `src/pages/Login.tsx`, `Register.tsx`; `src/components/GoogleSignInButton.tsx`, `RequireAdmin.tsx`, `RequireAuth.tsx`; `backend/src/routes/auth.ts`; `backend/src/seedAdmin.ts` |
| RF-11 a RF-15 | HU-04 | Ciclo de vida de órdenes y "Mis Pedidos" | `src/pages/KioskMenu.tsx`, `AdminOrders.tsx`, `OrdersReady.tsx`, `MyOrders.tsx`; `backend/src/routes/orders.ts` |
| RF-16 a RF-18 | HU-05 | Delivery con Google Maps y cargo por km | `src/components/DeliveryMapPicker.tsx`; `src/pages/KioskMenu.tsx`; `backend/prisma/schema.prisma` (campos `deliveryType`, `deliveryLat/Lng`, `distanceKm`, `deliveryFee`) |
| RF-19 a RF-21 | HU-06 | Pagos Mercado Pago (Checkout Pro) | `backend/src/routes/payments.ts` (`/create`, `/confirm`, `/webhook`); `src/services/api.ts`; campos `paymentId`, `paymentStatus` |
| RF-22 | HU-07 | Chatbot con IA (Gemini) | `src/components/ChatWidget.tsx`; `backend/src/routes/chat.ts` |
| RF-23 a RF-25 | HU-08 | Persistencia, API REST serverless y seed | `backend/src/server.ts`; `backend/api/index.ts`; `backend/src/prismaClient.ts`; `backend/prisma/schema.prisma`; `backend/src/seed.ts`, `seedAdmin.ts` |

### 2.2.4 Requisitos No Funcionales

**a. Arquitectura**

- **RNF-01. Arquitectura Cliente-Servidor Serverless:** El sistema se implementa bajo una arquitectura cliente-servidor: frontend SPA (React + TypeScript) y backend Express ejecutado como función serverless en Vercel, desplegados como **dos proyectos Vercel independientes**.
- **RNF-02. Arquitectura Modular:** La estructura del proyecto se organiza en módulos independientes (páginas, componentes, servicios en el frontend; rutas por dominio en el backend: `products`, `categories`, `orders`, `auth`, `chat`, `payments`) para facilitar su desarrollo y mantenimiento.
- **RNF-03. Persistencia mediante ORM:** La comunicación con la base de datos se realiza con Prisma ORM sobre PostgreSQL (Neon), usando conexión pooled (PgBouncer) para las funciones serverless y conexión directa para migraciones.
- **RNF-04. Escalabilidad:** La arquitectura serverless escala automáticamente con la demanda y permite incorporar nuevos módulos sin afectar los componentes existentes.

**b. Rendimiento**

- **RNF-05. Tiempo de Respuesta:** Las operaciones de consulta y administración deben responder en un tiempo adecuado para una experiencia fluida, considerando el arranque en frío de las funciones serverless.
- **RNF-06. Paginación de Datos:** El listado de productos implementa paginación server-side para optimizar el rendimiento con grandes cantidades de registros.
- **RNF-07. Optimización de Consultas:** Las consultas a la base de datos minimizan el consumo de recursos mediante filtros, búsquedas eficientes e índices (p. ej., índice único en `paymentId`).
- **RNF-08. Actualización de Estados:** Las vistas de órdenes (admin y cliente) se actualizan por polling cada 5 segundos sin degradar la experiencia.

**c. Seguridad y Configuración**

- **RNF-09. Configuración mediante Variables de Entorno:** Todos los parámetros sensibles se gestionan por variables de entorno en Vercel: `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` (BD), `GEMINI_API_KEY` / `GEMINI_MODEL` (IA), `GOOGLE_CLIENT_ID` (login), `MP_ACCESS_TOKEN` (pagos, secreto), `FRONTEND_URL` (CORS/retornos); y en el frontend `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_MAPS_API_KEY`.
- **RNF-10. Control de Acceso entre Aplicaciones:** El backend implementa políticas CORS que permiten únicamente los orígenes autorizados del frontend.
- **RNF-11. Secretos solo en el Servidor:** Las credenciales de servicios externos (Gemini, Mercado Pago) residen exclusivamente en el backend; el frontend nunca las expone. El chat opera como proxy seguro.
- **RNF-12. Integridad de Pagos:** Los precios y el cargo de delivery se **recalculan siempre en el servidor** a partir de la BD (anti-manipulación) y el registro de órdenes pagadas es idempotente (`paymentId` único).
- **RNF-13. Autorización por Roles:** El acceso al panel de administración se restringe al rol ADMIN tanto en el frontend (guards de ruta) como en la lógica de negocio.
- **RNF-14. Integridad de la Información:** La base de datos mantiene relaciones consistentes (claves foráneas producto-categoría, orden-ítems, orden-usuario) y restricciones de integridad.

**d. Usabilidad**

- **RNF-15. Moneda y Localización:** Todos los precios se muestran en Soles peruanos (S/ PEN) con formato `es-PE`.
- **RNF-16. Interfaz Adaptativa:** La UI escala (font-size raíz 125% en pantallas ≥1024px) para verse correctamente con Windows al 100% de escalado, sin scroll horizontal; las tablas del admin usan scroll propio en pantallas pequeñas.
- **RNF-17. Retroalimentación al Usuario:** Las acciones clave brindan feedback inmediato (confirmación "✓ Agregado", estados de carga, indicador "escribiendo" del chat, aviso obligatorio del cargo de delivery).

**e. Mantenibilidad y Despliegue**

- **RNF-18. Separación de Responsabilidades:** Se mantienen separadas las capas de presentación (React), lógica de negocio/API (Express) y acceso a datos (Prisma).
- **RNF-19. Control de Versiones:** El desarrollo se controla con Git y GitHub (ramas `main`/`develop`), con commits bajo el estándar Conventional Commits.
- **RNF-20. Gestión de Configuración:** Los elementos de configuración se administran mediante líneas base, registros de cambios (`CHANGELOG.md`, `docs/CAMBIOS.md`) y documentación técnica (`docs/SCM.md`, este plan).
- **RNF-21. Despliegue Continuo y Observabilidad:** El frontend se despliega automáticamente desde GitHub a Vercel; el backend se redespliega con `vercel --prod`. El endpoint `GET /api/health` permite validar el estado del servicio.
- **RNF-22. Facilidad de Extensión:** La estructura modular facilita incorporar nuevas funcionalidades (reportes, notificaciones, multi-sucursal) sin modificaciones significativas de la arquitectura.

## 2.3 Responsabilidades

Para asegurar una supervisión rigurosa y un mantenimiento óptimo del software QUIOSKO, se establecen los siguientes roles de gestión:

### Comité de Control de Cambios (CCC)

- **Líder del Comité — Henry Llontop.** Preside las sesiones formales del comité, convoca reuniones de emergencia ante cambios críticos en producción (p. ej., fallos de pagos o de base de datos) y emite el voto dirimente para la aprobación o rechazo de modificaciones de la línea base.
- **Gerente de Proyecto — Garcia Rosales Mathias Sebastian.** Evalúa el impacto de los cambios sobre el cronograma (Sprints), los recursos y el alcance, asegurando que no comprometan los hitos de entrega.
- **Líder Técnico / Arquitecto — Rosales Rojas Cesar Christopher.** Analiza la viabilidad técnica de los cambios y su impacto sobre la arquitectura cliente-servidor serverless, cuidando la separación frontend/backend/datos y la compatibilidad de los contratos de la API REST (regla "Contrato Primero": primero el endpoint y su contrato, luego la documentación, finalmente el consumo desde el frontend).
- **Representante del Cliente/Usuario — Sebastian Malca.** Valida que las solicitudes de cambio se alineen con la operación del restaurante (flujo de pedidos, delivery, pagos), garantizando que no se degrade la experiencia del cliente ni del personal.
- **Representantes de Aseguramiento de la Calidad (QA) — Guevara Laiza Christian y Kevin Mendoza Chamorro.** Evalúan el riesgo de regresión de los cambios y determinan el alcance de los casos de prueba (funcionales y de integración con servicios externos) que deben superarse antes de autorizar la fusión o el despliegue a producción.

### Gestores de la Configuración

- **Henry Llontop.** Encargado de administrar el ambiente controlado, velar por el cumplimiento del flujo Git/Jira, resolver conflictos críticos de integración, ejecutar los despliegues del backend (`vercel --prod`) y auditar la consistencia del repositorio.

### Bibliotecarios

- **Sebastián Malca.** Responsable de la custodia física y lógica de los productos de trabajo en los repositorios oficiales (GitHub) y de la gestión de la documentación técnica (`docs/`), asegurando que el equipo trabaje siempre con las versiones vigentes.

## 2.4 Herramientas, Entorno e Infraestructura

### Herramientas

- **Gestión Administrativa y Coordinación:**
  - **Jira:** registro, seguimiento y control de tareas, incidencias y solicitudes de cambio bajo Scrum (tickets `SCRUM-XX` referenciados en los commits).
- **Control de Versiones:**
  - **GitHub** (`Llontaco/gestion-restaurant`): repositorio centralizado para código, documentación técnica y preservación de líneas base. Ramas principales: `main` (producción) y `develop` (integración).
- **Entornos de Desarrollo:**
  - **React 18 + Vite 5 + TypeScript + TailwindCSS:** desarrollo del frontend.
  - **Express 4 + Prisma ORM + TypeScript:** desarrollo del backend/API REST.
  - **Visual Studio Code:** entorno de desarrollo del equipo.
- **Infraestructura y Servicios en la Nube:**
  - **Vercel:** hosting de producción en dos proyectos independientes (frontend `gestion-restaurant` y backend serverless `backend`), con CI/CD desde GitHub para el frontend.
  - **Neon (Vercel Postgres):** base de datos PostgreSQL gestionada.
  - **Mercado Pago (Checkout Pro):** pasarela de pagos.
  - **Google Cloud Console:** credenciales de Maps JavaScript API (delivery) y Google Identity Services (login).
  - **Google Gemini (`gemini-2.5-flash`):** modelo de IA del chatbot.
- **Pruebas y Calidad:**
  - **Navegadores Web (Google Chrome y Microsoft Edge):** validación funcional y visual.
  - **Casos de prueba documentados** (`docs/casos_de_prueba.md`, `docs/informe_resultados_pruebas.md`): 49 casos especificados con su informe de resultados.
  - **Sandbox de Mercado Pago y health check** (`/api/health`): validación de integraciones en despliegues.

### Ubicación física de las máquinas servidores y clientes

- **Clientes:** el acceso al sistema se realiza mediante navegadores web, tanto en escritorio como en móviles.
- **Servidores (producción):** frontend y backend alojados en **Vercel** (funciones serverless, sin servidores propios); base de datos en **Neon**. URLs oficiales: frontend `https://gestion-restaurant-roan.vercel.app`, backend `https://backend-eight-tau-73.vercel.app`.
- **Servidores (desarrollo):** entornos locales en los equipos de los desarrolladores (frontend en puerto 5173, backend en 3001).
- **Responsable de Acceso:** cada integrante administra y protege sus credenciales de GitHub, Jira, Vercel y Google Cloud. Los secretos de producción (tokens de Mercado Pago, API keys) se almacenan únicamente como variables de entorno en Vercel y no son descargables ni versionados.

### Ubicación física de los documentos y líneas base

- **Almacenamiento de Archivos:** los documentos de gestión se custodian en Google Drive.
- **Documentos, Metadatos y Líneas Base:** la información estructurada se mantiene en Google Drive, mientras que los activos de configuración, el código y la documentación técnica versionada (`docs/`, `CHANGELOG.md`) están centralizados en GitHub para su trazabilidad.

---

# 3. Políticas y Directivas de la Configuración

## 3.1 Propiedad y Modificación de las Líneas Base

Ningún miembro del equipo puede modificar, alterar o reemplazar elementos de una línea base establecida sin una solicitud formal en Jira y la aprobación explícita del Comité de Control de Cambios (CCC).

**Excepción de Emergencia:** ante fallos críticos en producción (caída del backend, errores en la pasarela de pagos, indisponibilidad de la base de datos), el Gestor de la Configuración podrá aplicar un parche de emergencia y redesplegar (`vercel --prod`), notificando de inmediato al CCC para su regularización en un plazo no mayor a 12 horas.

## 3.2 Estrategia de Ramificación y Aislamiento de Código

Está estrictamente prohibido realizar commits directos sobre la rama de producción (`main`). El trabajo se integra en `develop` y se promociona a `main` mediante Pull Request. Para que un PR sea fusionado requiere obligatoriamente:

1. La aprobación de un revisor técnico par (auditoría cruzada).
2. La aprobación y firma final del Gestor de la Configuración, quien verificará la ausencia de conflictos en el repositorio.

Antes de la revisión humana, el código debe pasar por las herramientas de supervisión asistida por IA (GitHub Copilot / Claude Code) para optimización de sintaxis y revisión de seguridad de las entradas.

## 3.3 Gobierno de Integración

Toda modificación que afecte la interacción entre componentes (contratos de la API REST, esquema Prisma, integraciones con Mercado Pago/Google/Gemini) deberá evaluarse antes de su integración a la línea base. Los cambios deben mantener la compatibilidad entre el frontend, los servicios del backend y las estructuras de datos.

En particular, los cambios de esquema de base de datos en producción se aplican de forma controlada (migraciones SQL documentadas en `docs/CAMBIOS.md`), dado que las credenciales de Neon no son extraíbles desde Vercel; cualquier mecanismo temporal de migración debe protegerse con clave y **eliminarse inmediatamente después de su uso**.

Ningún componente podrá integrarse a la rama principal sin haber sido revisado, documentado y validado por el equipo responsable.

## 3.4 Custodia e Integridad de Artefactos

Al finalizar cada Sprint, el Bibliotecario de Configuración verificará que los artefactos del proyecto — código fuente, esquema de datos, documentación técnica (`docs/`), registros de cambios (`CHANGELOG.md`, `docs/CAMBIOS.md`) y configuración de despliegue (`vercel.json`) — se encuentren actualizados, almacenados en los repositorios oficiales y alineados con la versión aprobada de la línea base.

---

# 4. Programa de la Gestión de Configuración

Este programa establece los procedimientos para identificar, controlar y mantener los elementos de configuración del proyecto QUIOSKO, bajo la supervisión del Gestor de Configuración.

## 4.1 Identificación de la Configuración

### 4.1.1 Elementos de Configuración

Los elementos bajo control estricto de configuración, supervisados por el CCC, abarcan:

- Repositorio del proyecto en GitHub (frontend `src/` y backend `backend/`).
- Componentes, páginas y servicios desarrollados en React y TypeScript (incluidos `ChatWidget`, `DeliveryMapPicker`, `GoogleSignInButton`, `RequireAdmin`).
- Rutas de la API REST del backend (`products`, `categories`, `orders`, `auth`, `chat`, `payments`) y su punto de entrada serverless (`backend/api/index.ts`).
- Esquema de datos Prisma (`backend/prisma/schema.prisma`) y las migraciones SQL aplicadas en producción.
- Scripts de inicialización (`seed.ts`, `seedAdmin.ts`).
- Configuraciones de entorno y despliegue (`vercel.json` de ambos proyectos, variables de entorno en Vercel, `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`).
- Casos de prueba y evidencias de validación (`docs/casos_de_prueba.md`, `docs/informe_resultados_pruebas.md`).
- Documentación técnica (este plan, `docs/SCM.md`, `docs/DESPLIEGUE.md`, `docs/CAMBIOS.md`, `README.md`, `CHANGELOG.md`).
- Diseños de interfaz de usuario y recursos gráficos (`prototipos/`, `public/`).

### 4.1.2 Nomenclatura de Elementos

Para garantizar la uniformidad y mitigar errores en las integraciones, se aplican las siguientes convenciones obligatorias:

- **Gestión de Cambios (Commits):** se utiliza el estándar **Conventional Commits**, con ámbito opcional del módulo afectado — p. ej., `feat(pagos): integración Mercado Pago`, `fix(delivery): cargar Google Maps en modo clásico`:
  - `feat`: nuevas funcionalidades.
  - `fix`: corrección de fallos o errores.
  - `docs`: actualizaciones de documentación.
  - `refactor`: mejoras internas sin cambio de comportamiento externo.
  - `chore`: mantenimiento (dependencias, limpieza, configuración).
- **Trazabilidad con Jira:** los commits asociados a historias referencian el ticket (`SCRUM-XX`).
- **Estandarización de Componentes:** los nombres de archivos de código, configuración y esquemas mantienen nomenclatura en idioma inglés (PascalCase para componentes React, camelCase para módulos), para evitar conflictos en las integraciones.

### 4.1.3 Elementos de la Línea Base del Proyecto

| FASE | Sprint 1 |
|---|---|
| **Elemento** | Vistas del Quiosco con datos de prueba (v1.0.0). |
| **Incremento de Valor** | El cliente puede recorrer el menú, armar un carrito y el personal visualiza órdenes de ejemplo; se valida el flujo completo de UI sin depender de infraestructura. |
| **Alineación Técnica** | Proyecto Vite + React 18 + TypeScript con React Router v6; 7 vistas (quiosco, cocina y panel admin) sobre `mockData.ts`; definición de estándares de commits y PRs. |
| **Área** | Configuración / Frontend |

| FASE | Sprint 2 |
|---|---|
| **Elemento** | Integración Full-Stack: API REST y persistencia (v2.0.0). |
| **Incremento de Valor** | Los datos son reales y persistentes: productos, categorías y órdenes sobreviven al reinicio; el admin gestiona el catálogo con imágenes. |
| **Alineación Técnica** | Backend Express + Prisma; CRUD de productos con Multer (imágenes), endpoints de categorías y órdenes; paginación y búsqueda server-side; 49 casos de prueba documentados. |
| **Área** | Configuración / Backend / Base de Datos / QA |

| FASE | Sprint 3 |
|---|---|
| **Elemento** | Despliegue en producción: Vercel serverless + PostgreSQL Neon (v3.0.0). |
| **Incremento de Valor** | El sistema queda públicamente accesible con URLs oficiales; el equipo valida el producto en condiciones reales. |
| **Alineación Técnica** | Adaptación del backend a función serverless (`api/index.ts`), migración de MySQL a PostgreSQL (Neon) con conexión pooled, dos proyectos Vercel, variables de entorno de producción, seed con datos reales y guía `docs/DESPLIEGUE.md`. |
| **Área** | Configuración / DevOps / Infraestructura |

| FASE | Sprint 4 |
|---|---|
| **Elemento** | Autenticación, Roles y Gestión de Categorías. |
| **Incremento de Valor** | Los clientes se registran e inician sesión (incluso con Google); solo el administrador accede al panel; el catálogo se organiza con categorías administrables y precios en soles. |
| **Alineación Técnica** | Campo `User.role` (ADMIN/CLIENT), guards `RequireAuth`/`RequireAdmin`, verificación server-side del token de Google (`/api/auth/google`), CRUD de categorías con validaciones, `formatCurrency` en `es-PE`, seed del admin. |
| **Área** | Configuración / Frontend / Backend / Seguridad |

| FASE | Sprint 5 |
|---|---|
| **Elemento** | Ciclo de Vida de Órdenes y "Mis Pedidos". |
| **Incremento de Valor** | El cliente sigue sus pedidos en tiempo casi real (en preparación → listo → entregado) y el admin finaliza entregas, manteniendo limpio el display de cocina. |
| **Alineación Técnica** | Asociación `Order.userId`, estado `finalizedAt`, endpoints `GET /api/orders/mine` y `PUT /api/orders/:id/finalize`, auto-refresco cada 5 s, mejoras de UI (escala 125%, feedback de acciones). |
| **Área** | Configuración / Frontend / Backend |

| FASE | Sprint 6 |
|---|---|
| **Elemento** | Chatbot con IA (Google Gemini). |
| **Incremento de Valor** | Los clientes reciben recomendaciones y precios actualizados en un chat flotante, reduciendo fricción en la decisión de compra. |
| **Alineación Técnica** | Endpoint proxy `POST /api/chat` (API key solo en backend), modelo `gemini-2.5-flash`, inyección del menú real desde la BD en cada consulta, prompt restringido al dominio de la aplicación, widget `ChatWidget.tsx`. |
| **Área** | Configuración / IA / Frontend / Backend |

| FASE | Sprint 7 |
|---|---|
| **Elemento** | Delivery con Google Maps y Cobro por Kilómetro. |
| **Incremento de Valor** | El cliente elige recojo o delivery, marca su ubicación en el mapa y conoce y acepta el cargo antes de confirmar; el admin recibe dirección, distancia y enlace al mapa. |
| **Alineación Técnica** | Maps JavaScript API (carga clásica del script; div exclusivo para el mapa para evitar conflictos con React), Haversine × 1.3, tarifa S/ 1.50/km, radio 10 km, campos de delivery en `Order`, componente `DeliveryMapPicker.tsx`. |
| **Área** | Configuración / Frontend / Backend / Integraciones |

| FASE | Sprint 8 |
|---|---|
| **Elemento** | Pasarela de Pagos — Mercado Pago Checkout Pro. |
| **Incremento de Valor** | El negocio cobra en línea (tarjetas, Yape); solo se registran órdenes con pago aprobado, eliminando pedidos falsos y manipulación de montos. |
| **Alineación Técnica** | Endpoints `payments/create` (recalcula precios en servidor), `payments/confirm` (verificación con MP, idempotente por `paymentId` único) y `payments/webhook` (respaldo); restauración del carrito ante pagos fallidos; badge "✓ Pagado" en admin; secreto `MP_ACCESS_TOKEN` en Vercel. |
| **Área** | Configuración / Backend / Seguridad / Integraciones |

| FASE | Sprint 9 (planificado) |
|---|---|
| **Elemento** | Endurecimiento de Seguridad y Estabilización. |
| **Incremento de Valor** | Plataforma lista para operación sostenida: credenciales rotadas y restringidas, cuenta admin con contraseña definitiva, defectos conocidos corregidos. |
| **Alineación Técnica** | Rotación del Access Token de Mercado Pago, restricción por dominio de la API key de Google Maps, autorización de orígenes del Client ID de Google, cambio de contraseña del admin, cierre de defectos abiertos y regresión completa de los casos de prueba. |
| **Área** | Configuración / Seguridad / QA |

## 4.2 Control de Configuración

Esta sección establece los procedimientos formales para gestionar el ciclo de vida de los cambios en QUIOSKO, coordinado a través de **Jira, GitHub y Slack**.

### 4.2.1 Solicitud de Cambios

- **Registro de Requerimientos:** las modificaciones o reportes de fallos se registran formalmente en Jira.
- **Planificación:** las solicitudes se evalúan y priorizan dentro de los Sprints del equipo.
- **Trazabilidad:** se clasifican según su naturaleza (`feat`, `fix`, `docs`, `refactor`, `chore`) para mantener trazabilidad transparente en GitHub, referenciando el ticket Jira correspondiente.
- **Resguardo Documental:** los Bibliotecarios aseguran que cada cambio significativo esté respaldado por la actualización inmediata de la documentación (`CHANGELOG.md`, `docs/CAMBIOS.md` y documentos de diseño).

### 4.2.2 Aprobación de Cambios

- **Autoridad de Decisión:** el CCC posee la autoridad principal para aprobar cambios estructurales y modificaciones de las líneas base.
- **Regla de Gobierno (Contrato Primero):** para cambios que afecten la interoperabilidad frontend–backend, primero se actualiza el endpoint y su contrato (tipos de `src/services/api.ts` y esquema Prisma), luego la documentación y finalmente el frontend consume el contrato resultante.
- **Cambios de Alto Riesgo:** las modificaciones que involucren **pagos, esquema de base de datos en producción o credenciales** requieren evaluación explícita del CCC y prueba previa en entorno de pruebas (sandbox de Mercado Pago / BD local) antes del despliegue.
- **Validación Técnica:** el Gestor de la Configuración valida que los cambios respeten la separación de capas (presentación / API / datos) y no introduzcan secretos en el repositorio.

### 4.2.3 Implementación de Cambios

Una vez aprobado, el cambio se ejecuta siguiendo los estándares de calidad técnica de QUIOSKO:

- **Flujo de Ramas y Pull Requests:** todo desarrollo sigue la estrategia de ramificación con `develop` como rama de integración y `main` como producción. Está prohibida la integración directa sobre las ramas principales; todo cambio requiere PR con revisión de un miembro ajeno al desarrollo.
- **Supervisión de Código Asistida por IA:** se emplean herramientas como GitHub Copilot y Claude Code para auditoría y optimización de sintaxis, calidad y seguridad, previa a la revisión humana.
- **Protocolo de Pruebas:** los cambios se validan contra los casos de prueba documentados (`docs/casos_de_prueba.md`) y pruebas manuales dirigidas en Chrome/Edge; las integraciones de pago se prueban en el sandbox de Mercado Pago.
- **Cambios de Base de Datos:** las alteraciones de esquema se definen primero en `schema.prisma`, se aplican localmente con Prisma y en producción mediante migraciones SQL documentadas y controladas.
- **Despliegue y Trazabilidad:** el frontend se despliega vía CI/CD de Vercel al fusionar en la rama correspondiente; el backend se redespliega de forma controlada con `vercel --prod` por el Gestor de la Configuración. Cada despliegue se verifica con el health check (`GET /api/health`) y smoke tests del flujo crítico (pedido + pago).

## 4.3 Estado de la Configuración

El Gestor de la Configuración es el responsable directo de asegurar la visibilidad técnica y el control del estado del sistema.

### 4.3.1 Tipos de Informes y Frecuencia

- **Informe de Evolución de Defectos:** generado al cierre de cada Sprint. Detalla desviaciones operativas, fallos en integraciones externas (pagos, mapas, IA) y regresiones, asignando prioridades, severidad y responsables (base: `docs/informe_resultados_pruebas.md`).
- **Registro de Cambios de Sesión:** cada bloque significativo de trabajo se documenta en `docs/CAMBIOS.md` y `CHANGELOG.md` (formato Keep a Changelog + SemVer).
- **Monitoreo de Producción:** revisión continua de los logs de funciones serverless en el panel de Vercel y del estado del servicio mediante `GET /api/health`.

### 4.3.2 Elementos de la Línea Base a Revisar

- **Estado de Órdenes:** monitoreo de la transición de las órdenes por sus estados (pendiente → lista → finalizada) y de la consistencia de los datos de delivery y pago (`paymentStatus`, `paymentId`).
- **Integridad de Datos:** revisión de la consistencia relacional en PostgreSQL (productos-categorías, órdenes-ítems, órdenes-usuarios) y de la unicidad de pagos.
- **Configuración de Integraciones:** validación periódica de las credenciales y cuotas de Gemini, Google Maps/Identity y Mercado Pago, y de las variables de entorno de ambos proyectos Vercel.

### 4.3.3 Obtención, Almacenamiento y Procesamiento

- **Obtención:** la información se extrae de los entornos de despliegue en Vercel (logs y métricas), de Neon (estado de la BD) y de los paneles de los servicios externos (Mercado Pago, Google Cloud).
- **Validación Técnica:** los resultados de la ejecución de los casos de prueba confirman que los cambios en GitHub no afectan la estabilidad de la línea base aprobada.
- **Persistencia:** las órdenes, pagos y usuarios se persisten en PostgreSQL, lo que permite auditorías retrospectivas por parte del CCC (p. ej., verificación de órdenes contra pagos aprobados en MP).

## 4.4 Informes y Auditorías

### 4.4.1 Informes de Gestión

- **Informe de Evolución de Defectos:** detalla fallos por módulo (catálogo, órdenes, delivery, pagos, chatbot) con severidad y prioridad de corrección.
- **Métricas de Calidad:** porcentaje de casos de prueba superados por versión (v2.0.0: 44/49 = 89.8%), defectos abiertos/cerrados y pendientes de seguridad.
- **Tablas de Estado de Defectos:** visualizaciones que cruzan el estado de cada defecto con su severidad y prioridad.

### 4.4.2 Auditorías de Configuración

Las auditorías son realizadas por los Gestores de la Configuración al final de cada Sprint, antes de establecer una nueva línea base oficial:

- **Alcance:** cumplimiento del control de acceso por roles (solo ADMIN en el panel), integridad del flujo de pagos (la orden existe solo con pago aprobado y verificado), ausencia de secretos en el repositorio y consistencia entre `schema.prisma` y la BD de producción.
- **Verificación:** los Bibliotecarios apoyan la ejecución de la regresión de casos de prueba y la revisión de la documentación versionada, asegurando que `CHANGELOG.md`, `docs/CAMBIOS.md` y este plan reflejen el estado real del sistema.

---

# 5. Calendario

Las actividades de Gestión de Configuración (GC) se integran con el marco Scrum y los hitos del proyecto.

## 5.1 Hitos de Gestión de Configuración

- **Definición de Línea Base:** al inicio de cada fase principal (Vistas, Integración Full-Stack, Despliegue en la Nube, Funcionalidades de Negocio: auth/delivery/pagos/IA, y Estabilización), para estabilizar los elementos de configuración antes de nuevas iteraciones.
- **Implementación de Control de Cambios:** permanente desde el primer sprint, con Jira para el registro de solicitudes y Conventional Commits para la trazabilidad del código.
- **Auditorías de Configuración:** al finalizar cada iteración, después de la regresión de casos de prueba y antes de la creación de una nueva línea base oficial.

## 5.2 Cronograma de Actividades

| Fase | Iteración | Elemento / Hito de Configuración | Hito |
|---|---|---|---|
| 1 | Sprint 1 | Vistas del quiosco con datos de prueba (v1.0.0) | 19/05/2026 |
| 2 | Sprint 2 | Integración Full-Stack: API REST + persistencia (v2.0.0) | 30/06/2026 |
| 3 | Sprint 3 | Despliegue Vercel serverless + PostgreSQL Neon (v3.0.0) | 02/07/2026 |
| 4 | Sprint 4 | Autenticación, roles, Google Sign-In, CRUD categorías, moneda S/ | 07/07/2026 |
| 5 | Sprint 5 | Ciclo de vida de órdenes y "Mis Pedidos" | 07/07/2026 |
| 6 | Sprint 6 | Chatbot con IA (Gemini) | 07/07/2026 |
| 7 | Sprint 7 | Delivery con Google Maps y cobro por km | 07/07/2026 |
| 8 | Sprint 8 | Pasarela de pagos Mercado Pago (Checkout Pro) | 07/07/2026 |
| 9 | Sprint 9 | Endurecimiento de seguridad y estabilización | Planificado |

---

# 6. Mantenimiento del Plan de Gestión de la Configuración

Esta sección describe los procedimientos administrativos para asegurar que el Plan de Gestión de Configuración de QUIOSKO permanezca actualizado y refleje fielmente la evolución técnica, operativa y funcional del proyecto.

## 6.1 Responsabilidad de Monitoreo

La supervisión del cumplimiento de las actividades descritas en este plan recae directamente sobre el **Comité de Control de Cambios**, responsable de asegurar la integridad de todos los activos del sistema y de validar que los procesos de gestión se ejecuten bajo los estándares estipulados.

## 6.2 Frecuencia de Modificaciones

- **Revisiones Obligatorias:** el plan se revisará y modificará al comienzo de cada fase principal del ciclo de vida del proyecto.
- **Actualizaciones Extraordinarias:** se realizarán ajustes inmediatos ante cambios críticos en el entorno tecnológico base, tales como cambios en las plataformas de infraestructura y despliegue (Vercel, Neon), en las APIs de servicios externos (Mercado Pago, Google Maps/Identity) o actualizaciones mayores del modelo de IA (Gemini).

## 6.3 Evaluación y Aprobación de Cambios

- **Evaluación Técnica:** toda propuesta de modificación de este plan será evaluada por el CCC, analizando su impacto sobre la arquitectura, la seguridad (manejo de secretos, integridad de pagos, control de acceso por roles) y la operación en producción.
- **Aprobación Final:** cualquier cambio propuesto requerirá la validación y el consenso del comité para incorporarse oficialmente como una nueva versión del plan.

## 6.4 Comunicación y Distribución

- **Comunicación Interna:** los cambios aprobados se comunican formalmente al equipo durante las Reuniones Diarias (Dailys), coordinadas por los canales oficiales de Slack.
- **Trazabilidad de Tareas:** cada actualización aprobada se registra en Jira, permitiendo al Gestor de la Configuración un seguimiento auditable de su implementación.
- **Distribución por Roles:** el Bibliotecario distribuye el plan actualizado mediante su resguardo en el repositorio oficial de documentación técnica en GitHub (`docs/`), garantizando que todo el equipo trabaje con la versión vigente.
