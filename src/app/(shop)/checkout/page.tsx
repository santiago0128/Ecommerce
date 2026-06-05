'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrdersContext';
import { useCoupons } from '@/context/CouponsContext';
import { CheckoutForm, Coupon } from '@/types';
import { Tag, X, Check, ShoppingBag, Truck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const steps = [
  { label: 'Envío',        icon: Truck },
  { label: 'Pago',         icon: CreditCard },
  { label: 'Confirmación', icon: Check },
];

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { validateCoupon, useCoupon } = useCoupons();

  const [step, setStep] = useState(0);
  const [placedOrder, setPlacedOrder] = useState<{ number: string; total: number } | null>(null);
  const [couponCode, setCouponCode]   = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ coupon: Coupon; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  const [form, setForm] = useState<CheckoutForm>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zipCode: '', country: 'España',
    paymentMethod: 'card', cardNumber: '', cardExpiry: '', cardCvc: '',
  });

  const update = (key: keyof CheckoutForm, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const shippingCost = cart.total >= 50 ? 0 : 4.99;
  const discount     = appliedCoupon?.discount ?? 0;
  const total        = cart.total + shippingCost - discount;

  const handleApplyCoupon = () => {
    setCouponError('');
    const result = validateCoupon(couponCode, cart.total);
    if (!result.valid) {
      setCouponError(result.message);
      return;
    }
    setAppliedCoupon({ coupon: result.coupon!, discount: result.discount });
    toast.success(result.message);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  if (cart.items.length === 0 && !placedOrder) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-6">Agrega productos para continuar con el pago.</p>
        <Link href="/tienda" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3">¡Pedido confirmado!</h2>
        <p className="text-gray-600 mb-2 text-lg">Gracias por tu compra, <strong>{form.firstName}</strong>.</p>
        <p className="text-gray-500 mb-8">
          Confirmación enviada a <strong>{form.email}</strong>.<br />
          Recibirás tu pedido en 2-4 días hábiles.
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 max-w-sm w-full text-left shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Número de pedido</p>
          <p className="font-black text-gray-900 font-mono text-lg">{placedOrder.number}</p>
          <div className="border-t my-3" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total pagado</p>
          <p className="font-black text-xl text-gray-900">${placedOrder.total.toFixed(2)}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/pedidos" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Ver mis pedidos
          </Link>
          <Link href="/" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Finalizar compra</h1>

      {/* Steps */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => {
          const StepIcon = s.icon;
          return (
            <div key={s.label} className="flex items-center">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  i < step  ? 'bg-indigo-600 border-indigo-600 text-white' :
                  i === step ? 'border-indigo-600 text-indigo-600 bg-indigo-50' :
                              'border-gray-200 text-gray-400'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                </div>
                <span className="font-medium text-sm hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 transition-colors ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Dirección de envío</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'firstName', label: 'Nombre', placeholder: 'Juan' },
                  { key: 'lastName',  label: 'Apellidos', placeholder: 'García' },
                  { key: 'email', label: 'Email', placeholder: 'juan@ejemplo.com', type: 'email', span: true },
                  { key: 'phone', label: 'Teléfono', placeholder: '+34 600 000 000', type: 'tel' },
                  { key: 'address', label: 'Dirección', placeholder: 'Calle Mayor 1, 2ºA', span: true },
                  { key: 'city', label: 'Ciudad', placeholder: 'Madrid' },
                  { key: 'zipCode', label: 'Código postal', placeholder: '28001' },
                  { key: 'state', label: 'Provincia', placeholder: 'Madrid' },
                ].map(field => (
                  <div key={field.key} className={field.span ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof CheckoutForm] as string}
                      onChange={e => update(field.key as keyof CheckoutForm, e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!form.firstName || !form.email || !form.address}
                className="mt-6 w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Continuar con el pago →
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Método de pago</h2>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'card',     label: 'Tarjeta de crédito/débito', icon: '💳' },
                  { value: 'paypal',   label: 'PayPal',                    icon: '🅿️' },
                  { value: 'transfer', label: 'Transferencia bancaria',    icon: '🏦' },
                ].map(method => (
                  <label key={method.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.paymentMethod === method.value ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="paymentMethod" value={method.value}
                      checked={form.paymentMethod === method.value}
                      onChange={() => update('paymentMethod', method.value)}
                      className="accent-indigo-600"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-medium text-gray-800">{method.label}</span>
                  </label>
                ))}
              </div>

              {form.paymentMethod === 'card' && (
                <div className="space-y-4 border border-gray-200 rounded-xl p-4 bg-gray-50 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Número de tarjeta</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                      value={form.cardNumber} onChange={e => update('cardNumber', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vencimiento</label>
                      <input type="text" placeholder="MM/AA" maxLength={5}
                        value={form.cardExpiry} onChange={e => update('cardExpiry', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVC</label>
                      <input type="text" placeholder="123" maxLength={4}
                        value={form.cardCvc} onChange={e => update('cardCvc', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">← Volver</button>
                <button onClick={() => setStep(2)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Revisar pedido →</button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Resumen del pedido</h2>
              <div className="space-y-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dirección de envío</h3>
                  <p className="text-sm text-gray-700">{form.firstName} {form.lastName}</p>
                  <p className="text-sm text-gray-600">{form.address}, {form.zipCode} {form.city}</p>
                  <p className="text-sm text-gray-500">{form.email} · {form.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Método de pago</h3>
                  <p className="text-sm text-gray-700 capitalize">{form.paymentMethod}</p>
                  {form.paymentMethod === 'card' && form.cardNumber && (
                    <p className="text-sm text-gray-500">•••• •••• •••• {form.cardNumber.slice(-4)}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">← Volver</button>
                <button
                  onClick={() => {
                    const order = placeOrder(cart, form as unknown as Record<string, string>);
                    if (appliedCoupon) useCoupon(appliedCoupon.coupon.code);
                    clearCart();
                    setPlacedOrder({ number: order.number, total: order.total - discount });
                  }}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black hover:bg-emerald-700 transition-colors"
                >
                  Confirmar pedido · ${total.toFixed(2)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Tu pedido</h3>
            <ul className="space-y-3 mb-4">
              {cart.items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-gray-400">x{quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            {/* Coupon */}
            <div className="border-t pt-4 mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Tag className="w-4 h-4" />
                    <span className="font-bold text-sm">{appliedCoupon.coupon.code}</span>
                    <span className="text-xs">-${appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-emerald-500 hover:text-emerald-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      placeholder="Código de cupón"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span className={shippingCost === 0 ? 'text-emerald-600 font-semibold' : ''}>
                  {shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                  <span>Descuento cupón</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-gray-900 pt-2 border-t text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
