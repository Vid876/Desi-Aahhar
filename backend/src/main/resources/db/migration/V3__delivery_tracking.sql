CREATE TABLE delivery_locations (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id),
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  accuracy NUMERIC(10,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX delivery_locations_order_idx ON delivery_locations(order_id, recorded_at DESC);
