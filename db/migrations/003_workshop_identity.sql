-- Apply the owner-provided workshop identity while preserving any later owner edits.
UPDATE site_settings
SET workshop_name = CASE
      WHEN workshop_name IS NULL OR workshop_name = 'Nombre del taller pendiente' THEN 'Electromecánica Irigaray'
      ELSE workshop_name
    END,
    logo_url = COALESCE(NULLIF(logo_url, ''), '/logo-taller-irigaray.png')
WHERE id = 1;
