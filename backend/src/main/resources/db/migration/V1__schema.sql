CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(24) NOT NULL CHECK (role IN ('CUSTOMER','ADMIN','STAFF')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination VARCHAR(255) NOT NULL,
  channel VARCHAR(16) NOT NULL CHECK (channel IN ('SMS','EMAIL')),
  code_hash VARCHAR(255),
  provider VARCHAR(24) NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX otp_destination_idx ON otp_challenges(destination, channel, created_at DESC);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(40) NOT NULL,
  recipient VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  hindi_name VARCHAR(100) NOT NULL,
  emoji VARCHAR(16) NOT NULL DEFAULT '🛒',
  color VARCHAR(20) NOT NULL DEFAULT '#EAF4E8',
  applies_minimum BOOLEAN NOT NULL DEFAULT FALSE,
  minimum_order_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  hindi_name VARCHAR(180) NOT NULL,
  emoji VARCHAR(16) NOT NULL DEFAULT '🛍️',
  description TEXT NOT NULL DEFAULT '',
  rating NUMERIC(3,2) NOT NULL DEFAULT 4.5,
  reviews INTEGER NOT NULL DEFAULT 0,
  badge VARCHAR(50),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(80) NOT NULL UNIQUE,
  label VARCHAR(80) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  mrp NUMERIC(12,2) NOT NULL CHECK (mrp >= price),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, variant_id)
);

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(40) NOT NULL UNIQUE,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(255) NOT NULL,
  minimum_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  usage_limit INTEGER
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(32) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(32) NOT NULL,
  payment_method VARCHAR(16) NOT NULL CHECK (payment_method IN ('COD','ONLINE')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  subtotal NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  coupon_code VARCHAR(40),
  delivery_slot VARCHAR(80) NOT NULL,
  recipient VARCHAR(120) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_city VARCHAR(100) NOT NULL,
  address_pincode VARCHAR(10) NOT NULL,
  assigned_to UUID REFERENCES users(id),
  delivery_proof_url TEXT,
  customer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON orders(user_id, created_at DESC);
CREATE INDEX orders_staff_idx ON orders(assigned_to, status, created_at DESC);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name VARCHAR(180) NOT NULL,
  variant_label VARCHAR(80) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL,
  note VARCHAR(255),
  changed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  provider VARCHAR(24) NOT NULL DEFAULT 'RAZORPAY',
  provider_order_id VARCHAR(100) UNIQUE,
  provider_payment_id VARCHAR(100),
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'CREATED',
  signature VARCHAR(255),
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(20) NOT NULL,
  app VARCHAR(24) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app_settings (
  key VARCHAR(80) PRIMARY KEY,
  value VARCHAR(255) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE webhook_events (
  provider VARCHAR(30) NOT NULL,
  event_id VARCHAR(150) NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(provider, event_id)
);
