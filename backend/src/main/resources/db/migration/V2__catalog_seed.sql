INSERT INTO app_settings(key, value) VALUES
  ('DELIVERY_FEE', '49'),
  ('FREE_DELIVERY_MINIMUM', '999'),
  ('DEFAULT_MINIMUM_ORDER', '500');

INSERT INTO categories(id, slug, name, hindi_name, emoji, color, applies_minimum, minimum_order_value, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'atta-rice', 'Atta & Rice', 'आटा और चावल', '🌾', '#F7E8C6', TRUE, 500, 1),
  ('10000000-0000-0000-0000-000000000002', 'pulses', 'Pulses & Grains', 'दालें और अनाज', '🫘', '#F2DCC6', TRUE, 500, 2),
  ('10000000-0000-0000-0000-000000000003', 'oils', 'Oil & Ghee', 'तेल और घी', '🫗', '#FFF1B8', TRUE, 500, 3),
  ('10000000-0000-0000-0000-000000000004', 'fresh', 'Fresh Vegetables', 'ताज़ी सब्ज़ियाँ', '🥬', '#DFF3DF', FALSE, 0, 4),
  ('10000000-0000-0000-0000-000000000005', 'dairy', 'Dairy', 'दूध और डेयरी', '🥛', '#E4F1FA', FALSE, 0, 5),
  ('10000000-0000-0000-0000-000000000006', 'personal-care', 'Personal Care', 'पर्सनल केयर', '🧴', '#F3E3F5', TRUE, 500, 6);

INSERT INTO products(id, category_id, slug, name, hindi_name, emoji, description, rating, reviews, badge, featured) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'chakki-atta', 'Stone Ground Chakki Atta', 'चक्की आटा', '🌾', 'Freshly milled whole wheat flour.', 4.8, 312, 'BESTSELLER', TRUE),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'basmati-rice', 'Premium Basmati Rice', 'बासमती चावल', '🍚', 'Long-grain aromatic basmati rice.', 4.7, 228, 'PREMIUM', TRUE),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'toor-dal', 'Unpolished Toor Dal', 'अरहर दाल', '🫘', 'Protein-rich unpolished dal.', 4.9, 441, 'FARM FRESH', TRUE),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'mustard-oil', 'Cold Pressed Mustard Oil', 'सरसों तेल', '🫗', 'Traditional kachi ghani mustard oil.', 4.8, 184, NULL, TRUE),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'tomato', 'Farm Fresh Tomato', 'ताज़े टमाटर', '🍅', 'Hand-picked fresh tomatoes.', 4.5, 97, 'FRESH', FALSE),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 'milk', 'Full Cream Milk', 'फुल क्रीम दूध', '🥛', 'Fresh full cream milk.', 4.6, 515, NULL, TRUE);

INSERT INTO product_variants(id, product_id, sku, label, price, mrp, stock) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ATTA-5KG', '5 kg', 269, 310, 100),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'ATTA-10KG', '10 kg', 519, 590, 80),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'RICE-5KG', '5 kg', 699, 799, 50),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'TOOR-1KG', '1 kg', 179, 205, 120),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'TOOR-2KG', '2 kg', 349, 399, 60),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', 'OIL-1L', '1 litre', 189, 220, 75),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', 'TOMATO-1KG', '1 kg', 49, 60, 200),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000006', 'MILK-1L', '1 litre', 68, 68, 150);

INSERT INTO coupons(code, title, description, minimum_amount, discount_amount) VALUES
  ('DESI50', '₹50 बचत', '₹799 से ऊपर के cart पर ₹50 off', 799, 50),
  ('WELCOME100', 'Welcome offer', 'पहले बड़े order पर ₹100 off', 1299, 100);
