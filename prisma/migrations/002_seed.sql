-- ============================================================
-- EcoShop – Migration 002: Seed Data
-- ============================================================

USE EcoShop;
GO

-- ─── Admin User (password: Admin1234!) ──────────────────────
-- Hash generado con bcrypt rounds=10 para "Admin1234!"
INSERT INTO admin_users (id, name, email, password_hash, role, active)
VALUES (
  NEWID(),
  'Administrador',
  'admin@ecoshop.com',
  '$2b$10$YourHashWillBeGeneratedByTheSeedScript',
  'admin',
  1
);
GO

-- ─── Categories ─────────────────────────────────────────────
INSERT INTO categories (id, name, slug, icon) VALUES
  (NEWID(), 'Electrónica', 'electronica', 'Zap'),
  (NEWID(), 'Ropa',        'ropa',        'Shirt'),
  (NEWID(), 'Hogar',       'hogar',       'Home'),
  (NEWID(), 'Deportes',    'deportes',    'Dumbbell'),
  (NEWID(), 'Libros',      'libros',      'BookOpen'),
  (NEWID(), 'Belleza',     'belleza',     'Sparkles');
GO

-- ─── Coupons ────────────────────────────────────────────────
INSERT INTO coupons (id, code, type, value, min_order, max_uses, used_count, active) VALUES
  (NEWID(), 'WELCOME10',   'porcentaje', 10, 20,  100, 0,  1),
  (NEWID(), 'VERANO20',    'porcentaje', 20, 50,  50,  0,  1),
  (NEWID(), 'DESCUENTO5',  'monto',      5,  30,  200, 0,  1),
  (NEWID(), 'BLACKFRIDAY', 'porcentaje', 30, 100, 30,  30, 0);
GO

-- ─── Shipping Zones ─────────────────────────────────────────
INSERT INTO shipping_zones (id, name, countries, rate, free_threshold, carrier, active) VALUES
  (NEWID(), 'España Peninsular', '["España"]',                                           4.99, 50,  'Correos', 1),
  (NEWID(), 'Islas Baleares',    '["Baleares"]',                                         6.99, 75,  'MRW',     1),
  (NEWID(), 'Islas Canarias',    '["Canarias","Ceuta","Melilla"]',                        9.99, NULL,'SEUR',    1),
  (NEWID(), 'Europa',            '["Francia","Alemania","Italia","Portugal"]',            12.99, 100, 'DHL',     1),
  (NEWID(), 'Internacional',     '["Resto del mundo"]',                                  24.99, NULL,'FedEx',   1);
GO

-- ─── Tax Rates ──────────────────────────────────────────────
INSERT INTO tax_rates (id, name, rate, country, active) VALUES
  (NEWID(), 'IVA General',       21, 'España',   1),
  (NEWID(), 'IVA Reducido',      10, 'España',   1),
  (NEWID(), 'IVA Superreducido', 4,  'España',   1),
  (NEWID(), 'TVA Standard',      20, 'Francia',  0),
  (NEWID(), 'MwSt Standard',     19, 'Alemania', 0);
GO

-- ─── Banners ────────────────────────────────────────────────
INSERT INTO banners (id, title, subtitle, bg_color, active, sort_order) VALUES
  (NEWID(), 'Verano 2025',          'Hasta 40% de descuento',          'from-orange-400 to-pink-500',   1, 1),
  (NEWID(), 'Nuevos en tecnología', 'Los últimos gadgets han llegado', 'from-indigo-500 to-purple-600', 1, 2),
  (NEWID(), 'Envío gratis',         'En pedidos superiores a $50',     'from-emerald-400 to-teal-500',  0, 3);
GO

-- ─── Store Settings ─────────────────────────────────────────
INSERT INTO settings ([key], value, updated_at) VALUES
  ('store_name',           'EcoShop',                           GETUTCDATE()),
  ('store_description',    'Tu tienda online de confianza',     GETUTCDATE()),
  ('store_email',          'soporte@ecoshop.com',               GETUTCDATE()),
  ('store_phone',          '+34 900 123 456',                   GETUTCDATE()),
  ('free_shipping_from',   '50',                                GETUTCDATE()),
  ('currency',             'USD',                               GETUTCDATE()),
  ('currency_symbol',      '$',                                 GETUTCDATE()),
  ('maintenance_mode',     'false',                             GETUTCDATE()),
  ('reviews_auto_approve', 'true',                              GETUTCDATE()),
  ('notifications_orders', 'true',                              GETUTCDATE());
GO

PRINT 'Migration 002 (seed) completed successfully.';
GO
