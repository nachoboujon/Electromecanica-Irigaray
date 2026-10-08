-- Confirmed service catalog and editable starter FAQs. No owner or business identity is fabricated.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS about_image_url text;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Servicios del taller';

INSERT INTO services (name, category, description, display_order, is_published)
SELECT seed.name, seed.category, seed.description, seed.display_order, true
FROM (VALUES
  ('Electricidad del automotor', 'Electricidad del automotor', 'Instalaciones eléctricas; reparación de arranques y alternadores; reparación de motores eléctricos en general.', 1),
  ('Aire acondicionado automotor', 'Climatización', 'Reparación; carga de gas; recambio de compresores; instalación.', 2),
  ('Inyección electrónica', 'Diagnóstico electrónico', 'Diagnóstico computarizado; detección de fallas; reparación de PC automotriz; puesta a punto electrónica.', 3),
  ('Llaves electrónicas', 'Seguridad electrónica', 'Programación de chips y duplicado de llaves para distintas marcas.', 4)
) AS seed(name, category, description, display_order)
WHERE NOT EXISTS (SELECT 1 FROM services existing WHERE lower(existing.name) = lower(seed.name));

INSERT INTO parts_categories (name, description, display_order)
SELECT seed.name, seed.description, seed.display_order
FROM (VALUES
  ('Electricidad del automotor', 'Repuestos relacionados con electricidad del automotor.', 1),
  ('Aire acondicionado', 'Repuestos relacionados con aire acondicionado automotor.', 2),
  ('Inyección electrónica', 'Repuestos relacionados con inyección electrónica.', 3),
  ('Llaves electrónicas', 'Repuestos relacionados con llaves electrónicas.', 4)
) AS seed(name, description, display_order)
WHERE NOT EXISTS (SELECT 1 FROM parts_categories existing WHERE lower(existing.name) = lower(seed.name));

INSERT INTO faqs (question, answer, display_order, is_published)
SELECT seed.question, seed.answer, seed.display_order, true
FROM (VALUES
  ('¿Qué servicios realiza el taller?', 'Electricidad del automotor, aire acondicionado automotor, inyección electrónica y llaves electrónicas. Escribinos para consultar por tu caso.', 1),
  ('¿Cómo puedo consultar por un turno?', 'Dejanos tu consulta en el formulario de contacto. Cuando se completen los datos del taller, también podrás comunicarte por los medios publicados en esta página.', 2),
  ('¿Puedo consultar por un repuesto?', 'Sí. Podés escribirnos para consultar por piezas relacionadas con los servicios del taller. Precio y disponibilidad se confirman al responder.', 3),
  ('¿Qué medios de pago están disponibles?', 'Si hay productos habilitados para compra, Mercado Pago mostrará los medios disponibles para esa operación dentro de su checkout oficial.', 4)
) AS seed(question, answer, display_order)
WHERE NOT EXISTS (SELECT 1 FROM faqs existing WHERE existing.question = seed.question);
