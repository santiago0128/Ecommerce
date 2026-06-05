-- ============================================================
-- EcoShop – Migration 001: Initial Schema
-- SQL Server 2022
-- ============================================================

USE EcoShop;
GO

-- ─── Admin Users ────────────────────────────────────────────
CREATE TABLE admin_users (
  id            NVARCHAR(36)  NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name          NVARCHAR(100) NOT NULL,
  email         NVARCHAR(150) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  role          NVARCHAR(20)  NOT NULL DEFAULT 'admin', -- admin | editor | viewer
  active        BIT           NOT NULL DEFAULT 1,
  created_at    DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
  updated_at    DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ─── Categories ─────────────────────────────────────────────
CREATE TABLE categories (
  id         NVARCHAR(36)  NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name       NVARCHAR(100) NOT NULL UNIQUE,
  slug       NVARCHAR(100) NOT NULL UNIQUE,
  icon       NVARCHAR(50),
  created_at DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ─── Products ───────────────────────────────────────────────
CREATE TABLE products (
  id             NVARCHAR(36)   NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name           NVARCHAR(255)  NOT NULL,
  description    NVARCHAR(MAX)  NOT NULL,
  price          DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image          NVARCHAR(500)  NOT NULL,
  images         NVARCHAR(MAX)  NOT NULL DEFAULT '[]',  -- JSON array
  category_id    NVARCHAR(36)   REFERENCES categories(id) ON DELETE SET NULL,
  stock          INT            NOT NULL DEFAULT 0,
  sku            NVARCHAR(100)  UNIQUE,
  brand          NVARCHAR(100),
  rating         DECIMAL(3, 2)  NOT NULL DEFAULT 0,
  review_count   INT            NOT NULL DEFAULT 0,
  featured       BIT            NOT NULL DEFAULT 0,
  active         BIT            NOT NULL DEFAULT 1,
  tags           NVARCHAR(MAX)  NOT NULL DEFAULT '[]',  -- JSON array
  variants       NVARCHAR(MAX)  NOT NULL DEFAULT '[]',  -- JSON array
  created_at     DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
  updated_at     DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ─── Customers ──────────────────────────────────────────────
CREATE TABLE customers (
  id         NVARCHAR(36)  NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name       NVARCHAR(150) NOT NULL,
  email      NVARCHAR(150) NOT NULL UNIQUE,
  phone      NVARCHAR(30),
  address    NVARCHAR(MAX),
  created_at DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ─── Orders ─────────────────────────────────────────────────
CREATE TABLE orders (
  id               NVARCHAR(36)   NOT NULL DEFAULT NEWID() PRIMARY KEY,
  number           NVARCHAR(30)   NOT NULL UNIQUE,
  customer_id      NVARCHAR(36)   REFERENCES customers(id) ON DELETE SET NULL,
  guest_email      NVARCHAR(150),
  guest_name       NVARCHAR(150),
  status           NVARCHAR(20)   NOT NULL DEFAULT 'pendiente',
  subtotal         DECIMAL(10, 2) NOT NULL,
  shipping         DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount         DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total            DECIMAL(10, 2) NOT NULL,
  coupon_code      NVARCHAR(50),
  tracking_number  NVARCHAR(100),
  payment_method   NVARCHAR(30)   NOT NULL,
  shipping_address NVARCHAR(MAX)  NOT NULL,  -- JSON
  created_at       DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
  updated_at       DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ─── Order Items ────────────────────────────────────────────
CREATE TABLE order_items (
  id                NVARCHAR(36)   NOT NULL DEFAULT NEWID() PRIMARY KEY,
  order_id          NVARCHAR(36)   NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        NVARCHAR(36)   NOT NULL REFERENCES products(id),
  product_name      NVARCHAR(255)  NOT NULL,
  product_image     NVARCHAR(500)  NOT NULL,
  price             DECIMAL(10, 2) NOT NULL,
  quantity          INT            NOT NULL,
  selected_variants NVARCHAR(MAX)  NOT NULL DEFAULT '{}'  -- JSON
);
GO

-- ─── Reviews ────────────────────────────────────────────────
CREATE TABLE reviews (
  id          NVARCHAR(36)  NOT NULL DEFAULT NEWID() PRIMARY KEY,
  product_id  NVARCHAR(36)  NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name   NVARCHAR(100) NOT NULL,
  user_email  NVARCHAR(150),
  rating      TINYINT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     NVARCHAR(MAX) NOT NULL,
  helpful     INT           NOT NULL DEFAULT 0,
  approved    BIT           NOT NULL DEFAULT 1,
  created_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ─── Coupons ────────────────────────────────────────────────
CREATE TABLE coupons (
  id         NVARCHAR(36)   NOT NULL DEFAULT NEWID() PRIMARY KEY,
  code       NVARCHAR(50)   NOT NULL UNIQUE,
  type       NVARCHAR(20)   NOT NULL,  -- porcentaje | monto
  value      DECIMAL(10, 2) NOT NULL,
  min_order  DECIMAL(10, 2),
  max_uses   INT,
  used_count INT            NOT NULL DEFAULT 0,
  active     BIT            NOT NULL DEFAULT 1,
  expires_at DATETIME2,
  created_at DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ─── Banners ────────────────────────────────────────────────
CREATE TABLE banners (
  id        NVARCHAR(36)  NOT NULL DEFAULT NEWID() PRIMARY KEY,
  title     NVARCHAR(200) NOT NULL,
  subtitle  NVARCHAR(300),
  image     NVARCHAR(500),
  link      NVARCHAR(300),
  bg_color  NVARCHAR(100) NOT NULL DEFAULT 'from-indigo-500 to-purple-600',
  active    BIT           NOT NULL DEFAULT 1,
  sort_order INT          NOT NULL DEFAULT 0
);
GO

-- ─── Shipping Zones ─────────────────────────────────────────
CREATE TABLE shipping_zones (
  id             NVARCHAR(36)   NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name           NVARCHAR(100)  NOT NULL,
  countries      NVARCHAR(MAX)  NOT NULL DEFAULT '[]',  -- JSON
  rate           DECIMAL(10, 2) NOT NULL,
  free_threshold DECIMAL(10, 2),
  carrier        NVARCHAR(100),
  active         BIT            NOT NULL DEFAULT 1
);
GO

-- ─── Tax Rates ──────────────────────────────────────────────
CREATE TABLE tax_rates (
  id      NVARCHAR(36)  NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name    NVARCHAR(100) NOT NULL,
  rate    DECIMAL(5, 2) NOT NULL,
  country NVARCHAR(100) NOT NULL,
  active  BIT           NOT NULL DEFAULT 1
);
GO

-- ─── Chat ───────────────────────────────────────────────────
CREATE TABLE chat_conversations (
  id              NVARCHAR(36)  NOT NULL DEFAULT NEWID() PRIMARY KEY,
  visitor_id      NVARCHAR(100) NOT NULL,
  visitor_name    NVARCHAR(100) NOT NULL DEFAULT 'Visitante',
  status          NVARCHAR(20)  NOT NULL DEFAULT 'open',  -- open | resolved
  unread_by_admin INT           NOT NULL DEFAULT 0,
  started_at      DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
  last_message_at DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE chat_messages (
  id              NVARCHAR(36)  NOT NULL DEFAULT NEWID() PRIMARY KEY,
  conversation_id NVARCHAR(36)  NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  text            NVARCHAR(MAX) NOT NULL,
  [from]          NVARCHAR(20)  NOT NULL,  -- user | bot | admin
  timestamp       DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ─── Store Settings ─────────────────────────────────────────
CREATE TABLE settings (
  [key]      NVARCHAR(100) NOT NULL PRIMARY KEY,
  value      NVARCHAR(MAX) NOT NULL,
  updated_at DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IX_products_category     ON products(category_id);
CREATE INDEX IX_products_active       ON products(active);
CREATE INDEX IX_products_featured     ON products(featured);
CREATE INDEX IX_orders_status         ON orders(status);
CREATE INDEX IX_orders_customer       ON orders(customer_id);
CREATE INDEX IX_orders_created        ON orders(created_at DESC);
CREATE INDEX IX_order_items_order     ON order_items(order_id);
CREATE INDEX IX_order_items_product   ON order_items(product_id);
CREATE INDEX IX_reviews_product       ON reviews(product_id);
CREATE INDEX IX_chat_conv_visitor     ON chat_conversations(visitor_id);
CREATE INDEX IX_chat_conv_status      ON chat_conversations(status);
CREATE INDEX IX_chat_msg_conv         ON chat_messages(conversation_id);
CREATE INDEX IX_customers_email       ON customers(email);
GO

PRINT 'Migration 001 completed successfully.';
GO
