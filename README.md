# Sitio del taller electromecánico

Landing responsive en español con contenido público leído desde PostgreSQL y checkout alojado por Mercado Pago Checkout Pro. El proyecto no incluye panel de administración: los datos se completan directamente en PostgreSQL y las consultas se guardan en la base.

## Requisitos y arranque

- Node.js 20 o superior y npm.
- PostgreSQL 14 o superior.
- Una cuenta y una aplicación de Mercado Pago para habilitar pagos.

1. Copiá `.env.example` a `.env.local` y completá la conexión de PostgreSQL. Conservá las credenciales solo en archivos de entorno locales o en el gestor de secretos del hosting.
2. Aplicá las migraciones en orden: `001_initial_schema.sql`, `002_workshop_content.sql`, `003_workshop_identity.sql`, `004_detailed_service_catalog.sql` y `005_video_barcode_admin.sql`. En PowerShell, ejecutá `psql $env:DATABASE_URL -f db/migrations/001_initial_schema.sql` y repetí para cada archivo. En Bash, usá `psql "$DATABASE_URL" -f db/migrations/001_initial_schema.sql` y repetí para cada archivo.
3. Instalá y ejecutá: `npm install`, luego `npm run dev`.
4. Abrí `http://localhost:3000`.

La página puede mostrarse sin conectar la base; en ese caso los campos del negocio aparecen como pendientes y los formularios y pagos responden que la base aún no está configurada. Si la conexión deja de responder, la página muestra un aviso temporal distinto del estado sin configurar. La conexión y la migración son necesarias para guardar consultas, mostrar el contenido publicado y crear compras.

Si el proveedor PostgreSQL exige TLS, configurá `DATABASE_SSL=true`.

El servidor de desarrollo usa `.next-dev/` y la compilación de producción usa `.next/`. Esto evita que `npm run build` sobrescriba los estilos y archivos JavaScript de una sesión de desarrollo activa. Si una pestaña quedó abierta durante un fallo anterior de carga de archivos, recargala con Ctrl+F5.

## Completar el contenido real

Después de tener la migración aplicada, editá la única fila inicial de `site_settings` (id `1`) con los datos aprobados por el dueño. La tabla incluye nombre, descripción, presentación del taller, logotipo, colores, WhatsApp, teléfono, correo, dirección, horarios, redes y enlace de mapa. Los textos iniciales identifican expresamente información pendiente; reemplazalos antes de publicar.

El logo entregado se encuentra en `public/logo-taller-irigaray.png` y se muestra en el encabezado y el pie de página. Para cambiarlo, reemplazá esa imagen o actualizá `site_settings.logo_url`. Las fotografías se cargan en el servicio de archivos elegido para el despliegue; guardá URL HTTPS públicas y estables en `site_settings.hero_image_url` (portada), `site_settings.about_image_url` (presentación) o `image_url` (servicios y repuestos). Las ilustraciones de `public/images/services/` son arte representativo de cada servicio, no fotografías del taller ni de trabajos realizados. Están optimizadas en WebP (ancho máximo 1280 px), usan carga diferida y sus URL locales están en el catálogo. Reemplazá cada archivo por una ilustración/foto autorizada del mismo tema o editá `services.image_url`. Las fotos del taller deben ir en `hero_image_url` y `about_image_url`; no uses las ilustraciones como prueba de trabajos reales. La instalación de sistemas de gas se publica sin identificar GNC o GLP hasta que el taller confirme el tipo. La tarjeta de venta de repuestos es ilustrativa: no crea productos, stock ni precios; el catálogo solo debe mostrar fotos reales de los productos cuando existan.

Servicios, categorías, repuestos y preguntas frecuentes se insertan en sus tablas. Los servicios, repuestos y FAQ se muestran solo con `is_published = true`; los testimonios también permanecen ocultos hasta su publicación. Para habilitar un botón de compra, cargá un precio real y marcá `availability = 'disponible'`. Un producto sin precio o disponibilidad confirmada solo permite consultar. No se incluyeron productos, precios, existencia, preguntas, servicios específicos ni testimonios inventados.

Las consultas del formulario se guardan en `inquiries`; no se incluye envío automático de correo.

## Catálogo público y administración

`/repuestos` publica los productos confirmados en PostgreSQL y permite filtrar por nombre, código de barras o categoría. Un precio solo aparece cuando se cargó un precio real; el catálogo no ofrece compra ni checkout. Los enlaces invitan a consultar al taller.

`/admin` es un área protegida con usuario único por variables de entorno. Configurá `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` y `ADMIN_SESSION_SECRET` en `.env.local` o en los secretos del hosting. Generá el hash interactivo sin guardar la contraseña en el repositorio con `.\scripts\generate-admin-hash.ps1`; exige una contraseña de 14 caracteres o más. Generá el secreto con `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. La sesión usa cookie HTTP-only, SameSite estricto y vence a las 8 horas. La base conserva solo intentos recientes como hash del origen para limitar intentos de acceso. Aplicá la migración 005 antes de iniciar sesión.

El administrador puede agregar o editar productos, código de barras, categoría, descripción, imagen, precio opcional, disponibilidad y publicación. El escaneo usa la cámara trasera mediante ZXing; el navegador requiere HTTPS o localhost y permiso explícito. Si no hay cámara, el campo admite ingreso y búsqueda manual. No se incluyen productos de ejemplo.

Para sumar el video de presentación del dueño, alojá el MP4 autorizado en un origen estable y configurá `site_settings.hero_video_url` con su URL HTTPS. `site_settings.hero_video_poster_url` acepta una URL HTTPS opcional para la miniatura. Si se dejan vacíos, la portada conserva el cuadro “Próximamente”. No hace falta cambiar el código ni se agrega una grabación ficticia. El logo y las fotos se completan siguiendo la sección anterior; el cuadro de video es independiente de la fotografía de portada.

## Mercado Pago: modo de prueba

1. Creá o seleccioná una aplicación en [Tus integraciones de Mercado Pago](https://www.mercadopago.com.ar/developers/panel/app).
2. En las credenciales de prueba copiá el Access Token de prueba en `MP_ACCESS_TOKEN` y la clave secreta de Webhooks en `MP_WEBHOOK_SECRET`. Configurá `SITE_URL` con la URL pública HTTPS del servidor que probará los retornos y recibirá webhooks. Un servidor local no puede recibir webhooks del proveedor directamente sin una URL pública de túnel HTTPS.
3. En Webhooks, configurá `https://TU-DOMINIO/api/payments/webhook` y habilitá el evento **Pagos**. Usá una URL HTTPS alcanzable por Mercado Pago.
4. Publicá temporalmente un repuesto real de prueba con importe y disponibilidad, y usá compradores de prueba y las tarjetas de prueba que indique Mercado Pago.
5. Usá la opción de simulación de notificaciones del panel para comprobar la llegada de eventos. La guía oficial señala que los pagos de prueba pueden no enviar notificaciones Webhook; no uses el retorno al navegador como comprobante del estado.

Checkout Pro muestra sus medios disponibles dentro del checkout de Mercado Pago. Esta implementación no promete tarjetas, bancos, Naranja X, cuotas o financiación para cada comprador: la cuenta del vendedor, país, operación y disponibilidad del proveedor determinan las opciones y condiciones que Mercado Pago presenta. La tienda no mantiene una lista local de emisores ni de cuotas.

## Credenciales de producción

Al pasar a producción, reemplazá el Access Token de prueba por el Access Token de producción de la aplicación y configurá la clave secreta de Webhooks correspondiente al entorno de producción. Establecé `SITE_URL` con el dominio productivo HTTPS. En el panel de integraciones, verificá la URL del endpoint, el evento Pagos y la clave generada para producción. Conservá cada valor en las variables de entorno secretas del hosting; no los pongas en `NEXT_PUBLIC_*`, código, commits, capturas ni el navegador. Mantené `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` solo en el servidor.

El checkout redirige al sitio oficial de Mercado Pago; la app no recibe ni guarda números de tarjeta ni códigos de seguridad. `POST /api/payments/create` vuelve a leer productos, precio y disponibilidad desde PostgreSQL y crea una orden y preferencia en el servidor. `POST /api/payments/webhook` valida `x-signature` por HMAC-SHA256, consulta el pago a la API de Mercado Pago y compara referencia, preferencia, importe y moneda antes de actualizar el pedido. Solo ese webhook puede cambiar el estado; una orden aprobada no puede ser degradada por una notificación posterior. El retorno de Mercado Pago muestra un aviso y no toca la base.

La base guarda referencia de orden, snapshot del producto, cantidades, precio unitario, importe total, estado, identificadores y medio informado por el proveedor, y fechas. No guarda PAN, CVV ni datos de tarjeta.

## Esquema y migraciones

`db/migrations/001_initial_schema.sql` define tablas, tipos, identificadores, relaciones, restricciones e índices. `002_workshop_content.sql` agrega categorías de servicios y las URL de imágenes reemplazables; carga servicios base, sus categorías de repuestos y preguntas frecuentes editables. `004_detailed_service_catalog.sql` sustituye la publicación del catálogo amplio por 14 tarjetas de servicio con ilustraciones WebP y textos editables. `003_workshop_identity.sql` aplica el nombre y logo suministrados solo sobre valores pendientes, sin sobrescribir cambios posteriores. `005_video_barcode_admin.sql` agrega URLs opcionales del video, código de barras único por producto y tabla de intentos de inicio de sesión sin IP en claro. No crea productos ni precios. UUIDs identifican registros de trabajo y pedidos; `orders.reference` es la referencia pública interna. Todas las tablas principales tienen `created_at` y `updated_at`; triggers mantienen actualizado el segundo. Las relaciones de `order_items` conservan el snapshot de nombre y precio aunque un repuesto se elimine.

| Tabla | Obligatorio | Opcional / relación |
| --- | --- | --- |
| `site_settings` | nombre, descripción, colores | logo, presentación, contacto, redes, ubicación y horarios |
| `services` | nombre, categoría, descripción, orden, publicado | imagen |
| `parts_categories` | nombre, orden | descripción |
| `parts` | nombre, disponibilidad, publicado | categoría, descripción, imagen, precio |
| `admin_login_attempts` | hash de origen y fecha de intento | limpieza automática al iniciar sesión |
| `inquiries` | nombre, motivo, mensaje y un medio de contacto | teléfono o correo; el otro campo puede quedar vacío |
| `faqs` | pregunta, respuesta, orden, publicado | — |
| `testimonials` | nombre, comentario, publicado | comienza vacía |
| `orders` | referencia, total, moneda, estado | ID de preferencia, ID y medio de pago del proveedor |
| `order_items` | pedido, snapshot del producto, cantidad y precio | referencia opcional al repuesto |

No se han agregado endpoints para administrar estas tablas. Para actualizar el catálogo, usá SQL con acceso restringido a personas autorizadas.

## Transiciones y verificación del recorrido

Las transiciones usan el scroll nativo y retroceden al subir. La navegación por enlaces conserva el desplazamiento suave; el menú móvil ofrece acceso a todas las secciones. `LandingMotion` actualiza transformaciones, opacidad y fondos desde posiciones de layout guardadas, sin lecturas de geometría durante cada evento de scroll. Los cambios de tamaño, imágenes, fuentes y respuestas abiertas de FAQ actualizan esas posiciones.

Los límites tienen efectos propios: apertura diagonal bordó en Inicio → Servicios; silueta del automóvil y profundidad en Servicios → Repuestos; persiana y máscara de foto en Repuestos → Taller; línea que se simplifica en Taller → Preguntas; franja roja que se expande en Preguntas → Contacto; y cierre oscuro en Contacto → pie. Los testimonios publicados reciben también un límite propio. La versión móvil reduce desplazamientos y omite máscaras y profundidad. La preferencia de reducir movimiento muestra una composición estable.

Para repetir la comprobación con el servidor local iniciado, ejecutá `npx --yes --package @playwright/cli playwright-cli -s=irigaray open http://127.0.0.1:3000` y luego `npx --yes --package @playwright/cli playwright-cli -s=irigaray run-code --filename output/playwright/verify-scroll.js`. El script recorre cada límite en ambos sentidos, comprueba que la transición se detenga, navega con el menú, usa la rueda y gestos táctiles, y revisa la reducción de movimiento. Las capturas se guardan en `output/playwright/`.

## Endpoints de la aplicación

- `POST /api/inquiries`: valida y guarda una consulta.
- `POST /api/payments/create`: valida productos publicados, precio y disponibilidad desde la base y crea una preferencia de Checkout Pro.
- `POST /api/payments/webhook`: verifica la firma, consulta el pago directamente a Mercado Pago y actualiza la orden.
- `POST /api/admin/login`, `DELETE /api/admin/login`: inician y terminan una sesión de administración.
- `GET/POST /api/admin/products`, `PATCH /api/admin/products/:id`: catálogo privado protegido por sesión.

## Referencias oficiales consultadas

- [Checkout Pro: preferencias y API](https://www.mercadopago.com.ar/developers/es/reference/online-payments/checkout-pro-preferences/overview)
- [Notificaciones Webhooks: firma de origen](https://www.mercadopago.com.ar/developers/es/docs/checkout-bricks/additional-content/your-integrations/notifications/webhooks)
- [URLs de retorno](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/configure-back-urls)
- [Medios de pago disponibles](https://www.mercadopago.com.ar/developers/es/reference/online-payments/checkout-api/payment-methods/get)
- [ZXing Browser: lectura de códigos de barras con cámara](https://github.com/zxing-js/browser)
