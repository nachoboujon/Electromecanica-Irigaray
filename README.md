# Sitio del taller electromecánico

Landing responsive en español con contenido público leído desde PostgreSQL y checkout alojado por Mercado Pago Checkout Pro. El proyecto no incluye panel de administración: los datos se completan directamente en PostgreSQL y las consultas se guardan en la base.

## Requisitos y arranque

- Node.js 20 o superior y npm.
- PostgreSQL 14 o superior.
- Una cuenta y una aplicación de Mercado Pago para habilitar pagos.

1. Copiá `.env.example` a `.env.local` y completá la conexión de PostgreSQL. Conservá las credenciales solo en archivos de entorno locales o en el gestor de secretos del hosting.
2. Aplicá la migración. En PowerShell: `psql $env:DATABASE_URL -f db/migrations/001_initial_schema.sql`. En Bash: `psql "$DATABASE_URL" -f db/migrations/001_initial_schema.sql`.
3. Instalá y ejecutá: `npm install`, luego `npm run dev`.
4. Abrí `http://localhost:3000`.

La página puede mostrarse sin conectar la base; en ese caso los campos del negocio aparecen como pendientes y los formularios y pagos responden que la base aún no está configurada. Si la conexión deja de responder, la página muestra un aviso temporal distinto del estado sin configurar. La conexión y la migración son necesarias para guardar consultas, mostrar el contenido publicado y crear compras.

Si el proveedor PostgreSQL exige TLS, configurá `DATABASE_SSL=true`.

## Completar el contenido real

Después de tener la migración aplicada, editá la única fila inicial de `site_settings` (id `1`) con los datos aprobados por el dueño. La tabla incluye nombre, descripción, presentación del taller, logotipo, colores, WhatsApp, teléfono, correo, dirección, horarios, redes y enlace de mapa. Los textos iniciales identifican expresamente información pendiente; reemplazalos antes de publicar.

Las imágenes se cargan en el servicio de archivos elegido para el despliegue. Guardá en las columnas `logo_url`, `image_url` o en `site_settings` URL HTTPS públicas y estables. Para el logotipo cuadrado, priorizá PNG o SVG optimizado; para servicios y repuestos, fotografías propias con buena luz, recorte consistente y texto alternativo basado en el nombre del elemento. Los dos espacios fotográficos de la portada y «Sobre el taller» son reservas visuales, no fotos reales.

Servicios, categorías, repuestos y preguntas frecuentes se insertan en sus tablas. Los servicios, repuestos y FAQ se muestran solo con `is_published = true`; los testimonios también permanecen ocultos hasta su publicación. Para habilitar un botón de compra, cargá un precio real y marcá `availability = 'disponible'`. Un producto sin precio o disponibilidad confirmada solo permite consultar. No se incluyeron productos, precios, existencia, preguntas, servicios específicos ni testimonios inventados.

Las consultas del formulario se guardan en `inquiries`. Este starter no tiene una vista administrativa ni envío de correo automático.

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

`db/migrations/001_initial_schema.sql` define tablas, tipos, identificadores, relaciones, restricciones e índices. UUIDs identifican registros de trabajo y pedidos; `orders.reference` es la referencia pública interna. Todas las tablas tienen `created_at` y `updated_at`; triggers mantienen actualizado el segundo. La migración solo crea la fila estructural de configuración del sitio. Las relaciones de `order_items` conservan el snapshot de nombre y precio aunque un repuesto se elimine.

| Tabla | Obligatorio | Opcional / relación |
| --- | --- | --- |
| `site_settings` | nombre, descripción, colores | logo, presentación, contacto, redes, ubicación y horarios |
| `services` | nombre, descripción, orden, publicado | imagen |
| `parts_categories` | nombre, orden | descripción |
| `parts` | nombre, disponibilidad, publicado | categoría, descripción, imagen, precio |
| `inquiries` | nombre, motivo, mensaje y un medio de contacto | teléfono o correo; el otro campo puede quedar vacío |
| `faqs` | pregunta, respuesta, orden, publicado | — |
| `testimonials` | nombre, comentario, publicado | comienza vacía |
| `orders` | referencia, total, moneda, estado | ID de preferencia, ID y medio de pago del proveedor |
| `order_items` | pedido, snapshot del producto, cantidad y precio | referencia opcional al repuesto |

No se han agregado endpoints para administrar estas tablas. Para actualizar el catálogo, usá SQL con acceso restringido a personas autorizadas.

## Endpoints

- `POST /api/inquiries`: valida y guarda una consulta.
- `POST /api/payments/create`: valida productos publicados, precio y disponibilidad desde la base y crea una preferencia de Checkout Pro.
- `POST /api/payments/webhook`: verifica la firma, consulta el pago directamente a Mercado Pago y actualiza la orden.

## Referencias oficiales consultadas

- [Checkout Pro: preferencias y API](https://www.mercadopago.com.ar/developers/es/reference/online-payments/checkout-pro-preferences/overview)
- [Notificaciones Webhooks: firma de origen](https://www.mercadopago.com.ar/developers/es/docs/checkout-bricks/additional-content/your-integrations/notifications/webhooks)
- [URLs de retorno](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/configure-back-urls)
- [Medios de pago disponibles](https://www.mercadopago.com.ar/developers/es/reference/online-payments/checkout-api/payment-methods/get)
