-- Expanded visual service catalog. Illustrations are generic service artwork,
-- not photographs of the workshop or claims about specific completed jobs.
UPDATE services
SET is_published = false, updated_at = now()
WHERE lower(name) IN (
  'electricidad del automotor',
  'aire acondicionado automotor',
  'inyección electrónica',
  'llaves electrónicas'
);

INSERT INTO services (name, category, description, image_url, display_order, is_published)
SELECT seed.name, seed.category, seed.description, seed.image_url, seed.display_order, true
FROM (VALUES
  ('Electricidad automotriz', 'Electricidad del automotor', 'Revisión de cableado y componentes eléctricos del vehículo.', '/images/services/electricidad-automotriz.webp', 1),
  ('Arranques', 'Electricidad del automotor', 'Reparación de motores de arranque y sus componentes.', '/images/services/arranques.webp', 2),
  ('Alternadores', 'Electricidad del automotor', 'Revisión y reparación de alternadores.', '/images/services/alternadores.webp', 3),
  ('Motores eléctricos', 'Electricidad del automotor', 'Reparación de motores eléctricos en general.', '/images/services/motores-electricos.webp', 4),
  ('Aire acondicionado automotor', 'Climatización', 'Reparación e instalación del sistema de climatización.', '/images/services/aire-acondicionado.webp', 5),
  ('Carga de refrigerante', 'Climatización', 'Carga de gas refrigerante del aire acondicionado.', '/images/services/carga-refrigerante.webp', 6),
  ('Recambio de compresores', 'Climatización', 'Recambio de compresores del aire acondicionado.', '/images/services/recambio-compresores.webp', 7),
  ('Calefacción automotriz', 'Climatización', 'Revisión del circuito de calefacción y circulación de aire al habitáculo.', '/images/services/calefaccion-automotriz.webp', 8),
  ('Diagnóstico computarizado y detección de fallas', 'Diagnóstico electrónico', 'Lectura electrónica para diagnosticar fallas del vehículo.', '/images/services/diagnostico-computarizado.webp', 9),
  ('Reparación de computadora automotriz', 'Diagnóstico electrónico', 'Reparación de PC automotriz y módulos electrónicos.', '/images/services/reparacion-computadora-automotriz.webp', 10),
  ('Puesta a punto electrónica', 'Diagnóstico electrónico', 'Puesta a punto electrónica con instrumentos de diagnóstico.', '/images/services/puesta-a-punto-electronica.webp', 11),
  ('Llaves electrónicas', 'Seguridad electrónica', 'Programación de chips y duplicado de llaves para distintas marcas.', '/images/services/llaves-electronicas.webp', 12),
  ('Venta de repuestos', 'Repuestos', 'Repuestos vinculados a los servicios del taller. Consultá por la pieza que necesitás.', '/images/services/venta-repuestos.webp', 13),
  ('Instalación de sistemas de gas para vehículos', 'Gas vehicular', 'Instalamos sistemas de gas para vehículos. Consultanos por la compatibilidad con tu auto y solicitá un presupuesto', '/images/services/sistemas-gas-vehicular.webp', 14)
) AS seed(name, category, description, image_url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM services existing WHERE lower(existing.name) = lower(seed.name));

-- Keep illustration URLs current if this migration is applied again after an edit.
UPDATE services s SET image_url = seed.image_url
FROM (VALUES
  ('Electricidad automotriz', '/images/services/electricidad-automotriz.webp'),
  ('Arranques', '/images/services/arranques.webp'),
  ('Alternadores', '/images/services/alternadores.webp'),
  ('Motores eléctricos', '/images/services/motores-electricos.webp'),
  ('Aire acondicionado automotor', '/images/services/aire-acondicionado.webp'),
  ('Carga de refrigerante', '/images/services/carga-refrigerante.webp'),
  ('Recambio de compresores', '/images/services/recambio-compresores.webp'),
  ('Calefacción automotriz', '/images/services/calefaccion-automotriz.webp'),
  ('Diagnóstico computarizado y detección de fallas', '/images/services/diagnostico-computarizado.webp'),
  ('Reparación de computadora automotriz', '/images/services/reparacion-computadora-automotriz.webp'),
  ('Puesta a punto electrónica', '/images/services/puesta-a-punto-electronica.webp'),
  ('Llaves electrónicas', '/images/services/llaves-electronicas.webp'),
  ('Venta de repuestos', '/images/services/venta-repuestos.webp'),
  ('Instalación de sistemas de gas para vehículos', '/images/services/sistemas-gas-vehicular.webp')
) AS seed(name, image_url)
WHERE lower(s.name) = lower(seed.name);

UPDATE services SET category = 'Climatización',
  description = 'Reparación e instalación del sistema de climatización.',
  display_order = 5, is_published = true, updated_at = now()
WHERE lower(name) = lower('Aire acondicionado automotor');

UPDATE services SET category = 'Seguridad electrónica', display_order = 12,
  is_published = true, updated_at = now()
WHERE lower(name) = lower('Llaves electrónicas');

UPDATE faqs SET answer = 'Electricidad automotriz, climatización, diagnóstico electrónico, llaves y los demás servicios listados en esta página. Escribinos para consultar por tu caso.', updated_at = now()
WHERE question = '¿Qué servicios realiza el taller?';
