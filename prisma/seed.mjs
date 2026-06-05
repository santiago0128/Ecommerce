/**
 * EcoShop – Database Seed
 * Run: node prisma/seed.mjs
 */

import bcrypt from 'bcryptjs';
import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'EcoShop',
  user: 'ecoshop_app',
  password: 'EcoShop2024#Secure!',
  options: { trustServerCertificate: true, encrypt: false },
};

async function main() {
  console.log('🌱  Connecting to EcoShop...');
  const pool = await sql.connect(config);
  console.log('✅  Connected.\n');

  // ── Admin Users ────────────────────────────────────────────
  const admins = [
    { name: 'Administrador',       email: 'admin@ecoshop.com',  password: 'Admin1234!',  role: 'admin'  },
    { name: 'Editor de contenido', email: 'editor@ecoshop.com', password: 'Editor1234!', role: 'editor' },
    { name: 'Analista',            email: 'viewer@ecoshop.com', password: 'Viewer1234!', role: 'viewer' },
  ];
  for (const a of admins) {
    const hash = await bcrypt.hash(a.password, 10);
    await pool.request()
      .input('name',  sql.NVarChar(100), a.name)
      .input('email', sql.NVarChar(150), a.email)
      .input('hash',  sql.NVarChar(255), hash)
      .input('role',  sql.NVarChar(20),  a.role)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = @email)
          INSERT INTO admin_users (name, email, password_hash, role, active)
          VALUES (@name, @email, @hash, @role, 1)
      `);
    console.log(`  👤  ${a.role.padEnd(7)} → ${a.email}`);
  }

  // ── Categories ────────────────────────────────────────────
  const cats = [
    { name: 'Electrónica', slug: 'electronica', icon: 'Zap'      },
    { name: 'Ropa',        slug: 'ropa',        icon: 'Shirt'    },
    { name: 'Hogar',       slug: 'hogar',       icon: 'Home'     },
    { name: 'Deportes',    slug: 'deportes',    icon: 'Dumbbell' },
    { name: 'Libros',      slug: 'libros',      icon: 'BookOpen' },
    { name: 'Belleza',     slug: 'belleza',     icon: 'Sparkles' },
  ];
  for (const c of cats) {
    await pool.request()
      .input('name', sql.NVarChar(100), c.name)
      .input('slug', sql.NVarChar(100), c.slug)
      .input('icon', sql.NVarChar(50),  c.icon)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = @slug)
          INSERT INTO categories (name, slug, icon) VALUES (@name, @slug, @icon)
      `);
  }
  console.log(`  📂  ${cats.length} categories`);

  // ── Coupons ───────────────────────────────────────────────
  const coupons = [
    { code: 'WELCOME10',   type: 'porcentaje', value: 10, minOrder: 20,  maxUses: 100, active: 1 },
    { code: 'VERANO20',    type: 'porcentaje', value: 20, minOrder: 50,  maxUses: 50,  active: 1 },
    { code: 'DESCUENTO5',  type: 'monto',      value: 5,  minOrder: 30,  maxUses: 200, active: 1 },
    { code: 'BLACKFRIDAY', type: 'porcentaje', value: 30, minOrder: 100, maxUses: 30,  active: 0 },
  ];
  for (const cp of coupons) {
    await pool.request()
      .input('code',      sql.NVarChar(50),    cp.code)
      .input('type',      sql.NVarChar(20),    cp.type)
      .input('value',     sql.Decimal(10, 2),  cp.value)
      .input('minOrder',  sql.Decimal(10, 2),  cp.minOrder)
      .input('maxUses',   sql.Int,             cp.maxUses)
      .input('active',    sql.Bit,             cp.active)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM coupons WHERE code = @code)
          INSERT INTO coupons (code, type, value, min_order, max_uses, active)
          VALUES (@code, @type, @value, @minOrder, @maxUses, @active)
      `);
  }
  console.log(`  🎟️   ${coupons.length} coupons`);

  // ── Shipping Zones ────────────────────────────────────────
  const zones = [
    { name: 'España Peninsular', countries: '["España"]',                            rate: 4.99, free: 50,   carrier: 'Correos' },
    { name: 'Islas Baleares',    countries: '["Baleares"]',                          rate: 6.99, free: 75,   carrier: 'MRW'     },
    { name: 'Islas Canarias',    countries: '["Canarias","Ceuta","Melilla"]',         rate: 9.99, free: null, carrier: 'SEUR'    },
    { name: 'Europa',            countries: '["Francia","Alemania","Italia","Portugal"]', rate: 12.99, free: 100, carrier: 'DHL'  },
    { name: 'Internacional',     countries: '["Resto del mundo"]',                   rate: 24.99,free: null, carrier: 'FedEx'   },
  ];
  for (const z of zones) {
    await pool.request()
      .input('name',      sql.NVarChar(100),   z.name)
      .input('countries', sql.NVarChar(500),   z.countries)
      .input('rate',      sql.Decimal(10, 2),  z.rate)
      .input('free',      sql.Decimal(10, 2),  z.free)
      .input('carrier',   sql.NVarChar(100),   z.carrier)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM shipping_zones WHERE name = @name)
          INSERT INTO shipping_zones (name, countries, rate, free_threshold, carrier)
          VALUES (@name, @countries, @rate, @free, @carrier)
      `);
  }
  console.log(`  🚚  ${zones.length} shipping zones`);

  // ── Tax Rates ─────────────────────────────────────────────
  const taxes = [
    { name: 'IVA General',       rate: 21, country: 'España',   active: 1 },
    { name: 'IVA Reducido',      rate: 10, country: 'España',   active: 1 },
    { name: 'IVA Superreducido', rate: 4,  country: 'España',   active: 1 },
    { name: 'TVA Standard',      rate: 20, country: 'Francia',  active: 0 },
    { name: 'MwSt Standard',     rate: 19, country: 'Alemania', active: 0 },
  ];
  for (const t of taxes) {
    await pool.request()
      .input('name',    sql.NVarChar(100), t.name)
      .input('rate',    sql.Decimal(5, 2), t.rate)
      .input('country', sql.NVarChar(100), t.country)
      .input('active',  sql.Bit,           t.active)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM tax_rates WHERE name = @name AND country = @country)
          INSERT INTO tax_rates (name, rate, country, active) VALUES (@name, @rate, @country, @active)
      `);
  }
  console.log(`  🧾  ${taxes.length} tax rates`);

  // ── Banners ───────────────────────────────────────────────
  const banners = [
    { title: 'Verano 2025',          subtitle: 'Hasta 40% de descuento',          bg: 'from-orange-400 to-pink-500',   active: 1, order: 1 },
    { title: 'Nuevos en tecnología', subtitle: 'Los últimos gadgets han llegado', bg: 'from-indigo-500 to-purple-600', active: 1, order: 2 },
    { title: 'Envío gratis',         subtitle: 'En pedidos superiores a $50',     bg: 'from-emerald-400 to-teal-500',  active: 0, order: 3 },
  ];
  for (const b of banners) {
    await pool.request()
      .input('title',    sql.NVarChar(200), b.title)
      .input('subtitle', sql.NVarChar(300), b.subtitle)
      .input('bg',       sql.NVarChar(100), b.bg)
      .input('active',   sql.Bit,           b.active)
      .input('order',    sql.Int,           b.order)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM banners WHERE title = @title)
          INSERT INTO banners (title, subtitle, bg_color, active, sort_order)
          VALUES (@title, @subtitle, @bg, @active, @order)
      `);
  }
  console.log(`  🖼️   ${banners.length} banners`);

  // ── Settings ──────────────────────────────────────────────
  const settings = [
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
      .input('key',   sql.NVarChar(100), key)
      .input('value', sql.NVarChar(500), value)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM settings WHERE [key] = @key)
          INSERT INTO settings ([key], value) VALUES (@key, @value)
      `);
  }
  console.log(`  ⚙️   ${settings.length} settings`);

  await pool.close();

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   ✅  Seed completado exitosamente    ║');
  console.log('╠══════════════════════════════════════╣');
  console.log('║  Credenciales de acceso:              ║');
  console.log('║  admin@ecoshop.com  →  Admin1234!     ║');
  console.log('║  editor@ecoshop.com →  Editor1234!    ║');
  console.log('║  viewer@ecoshop.com →  Viewer1234!    ║');
  console.log('╚══════════════════════════════════════╝\n');
}

main().catch(err => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
