-- Optional owner introduction video, product barcode and temporary login throttling.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_video_url text,
  ADD COLUMN IF NOT EXISTS hero_video_poster_url text;

ALTER TABLE parts ADD COLUMN IF NOT EXISTS barcode text;
CREATE UNIQUE INDEX IF NOT EXISTS parts_barcode_unique_idx
  ON parts (upper(regexp_replace(btrim(barcode), '\s+', '', 'g')))
  WHERE barcode IS NOT NULL AND btrim(barcode) <> '';

-- Keep only a keyed digest of the client address and timestamps for rate limiting.
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id bigserial PRIMARY KEY,
  ip_hash char(64) NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_login_attempts_window_idx
  ON admin_login_attempts (ip_hash, attempted_at DESC);
