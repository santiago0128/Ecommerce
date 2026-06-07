# EcoShop — Documentación del proyecto

Tienda online (e-commerce) construida con **Next.js 16** (App Router + Turbopack), **React 19**, **TypeScript**, **Tailwind CSS v4**, base de datos **SQL Server** (vía `mssql`) y autenticación propia con **JWT**.

---

## 1. Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.7 (App Router, Server/Client Components, API Routes) |
| UI | React 19, Tailwind CSS v4, Framer Motion (animaciones), Lucide React (íconos), Sonner (toasts) |
| Base de datos | SQL Server, accedida con el paquete `mssql` (pool de conexión compartido en `src/lib/db.ts`) |
| Autenticación | JWT propio (`jsonwebtoken` + `bcryptjs`), cookie `ecoshop_token` o header `Authorization: Bearer` |
| Estado global | React Context API (uno por dominio: auth, carrito, productos, pedidos, etc.) |

Scripts disponibles (`package.json`):
- `npm run dev` — servidor de desarrollo (Turbopack)
- `npm run build` — build de producción
- `npm run start` — servidor de producción
- `npm run lint` — ESLint

Variables de entorno (`src/lib/auth.ts`, `src/lib/db.ts`):
`DB_SERVER`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`

---

## 2. Estructura general

```
src/
├── app/
│   ├── (shop)/         → páginas públicas de la tienda
│   ├── admin/          → panel de administración
│   ├── api/            → rutas de API (públicas y de admin)
│   └── login/          → inicio de sesión
├── components/         → componentes compartidos (Header, Footer, ProductCard, ChatWidget...)
├── context/            → estado global por dominio (Context API)
├── lib/                → conexión a BD (db.ts) y autenticación (auth.ts)
├── data/               → datos de muestra/semilla (categorías y productos de ejemplo)
└── types/              → interfaces TypeScript compartidas (Product, Order, Cart, etc.)
prisma/migrations/      → script SQL de creación de las tablas (001_init.sql)
```

---

## 3. Tienda pública (`(shop)`)

Rutas accesibles para cualquier visitante:

| Ruta | Página | Descripción |
|---|---|---|
| `/` | Inicio | Hero, productos destacados, novedades, categorías |
| `/tienda` | Catálogo | Listado de productos con búsqueda, filtro por categoría, precio máximo, orden (relevancia/precio/rating) y vista grilla/lista |
| `/producto/[id]` | Detalle de producto | Galería de imágenes, variantes (talla/color/etc.), valoraciones y reseñas, productos relacionados, agregar al carrito/wishlist |
| `/wishlist` | Lista de deseos | Productos guardados como favoritos (persistidos en `localStorage`) |
| `/checkout` | Pago | Formulario de envío, datos de pago, aplicar cupón de descuento, resumen del pedido |
| `/pedidos` | Mis pedidos | Historial de pedidos del usuario autenticado |
| `/perfil` | Perfil | Datos de la cuenta del usuario |
| `/contacto` | Contacto | Formulario de contacto |
| `/politicas` | Políticas | Información legal/políticas de la tienda |
| `/login` | Acceso | Inicio de sesión (clientes y administradores) |

### Componentes clave de la tienda
- **`Header`** — navegación, buscador, menú de categorías, acceso al carrito/wishlist/cuenta, badge de notificaciones de admin
- **`Footer`** — enlaces e información de la tienda
- **`ProductCard`** — tarjeta de producto reutilizable (imagen, precio, descuento, rating, agregar al carrito)
- **`CartDrawer`** — panel lateral deslizable del carrito de compras
- **`ChatWidget`** — widget de chat flotante para que los visitantes hablen con soporte (ver sección de Chat)

---

## 4. Panel de administración (`/admin`)

Acceso protegido por rol (`admin` / `editor`) mediante JWT. Estructura del menú lateral:

**Principal**
- `Dashboard` (`/admin`) — resumen general (ventas, pedidos, productos con bajo stock, etc.)
- `Productos` (`/admin/productos`) — alta, edición, activar/desactivar y eliminar (soft-delete) productos
- `Inventario` (`/admin/inventario`) — ajuste rápido de stock por producto, filtros por estado (agotado/bajo/disponible)
- `Categorías` (`/admin/categorias`) — administración completa de categorías de productos

**Ventas**
- `Pedidos` (`/admin/pedidos`) — listado y gestión de estado de pedidos
- `Clientes` (`/admin/clientes`) — listado de clientes registrados
- `Chats` (`/admin/chats`) — bandeja de conversaciones de soporte en vivo
- `Cupones` (`/admin/cupones`) — gestión de cupones de descuento
- `Banners` (`/admin/banners`) — gestión de banners promocionales del home

**Análisis**
- `Reportes` (`/admin/reportes`) — métricas de catálogo (rating promedio, distribución de precios, descuentos, etc.)

**Configuración**
- `Usuarios` (`/admin/usuarios`) — administradores y editores del panel
- `Envíos` (`/admin/envios`) — zonas y tarifas de envío
- `Impuestos` (`/admin/impuestos`) — tasas de impuestos
- `Pagos` (`/admin/pagos`) — métodos de pago habilitados
- `Roles` (`/admin/roles`) — roles y permisos
- `Ajustes` (`/admin/ajustes`) — configuración general de la tienda (nombre, descripción, notificaciones, envío gratis a partir de monto, etc.)

---

## 5. Funcionalidades por dominio (Context API)

Cada dominio de negocio tiene su propio contexto en `src/context/`. El estado de conexión a base de datos varía:

| Contexto | Hook | Persistencia | Notas |
|---|---|---|---|
| `AuthContext` | `useAuth` | **Base de datos** (tabla `admin_users` / `customers` vía API) | Login, logout, sesión vía cookie JWT (`/api/auth/*`) |
| `ProductsContext` | `useProducts` | **Base de datos** (`products`, `categories`) | Catálogo público vía `/api/products`; `updateProduct` persiste cambios de stock/precio a través de `/api/admin/products/[id]` |
| `ChatContext` | `useChat` | **Base de datos** (`chat_conversations`, `chat_messages`) | Chat en vivo visitante↔admin, ver sección 6 |
| `CartContext` | `useCart` | Local (estado de React, `useReducer`) | Carrito de compras de la sesión actual |
| `WishlistContext` | `useWishlist` | **`localStorage`** | Lista de deseos persistida en el navegador |
| `OrdersContext` | `useOrders` | ⚠️ Datos de muestra en memoria | Aún no conectado a la tabla `orders`/`order_items` (existe en BD pero el contexto usa `MOCK_ORDERS`) |
| `CouponsContext` | `useCoupons` | ⚠️ Datos de muestra en memoria | Aún no conectado a la tabla `coupons` (la página admin de cupones sí usa la API real `/api/admin/coupons`, pero el contexto del lado tienda usa `INITIAL_COUPONS`) |
| `ReviewsContext` | `useReviews` | ⚠️ Datos de muestra en memoria | Aún no conectado a la tabla `reviews` |

> **Nota:** Las páginas de administración (`/admin/productos`, `/admin/cupones`, `/admin/pedidos`, `/admin/clientes`, `/admin/usuarios`, `/admin/banners`, `/admin/categorias`) consultan la API directamente con `fetch`, independientemente de si el contexto equivalente del lado tienda ya está conectado a la BD o no.

### Imagen de producto por defecto
Si un producto no tiene imagen cargada (`image`/`images` vacíos en la base de datos), la API pública `/api/products` devuelve automáticamente `/product-placeholder.svg` como imagen de respaldo, evitando errores de renderizado y mostrando un ícono genérico de "Sin imagen" en toda la tienda.

---

## 6. Chat de soporte en vivo

Sistema de mensajería en tiempo (cuasi) real entre visitantes de la tienda y el equipo de administración, totalmente respaldado por base de datos (tablas `chat_conversations` y `chat_messages`).

**Lado visitante** (`ChatWidget`, botón flotante):
- Se genera un `visitorId` estable por sesión (`sessionStorage`)
- Al abrir el chat, recupera o crea automáticamente una conversación abierta
- Envía mensajes que se guardan en la base de datos vía `POST /api/chat`
- Recibe un mensaje de bienvenida automático del bot (una sola vez por conversación)

**Lado administrador** (`/admin/chats`):
- Lista todas las conversaciones (sondeo cada 8 segundos vía `GET /api/admin/chats`)
- Permite responder a los visitantes (`POST /api/admin/chats/[id]`)
- Marca conversaciones como leídas, las resuelve o reabre (`PATCH /api/admin/chats/[id]`)
- Contador de mensajes no leídos visible en el sidebar del panel

---

## 7. Categorías de productos

CRUD completo desde `/admin/categorias`:

- **Crear**: nombre + selección visual de ícono (16 íconos disponibles de Lucide), genera el *slug* automáticamente (minúsculas, sin acentos, separado por guiones)
- **Editar**: nombre y/o ícono; el *slug* se regenera si cambia el nombre
- **Eliminar**: por `ON DELETE SET NULL`, los productos asociados quedan sin categoría (no se eliminan)
- **Estadísticas por categoría**: cantidad de productos, precio promedio, productos con/sin stock
- Validación de duplicados (no permite nombres/slugs repetidos)
- Enlace directo "Ver en tienda" filtrado por esa categoría

---

## 8. Inventario

Desde `/admin/inventario`:

- Resumen visual: productos agotados, con stock bajo (≤5 unidades) y disponibles
- Búsqueda por nombre/categoría y filtro por estado de stock
- Ajuste rápido de stock con botones `+`/`-` o edición directa del número
- Los cambios se reflejan al instante en la interfaz (actualización optimista) **y se guardan en la base de datos**

---

## 9. Autenticación y roles

- Login con email/contraseña (`/login`), token JWT firmado con `JWT_SECRET` (expira en 8 horas)
- El token se guarda en cookie `ecoshop_token` y/o se envía como `Authorization: Bearer`
- Roles soportados: `admin`, `editor` (acceso al panel), y clientes regulares
- Rutas de administración protegidas mediante `requireAdmin()` (verifica token + rol)

---

## 10. Modelo de datos (SQL Server)

Tablas definidas en `prisma/migrations/001_init.sql`:

| Tabla | Propósito |
|---|---|
| `admin_users` | Usuarios del panel de administración (admin/editor) |
| `categories` | Categorías de productos (`id`, `name`, `slug`, `icon`) |
| `products` | Catálogo de productos (precio, stock, imágenes, variantes, tags, categoría, estado activo/destacado) |
| `customers` | Clientes registrados de la tienda |
| `orders` / `order_items` | Pedidos y sus líneas de detalle |
| `reviews` | Reseñas y valoraciones de productos |
| `coupons` | Cupones de descuento (porcentaje/monto fijo, límites de uso, vigencia) |
| `banners` | Banners promocionales del home |
| `shipping_zones` | Zonas y tarifas de envío |
| `tax_rates` | Tasas de impuestos |
| `chat_conversations` / `chat_messages` | Conversaciones y mensajes del chat de soporte |
| `settings` | Configuración general de la tienda |

---

## 11. Estado actual / pendientes conocidos

- **Conectado a base de datos real**: autenticación, productos (catálogo público + admin), categorías, inventario, chat de soporte, pedidos/clientes/usuarios/banners/cupones (vistas de administración).
- **Aún en datos de muestra (mock)**: los contextos `OrdersContext`, `CouponsContext` y `ReviewsContext` del lado tienda — las tablas correspondientes ya existen en la base de datos pero los contextos públicos todavía no las consultan.
- **Páginas de configuración estáticas** (`Envíos`, `Impuestos`, `Roles`, `Ajustes`, `Pagos`): actualmente manejan su estado solo en memoria del lado del cliente (`useState` con datos iniciales), sin persistencia en base de datos ni endpoints de API propios.
- Existe una advertencia de hidratación pre-existente en la página de inicio relacionada con el formato de números (`toLocaleString`) que difiere entre servidor y cliente.
