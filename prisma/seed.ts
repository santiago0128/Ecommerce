/**
 * EcoShop – Database Seed Script
 * Runs with: npx ts-node prisma/seed.ts
 * Or:        npm run db:seed
 */

import bcrypt from 'bcryptjs';
import sql from 'mssql';

const config: sql.config = {
  server: 'localhost',
  database: 'EcoShop',
  options: { trustServerCertificate: true, encrypt: false },
  authentication: { type: 'default', options: { userName: '', password: '' } },
};

// Use Windows Authentication (no user/password needed)
const configWinAuth: sql.config = {
  server: 'localhost',
  database: 'EcoShop',
  options: { trustServerCertificate: true, encrypt: false, trustedConnection: true },
  driver: 'msnodesqlv8',
};

async function main() {
  console.log('🌱  Connecting to EcoShop database...');
  const pool = await sql.connect({
    server: 'localhost',
    database: 'EcoShop',
    options: { trustServerCertificate: true, encrypt: false },
  });

  console.log('✅  Connected.');

  // ── Admin User ──────────────────────────────────────────────
  const password = 'Admin1234!';
  const hash = await bcrypt.hash(password, 10);
  console.log('🔐  Hashed admin password.');

  await pool.request()
    .input('name',  sql.NVarChar, 'Administrador')
    .input('email', sql.NVarChar, 'admin@ecoshop.com')
    .input('hash',  sql.NVarChar, hash)
    .input('role',  sql.NVarChar, 'admin')
    .query(`
      IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = @email)
      INSERT INTO admin_users (name, email, password_hash, role, active)
      VALUES (@name, @email, @hash, @role, 1)
    `);

  // Extra users
  const editorHash  = await bcrypt.hash('Editor1234!', 10);
  const viewerHash  = await bcrypt.hash('Viewer1234!', 10);
  await pool.request()
    .input('name', sql.NVarChar, 'Editor de contenido')
    .input('email', sql.NVarChar, 'editor@ecoshop.com')
    .input('hash', sql.NVarChar, editorHash)
    .input('role', sql.NVarChar, 'editor')
    .query(`
      IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = @email)
      INSERT INTO admin_users (name, email, password_hash, role, active)
      VALUES (@name, @email, @hash, @role, 1)
    `);
  await pool.request()
    .input('name', sql.NVarChar, 'Analista')
    .input('email', sql.NVarChar, 'viewer@ecoshop.com')
    .input('hash', sql.NVarChar, viewerHash)
    .input('role', sql.NVarChar, 'viewer')
    .query(`
      IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = @email)
      INSERT INTO admin_users (name, email, password_hash, role, active)
      VALUES (@name, @email, @hash, @role, 1)
    `);
  console.log('👤  Admin users seeded.');

  // ── Categories ──────────────────────────────────────────────
  const cats = [
    { name: 'Electrónica', slug: 'electronica', icon: 'Zap' },
    { name: 'Ropa',        slug: 'ropa',        icon: 'Shirt' },
    { name: 'Hogar',       slug: 'hogar',       icon: 'Home' },
    { name: 'Deportes',    slug: 'deportes',    icon: 'Dumbbell' },
    { name: 'Libros',      slug: 'libros',      icon: 'BookOpen' },
    { name: 'Belleza',     slug: 'belleza',     icon: 'Sparkles' },
  ];
  for (const c of cats) {
    await pool.request()
      .input('name', sql.NVarChar, c.name)
      .input('slug', sql.NVarChar, c.slug)
      .input('icon', sql.NVarChar, c.icon)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = @slug)
        INSERT INTO categories (name, slug, icon) VALUES (@name, @slug, @icon)
      `);
  }
  console.log('📂  Categories seeded.');

  // ── Coupons ─────────────────────────────────────────────────
  const coupons = [
    { code: 'WELCOME10',   type: 'porcentaje', value: 10, minOrder: 20,  maxUses: 100, active: 1 },
    { code: 'VERANO20',    type: 'porcentaje', value: 20, minOrder: 50,  maxUses: 50,  active: 1 },
    { code: 'DESCUENTO5',  type: 'monto',      value: 5,  minOrder: 30,  maxUses: 200, active: 1 },
    { code: 'BLACKFRIDAY', type: 'porcentaje', value: 30, minOrder: 100, maxUses: 30,  active: 0 },
  ];
  for (const cp of coupons) {
    await pool.request()
      .input('code',     sql.NVarChar, cp.code)
      .input('type',     sql.NVarChar, cp.type)
      .input('value',    sql.Decimal(10, 2), cp.value)
      .input('minOrder', sql.Decimal(10, 2), cp.minOrder)
      .input('maxUses',  sql.Int, cp.maxUses)
      .input('active',   sql.Bit, cp.active)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM coupons WHERE code = @code)
        INSERT INTO coupons (code, type, value, min_order, max_uses, active)
        VALUES (@code, @type, @value, @minOrder, @maxUses, @active)
      `);
  }
  console.log('🎟️   Coupons seeded.');

  // ── Shipping Zones ──────────────────────────────────────────
  const zones = [
    { name: 'España Peninsular', countries: '["España"]',                                         rate: 4.99, free: 50,   carrier: 'Correos' },
    { name: 'Islas Baleares',    countries: '["Baleares"]',                                       rate: 6.99, free: 75,   carrier: 'MRW' },
    { name: 'Islas Canarias',    countries: '["Canarias","Ceuta","Melilla"]',                      rate: 9.99, free: null, carrier: 'SEUR' },
    { name: 'Europa',            countries: '["Francia","Alemania","Italia","Portugal"]',          rate: 12.99,free: 100,  carrier: 'DHL' },
    { name: 'Internacional',     countries: '["Resto del mundo"]',                                rate: 24.99,free: null, carrier: 'FedEx' },
  ];
  for (const z of zones) {
    await pool.request()
      .input('name',    sql.NVarChar, z.name)
      .input('countries', sql.NVarChar, z.countries)
      .input('rate',    sql.Decimal(10, 2), z.rate)
      .input('free',    sql.Decimal(10, 2), z.free)
      .input('carrier', sql.NVarChar, z.carrier)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM shipping_zones WHERE name = @name)
        INSERT INTO shipping_zones (name, countries, rate, free_threshold, carrier)
        VALUES (@name, @countries, @rate, @free, @carrier)
      `);
  }
  console.log('🚚  Shipping zones seeded.');

  // ── Tax Rates ───────────────────────────────────────────────
  const taxes = [
    { name: 'IVA General',       rate: 21, country: 'España',   active: 1 },
    { name: 'IVA Reducido',      rate: 10, country: 'España',   active: 1 },
    { name: 'IVA Superreducido', rate: 4,  country: 'España',   active: 1 },
    { name: 'TVA Standard',      rate: 20, country: 'Francia',  active: 0 },
    { name: 'MwSt Standard',     rate: 19, country: 'Alemania', active: 0 },
  ];
  for (const t of taxes) {
    await pool.request()
      .input('name',    sql.NVarChar, t.name)
      .input('rate',    sql.Decimal(5, 2), t.rate)
      .input('country', sql.NVarChar, t.country)
      .input('active',  sql.Bit, t.active)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM tax_rates WHERE name = @name AND country = @country)
        INSERT INTO tax_rates (name, rate, country, active) VALUES (@name, @rate, @country, @active)
      `);
  }
  console.log('🧾  Tax rates seeded.');

  // ── Banners ─────────────────────────────────────────────────
  const banners = [
    { title: 'Verano 2025',          subtitle: 'Hasta 40% de descuento',          bg: 'from-orange-400 to-pink-500',   active: 1, order: 1 },
    { title: 'Nuevos en tecnología', subtitle: 'Los últimos gadgets han llegado', bg: 'from-indigo-500 to-purple-600', active: 1, order: 2 },
    { title: 'Envío gratis',         subtitle: 'En pedidos superiores a $50',     bg: 'from-emerald-400 to-teal-500',  active: 0, order: 3 },
  ];
  for (const b of banners) {
    await pool.request()
      .input('title',    sql.NVarChar, b.title)
      .input('subtitle', sql.NVarChar, b.subtitle)
      .input('bg',       sql.NVarChar, b.bg)
      .input('active',   sql.Bit, b.active)
      .input('order',    sql.Int, b.order)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM banners WHERE title = @title)
        INSERT INTO banners (title, subtitle, bg_color, active, sort_order)
        VALUES (@title, @subtitle, @bg, @active, @order)
      `);
  }
  console.log('🖼️   Banners seeded.');

  // ── Settings ────────────────────────────────────────────────
  const settings: [string, string][] = [
    ['store_name',           'EcoShop'],
    ['store_description',    'Tu tienda online de confianza'],
    ['store_email',          'soporte@ecoshop.com'],
    ['store_phone',          '+34 900 123 456'],
    ['free_shipping_from',   '50'],
    ['currency',             'USD'],
    ['currency_symbol',      '$'],
    ['maintenance_mode',     'false'],
    ['reviews_auto_approve', 'true'],
    ['notifications_orders', 'true'],
  ];
  for (const [key, value] of settings) {
    await pool.request()
      .input('key',   sql.NVarChar, key)
      .input('value', sql.NVarChar, value)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM settings WHERE [key] = @key)
        INSERT INTO settings ([key], value) VALUES (@key, @value)
      `);
  }
  console.log('⚙️   Settings seeded.');

  await pool.close();
  console.log('\n✅  Seed completed!');
  console.log('\n   Admin credentials:');
  console.log('   Email:    admin@ecoshop.com');
  console.log('   Password: Admin1234!\n');
}

main().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
