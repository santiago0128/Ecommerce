import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-white">EcoShop</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Tu destino de compras online de confianza. Calidad, precios competitivos y envío rápido a toda España.
            </p>
            <div className="flex gap-4 mt-6">
              {['Facebook', 'Twitter', 'Instagram'].map(social => (
                <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Tienda</h4>
            <ul className="space-y-2">
              {[
                { label: 'Todos los productos', href: '/tienda' },
                { label: 'Electrónica', href: '/tienda?category=electronica' },
                { label: 'Ropa', href: '/tienda?category=ropa' },
                { label: 'Hogar', href: '/tienda?category=hogar' },
                { label: 'Deportes', href: '/tienda?category=deportes' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Ayuda</h4>
            <ul className="space-y-2">
              {['Preguntas frecuentes', 'Envíos y devoluciones', 'Contacto', 'Privacidad', 'Términos de uso'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2024 EcoShop. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs">Pagos seguros con</span>
            {['Visa', 'Mastercard', 'PayPal'].map(pay => (
              <span key={pay} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                {pay}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
