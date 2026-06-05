'use client';

import { useProducts } from '@/context/ProductsContext';
import { categories } from '@/data/products';
import Link from 'next/link';

export default function AdminCategorias() {
  const { products } = useProducts();

  const catStats = categories.map(cat => {
    const prods = products.filter(p => p.category === cat.slug);
    const avgPrice = prods.length
      ? (prods.reduce((s, p) => s + p.price, 0) / prods.length).toFixed(2)
      : '0.00';
    const inStock = prods.filter(p => p.stock > 0).length;
    return { ...cat, count: prods.length, avgPrice, inStock };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <p className="text-gray-500 mt-1">Vista general de categorías de la tienda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {catStats.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-3xl">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.count} productos</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Precio promedio</span>
                <span className="font-medium text-gray-900">${cat.avgPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Con stock</span>
                <span className="font-medium text-emerald-600">{cat.inStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sin stock</span>
                <span className="font-medium text-red-500">{cat.count - cat.inStock}</span>
              </div>
            </div>
            <Link
              href={`/tienda?category=${cat.slug}`}
              target="_blank"
              className="mt-4 block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Ver en tienda →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
