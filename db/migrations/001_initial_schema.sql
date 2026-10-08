-- PostgreSQL schema for the public workshop site and Checkout Pro orders.
-- Run with: psql "$DATABASE_URL" -f db/migrations/001_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'canceled');

CREATE TABLE site_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  workshop_name text NOT NULL DEFAULT 'Nombre del taller pendiente',
  description text NOT NULL DEFAULT 'Descripción del taller pendiente de completar.',
  about_text text,
  logo_url text,
  primary_color varchar(7) NOT NULL DEFAULT '#d9272e' CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color varchar(7) NOT NULL DEFAULT '#111111' CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  whatsapp text,
  phone text,
  email text,
  address text,
  hours text,
  instagram_url text,
  facebook_url text,
  map_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE parts_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES parts_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price numeric(12,2) CHECK (price IS NULL OR price >= 0),
  availability text NOT NULL DEFAULT 'consultar' CHECK (availability IN ('consultar', 'disponible', 'sin_stock')),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX parts_published_category_idx ON parts(is_published, category_id);

CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  reason text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inquiries_contact_required CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  comment text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('TAL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  total_amount numeric(12,2) NOT NULL CHECK (total_amount > 0),
  currency char(3) NOT NULL DEFAULT 'ARS' CHECK (currency = 'ARS'),
  payment_status payment_status NOT NULL DEFAULT 'pending',
  provider text NOT NULL DEFAULT 'mercadopago',
  provider_preference_id text,
  provider_payment_id text UNIQUE,
  provider_payment_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  part_id uuid REFERENCES parts(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Minimal starter record is configuration structure only; all business facts stay pending.
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Keep updated_at current when any row is changed.
CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['site_settings','services','parts_categories','parts','inquiries','faqs','testimonials','orders','order_items'] LOOP
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', table_name, table_name);
  END LOOP;
END;
$$;
