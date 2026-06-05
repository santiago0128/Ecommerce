'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Package, Tag, BarChart2, Settings,
  LogOut, Store, Menu, X, ChevronRight, Bell, Search,
  Boxes, ShoppingCart, Users, Ticket, ImageIcon, Truck, Receipt, CreditCard, Shield, MessageCircle,
} from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import { useChat } from '@/context/ChatContext';

const navSections = [
  {
    label: 'Principal',
    items: [
      { href: '/admin',            label: 'Dashboard',   icon: LayoutDashboard },
      { href: '/admin/productos',  label: 'Productos',   icon: Package },
      { href: '/admin/inventario', label: 'Inventario',  icon: Boxes },
      { href: '/admin/categorias', label: 'Categorías',  icon: Tag },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { href: '/admin/pedidos',    label: 'Pedidos',     icon: ShoppingCart },
      { href: '/admin/clientes',   label: 'Clientes',    icon: Users },
      { href: '/admin/chats',      label: 'Chats',       icon: MessageCircle },
      { href: '/admin/cupones',    label: 'Cupones',     icon: Ticket },
      { href: '/admin/banners',    label: 'Banners',     icon: ImageIcon },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { href: '/admin/reportes',   label: 'Reportes',    icon: BarChart2 },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { href: '/admin/usuarios',   label: 'Usuarios',    icon: Users },
      { href: '/admin/envios',     label: 'Envíos',      icon: Truck },
      { href: '/admin/impuestos',  label: 'Impuestos',   icon: Receipt },
      { href: '/admin/pagos',      label: 'Pagos',       icon: CreditCard },
      { href: '/admin/roles',      label: 'Roles',       icon: Shield },
      { href: '/admin/ajustes',    label: 'Ajustes',     icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin, loading } = useAuth();
  const { products } = useProducts();
  const { totalUnread: chatUnread } = useChat();
  const router  = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const lowStock   = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const alerts     = lowStock + outOfStock;

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.replace('/login');
  }, [user, isAdmin, loading, router]);

  // Wait for session check before rendering or redirecting
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (!user || !isAdmin) return null;

  const pageTitle = navSections
    .flatMap(s => s.items)
    .find(i => i.href === pathname)?.label ?? 'Admin';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <span className="text-white font-black text-base">E</span>
          </div>
          <div>
            <p className="font-black text-white text-sm leading-tight tracking-tight">EcoShop</p>
            <p className="text-indigo-400 text-[11px] font-medium">Panel de administración</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon   = item.icon;
                const active = pathname === item.href;
                const isInventoryBadge = item.href === '/admin/inventario' && alerts > 0;
                const isChatBadge     = item.href === '/admin/chats' && chatUnread > 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                      active
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                        : 'text-gray-400 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 group-hover:text-indigo-400'}`} style={{ width: 18, height: 18 }} />
                    <span className="flex-1">{item.label}</span>
                    {isInventoryBadge && (
                      <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {alerts}
                      </span>
                    )}
                    {isChatBadge && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {chatUnread}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick links to store */}
      <div className="px-3 py-3 border-t border-white/10">
        <Link
          href="/tienda"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all text-sm font-medium group"
        >
          <Store className="w-4 h-4 text-gray-500 group-hover:text-indigo-400" />
          <span>Ver tienda</span>
          <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-60" />
        </Link>
      </div>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-white text-sm font-semibold truncate leading-tight">{user.name}</p>
            <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 bg-[#0f1117] flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#0f1117] flex flex-col h-full shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm flex-1">
            <span className="text-gray-400 font-medium">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="font-semibold text-gray-800">{pageTitle}</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-56 group focus-within:border-indigo-400 focus-within:bg-white transition-all">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              placeholder="Buscar..."
              className="bg-transparent text-sm text-gray-600 outline-none placeholder-gray-400 flex-1"
            />
          </div>

          {/* Alerts bell */}
          <button className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            {alerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {alerts}
              </span>
            )}
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
              <p className="text-[11px] text-gray-400">Administrador</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
