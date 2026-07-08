# REDA RESTAURANT

# Informe de la Línea Base del Proyecto

## Versión 5.0.0

### Historia de revisiones

| Fecha | Versión | Descripción | Autor |
|---|---|---|---|
| 20/05/2026 | 1.0 | Registro de observaciones identificadas durante la implementación inicial del backend y acciones correctivas asociadas a la integración de productos y categorías. | Cesar Christopher Rosales Rojas |
| 07/06/2026 | 2.0 | Registro de observaciones identificadas durante la consolidación del backend y la implementación de la base de datos local MySQL, incluyendo acciones correctivas asociadas a persistencia, conectividad y administración de datos. | Cesar Christopher Rosales Rojas |
| 07/07/2026 | 3.0 | Registro de observaciones identificadas durante la implementación del chatbot con IA, el sistema de roles y autenticación con Google, el módulo de delivery con Google Maps y la pasarela de pagos Mercado Pago, incluyendo acciones correctivas asociadas a la integración de servicios externos, la seguridad del flujo de pagos y la estabilidad de la interfaz. | Cesar Christopher Rosales Rojas |

---

## Contenido

1. Errores encontrados
   - 1.1. Fallo de inicialización del mapa de Google Maps en el módulo de delivery
   - 1.2. Caída de la aplicación (pantalla en blanco) por conflicto entre React y Google Maps
   - 1.3. Indisponibilidad del modelo de IA configurado para el chatbot
   - 1.4. Riesgo de manipulación de montos en el flujo de pago
   - 1.5. Exposición de credenciales de la pasarela de pagos durante la configuración
   - 1.6. Escalado incorrecto de la interfaz en pantallas de escritorio
2. Acciones Correctivas
   - 2.1. Acción correctiva asociada a la carga del mapa de Google Maps
   - 2.2. Acción correctiva asociada al aislamiento del contenedor del mapa
   - 2.3. Acción correctiva asociada al modelo del chatbot
   - 2.4. Acción correctiva asociada a la validación de pagos en el servidor
   - 2.5. Acción correctiva asociada a la gestión de credenciales
   - 2.6. Acción correctiva asociada al escalado de la interfaz

---

# 1. Errores encontrados

Durante la verificación de la línea base correspondiente al **Sprint 7** del proyecto Reda Restaurant se identificaron diversas observaciones relacionadas con la integración de servicios externos (Google Maps, Google Identity, Google Gemini y Mercado Pago), la seguridad del flujo de pagos y la estabilidad de la interfaz de usuario.

Estas observaciones fueron registradas durante la implementación de las nuevas funcionalidades del sprint: chatbot con inteligencia artificial, roles de usuario (ADMIN/CLIENT) con inicio de sesión mediante Google, módulo de delivery con cálculo de tarifa por kilómetro y pasarela de pagos Mercado Pago (Checkout Pro), donde la orden se registra únicamente cuando el pago está aprobado.

## 1.1. Fallo de inicialización del mapa de Google Maps en el módulo de delivery

**Referencia de verificación:** Carga del script de Maps JavaScript API con el parámetro `loading=async` en el componente `DeliveryMapPicker.tsx`.

Se identificó que, al cargar la librería de Google Maps en modo asíncrono (`loading=async`), el mapa del módulo de delivery nunca llegaba a inicializarse, impidiendo que el cliente seleccionara su ubicación de entrega.

### 1.1.1. Reda Restaurant

Reda Restaurant – Módulo de Delivery.

### 1.1.2. Área del producto

Frontend / Integración Google Maps.

### 1.1.3. Versión

- Número de Versión vigente: Sprint 7
- Número de Versión presente: Sprint 7

### 1.1.4. Fecha de la Versión

- Fecha de la Versión vigente: 07/07/2026
- Fecha de la Versión presente: 07/07/2026

### 1.1.5. Responsable del producto

Responsable del producto y del seguimiento de la línea base: Cesar Christopher Rosales Rojas

## 1.2. Caída de la aplicación (pantalla en blanco) por conflicto entre React y Google Maps

**Referencia de verificación:** Error `removeChild` en consola al renderizar mensajes dentro del contenedor controlado por Google Maps.

Se detectó que React renderizaba elementos hijos dentro del mismo `div` que Google Maps manipula directamente en el DOM, lo que provocaba el error `Failed to execute 'removeChild' on 'Node'` y dejaba la aplicación en pantalla en blanco.

### 1.2.1. Reda Restaurant

Reda Restaurant – Módulo de Delivery.

### 1.2.2. Área del producto

Frontend / Renderizado de Componentes.

### 1.2.3. Versión

- Número de Versión vigente: Sprint 7
- Número de Versión presente: Sprint 7

### 1.2.4. Fecha de la Versión

- Fecha de la Versión vigente: 07/07/2026
- Fecha de la Versión presente: 07/07/2026

### 1.2.5. Responsable del producto

Responsable del producto y del seguimiento de la línea base: Cesar Christopher Rosales Rojas

## 1.3. Indisponibilidad del modelo de IA configurado para el chatbot

**Referencia de verificación:** Respuestas de error por cuota en las llamadas al modelo `gemini-2.0` desde el endpoint `POST /api/chat`.

Durante las pruebas del asistente virtual se identificó que el modelo de Google Gemini inicialmente configurado no disponía de cuota en la cuenta del proyecto, impidiendo que el chatbot respondiera a las consultas de los clientes.

### 1.3.1. Reda Restaurant

Reda Restaurant – Chatbot con IA.

### 1.3.2. Área del producto

Backend / Integración Google Gemini.

### 1.3.3. Versión

- Número de Versión vigente: Sprint 7
- Número de Versión presente: Sprint 7

### 1.3.4. Fecha de la Versión

- Fecha de la Versión vigente: 07/07/2026
- Fecha de la Versión presente: 07/07/2026

### 1.3.5. Responsable del producto

Responsable del producto y del seguimiento de la línea base: Cesar Christopher Rosales Rojas

## 1.4. Riesgo de manipulación de montos en el flujo de pago

**Referencia de verificación:** Creación de la preferencia de pago de Mercado Pago a partir de los montos enviados por el cliente.

Se identificó que, si la preferencia de pago se construía con los precios y el cargo de delivery calculados en el navegador, un usuario podía manipular dichos valores antes de enviarlos, generando pagos por montos distintos a los reales.

### 1.4.1. Reda Restaurant

Reda Restaurant – Pasarela de Pagos.

### 1.4.2. Área del producto

Backend / Seguridad / Mercado Pago.

### 1.4.3. Versión

- Número de Versión vigente: Sprint 7
- Número de Versión presente: Sprint 7

### 1.4.4. Fecha de la Versión

- Fecha de la Versión vigente: 07/07/2026
- Fecha de la Versión presente: 07/07/2026

### 1.4.5. Responsable del producto

Responsable del producto y del seguimiento de la línea base: Cesar Christopher Rosales Rojas

## 1.5. Exposición de credenciales de la pasarela de pagos durante la configuración

**Referencia de verificación:** Access Token de Mercado Pago visible durante el proceso de configuración del entorno.

Durante la configuración de la integración con Mercado Pago, el Access Token quedó expuesto fuera del gestor de variables de entorno, lo que representa un riesgo de uso no autorizado de la cuenta de cobros.

### 1.5.1. Reda Restaurant

Reda Restaurant – Gestión de Credenciales.

### 1.5.2. Área del producto

Infraestructura / Variables de Entorno / Seguridad.

### 1.5.3. Versión

- Número de Versión vigente: Sprint 7
- Número de Versión presente: Sprint 7

### 1.5.4. Fecha de la Versión

- Fecha de la Versión vigente: 07/07/2026
- Fecha de la Versión presente: 07/07/2026

### 1.5.5. Responsable del producto

Responsable del producto y del seguimiento de la línea base: Cesar Christopher Rosales Rojas

## 1.6. Escalado incorrecto de la interfaz en pantallas de escritorio

**Referencia de verificación:** Visualización reducida de la aplicación con Windows al 100 % de escalado; aparición de scroll adicional al aplicar `zoom`.

Se observó que la interfaz se mostraba demasiado pequeña en monitores de escritorio y que la primera corrección aplicada (propiedad CSS `zoom`) generaba desplazamiento adicional y desalineaba la barra de navegación.

### 1.6.1. Reda Restaurant

Reda Restaurant – Interfaz de Usuario.

### 1.6.2. Área del producto

Frontend / Estilos / Responsividad.

### 1.6.3. Versión

- Número de Versión vigente: Sprint 7
- Número de Versión presente: Sprint 7

### 1.6.4. Fecha de la Versión

- Fecha de la Versión vigente: 07/07/2026
- Fecha de la Versión presente: 07/07/2026

### 1.6.5. Responsable del producto

Responsable del producto y del seguimiento de la línea base: Cesar Christopher Rosales Rojas

---

# 2. Acciones Correctivas

Las siguientes acciones se documentan para restablecer o preservar la consistencia de los elementos de configuración identificados durante la verificación de la línea base del sprint correspondiente.

## 2.1. Acción correctiva asociada a la carga del mapa de Google Maps

Se reemplazó la carga asíncrona del script de Maps JavaScript API por la **carga clásica**, garantizando que la librería esté disponible al momento de inicializar el mapa. Con esta acción el componente `DeliveryMapPicker.tsx` inicializa correctamente el mapa, el marcador arrastrable y el cálculo de distancia (fórmula de Haversine × factor de ruta 1.3, tarifa de S/ 1.50 por km y radio máximo de 10 km).

## 2.2. Acción correctiva asociada al aislamiento del contenedor del mapa

Se asignó a Google Maps un **`div` exclusivo** que React no vuelve a renderizar, y los mensajes de estado (carga, errores, avisos) se muestran como **capas superpuestas** independientes. Esta acción eliminó el error `removeChild` y la pantalla en blanco, garantizando la estabilidad del módulo de delivery.

## 2.3. Acción correctiva asociada al modelo del chatbot

Se configuró el modelo **`gemini-2.5-flash`** mediante la variable de entorno `GEMINI_MODEL`, verificando la disponibilidad de cuota en la cuenta del proyecto. Adicionalmente, la clave `GEMINI_API_KEY` se mantiene únicamente en el backend, que actúa como **proxy seguro** (`POST /api/chat`), y el asistente recibe el menú real desde la base de datos en cada consulta, garantizando precios siempre actualizados.

## 2.4. Acción correctiva asociada a la validación de pagos en el servidor

Se implementó el endpoint `POST /api/payments/create` de modo que la preferencia de pago **recalcula todos los precios desde la base de datos** y re-valida el cargo de delivery en el servidor, ignorando los montos enviados por el cliente. Complementariamente, `POST /api/payments/confirm` verifica el pago directamente contra Mercado Pago (`GET /v1/payments/:id`) antes de registrar la orden, con **idempotencia** garantizada mediante el campo único `paymentId`, y el webhook `POST /api/payments/webhook` actúa como respaldo si el cliente no retorna al sitio. Con esta acción, la orden se registra únicamente cuando el pago está aprobado y por los montos correctos.

## 2.5. Acción correctiva asociada a la gestión de credenciales

Se estableció la gestión de todas las credenciales sensibles (`MP_ACCESS_TOKEN`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`) exclusivamente como **variables de entorno del backend en Vercel**, y se programó la **rotación del Access Token de Mercado Pago** expuesto durante la configuración. Asimismo, se documentó la restricción de la API key de Google Maps por dominio (HTTP referrers) y la autorización de orígenes del Client ID de Google en Google Cloud Console.

## 2.6. Acción correctiva asociada al escalado de la interfaz

Se reemplazó la propiedad `zoom` por el ajuste del **tamaño de fuente raíz** (`font-size: 125 %` en pantallas ≥ 1024 px), aprovechando que la interfaz utiliza unidades `rem`. Esta acción permite que la aplicación se visualice al tamaño correcto con Windows al 100 % de escalado, sin scroll adicional y con la barra de navegación ocupando todo el ancho; en dispositivos móviles el ajuste no se aplica.
