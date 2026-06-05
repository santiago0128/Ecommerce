import { Shield, RotateCcw, Truck, Lock } from 'lucide-react';

const sections = [
  {
    icon: RotateCcw,
    title: 'Política de devoluciones',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    content: [
      { heading: 'Plazo de devolución', text: 'Tienes 30 días desde la fecha de recepción del pedido para solicitar una devolución sin necesidad de dar ninguna explicación.' },
      { heading: 'Condiciones', text: 'El producto debe estar en su estado original, sin usar, con todas las etiquetas y en su embalaje original. Los productos personalizados o con sellos de higiene abiertos no son devolvibles.' },
      { heading: 'Proceso de devolución', text: 'Contacta con nuestro servicio de atención al cliente en soporte@ecoshop.com indicando el número de pedido. Te enviaremos una etiqueta de devolución gratuita por email.' },
      { heading: 'Reembolso', text: 'Una vez recibido y verificado el producto, procesaremos el reembolso en un plazo de 3-5 días hábiles al mismo método de pago utilizado en la compra.' },
    ],
  },
  {
    icon: Lock,
    title: 'Política de privacidad',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    content: [
      { heading: 'Datos que recopilamos', text: 'Recopilamos nombre, dirección de email, dirección de envío y datos de pago (almacenados de forma segura por nuestros procesadores de pago certificados PCI DSS).' },
      { heading: 'Uso de los datos', text: 'Usamos tus datos exclusivamente para procesar pedidos, enviarte confirmaciones y comunicaciones relacionadas con tu compra. Nunca vendemos ni compartimos tu información con terceros sin tu consentimiento.' },
      { heading: 'Cookies', text: 'Usamos cookies esenciales para el funcionamiento de la tienda y cookies de análisis anónimas para mejorar la experiencia. Puedes gestionar tus preferencias de cookies en cualquier momento.' },
      { heading: 'Tus derechos', text: 'Tienes derecho de acceso, rectificación, supresión y portabilidad de tus datos personales. Contacta con nosotros en privacidad@ecoshop.com para ejercer estos derechos.' },
    ],
  },
  {
    icon: Truck,
    title: 'Política de envíos',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    content: [
      { heading: 'Envío estándar', text: 'Entrega en 2-4 días hábiles. Gratuito en pedidos superiores a $50. Para pedidos inferiores, el coste es de $4.99.' },
      { heading: 'Envío express', text: 'Entrega al día siguiente (laborable) para pedidos realizados antes de las 14:00. Disponible por $9.99 independientemente del importe del pedido.' },
      { heading: 'Zonas de envío', text: 'Actualmente enviamos a España peninsular, Islas Baleares, Canarias, Ceuta y Melilla. Los envíos a Canarias pueden tener costes adicionales de aduana.' },
      { heading: 'Seguimiento', text: 'Recibirás un email con el número de seguimiento cuando tu pedido sea enviado. Puedes rastrear tu paquete en tiempo real desde la sección "Mis pedidos".' },
    ],
  },
  {
    icon: Shield,
    title: 'Términos y condiciones',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    content: [
      { heading: 'Aceptación de condiciones', text: 'Al realizar una compra en EcoShop, aceptas estos términos y condiciones en su totalidad. Nos reservamos el derecho a modificarlos con previo aviso.' },
      { heading: 'Precios', text: 'Los precios mostrados incluyen el IVA aplicable. Nos reservamos el derecho a modificar precios en cualquier momento, aunque los pedidos confirmados mantendrán el precio en el momento de la compra.' },
      { heading: 'Disponibilidad', text: 'Todos los pedidos están sujetos a disponibilidad de stock. En caso de no poder servir un producto, te notificaremos inmediatamente y realizaremos el reembolso completo.' },
      { heading: 'Propiedad intelectual', text: 'Todo el contenido de esta web (imágenes, textos, logotipos) es propiedad de EcoShop o de sus proveedores y está protegido por las leyes de propiedad intelectual.' },
    ],
  },
];

export default function PoliticasPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-gray-900 mb-3">Políticas de EcoShop</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Toda la información sobre devoluciones, privacidad, envíos y condiciones de uso de nuestra tienda.
        </p>
        <p className="text-xs text-gray-400 mt-3">Última actualización: 1 de enero de 2025</p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
                <div className={`w-11 h-11 ${section.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <h2 className="text-lg font-black text-gray-900">{section.title}</h2>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {section.content.map(item => (
                  <div key={item.heading}>
                    <h3 className="font-bold text-gray-800 text-sm mb-1.5">{item.heading}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm">
          ¿Tienes dudas sobre nuestras políticas?{' '}
          <a href="/contacto" className="text-indigo-600 font-semibold hover:underline">
            Contacta con nosotros
          </a>
        </p>
      </div>
    </div>
  );
}
