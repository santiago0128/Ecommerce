import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { OrdersProvider } from '@/context/OrdersContext';
import { ReviewsProvider } from '@/context/ReviewsContext';
import { CouponsProvider } from '@/context/CouponsContext';
import { ChatProvider } from '@/context/ChatContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcoShop — Tu tienda online de confianza',
  description: 'Encuentra los mejores productos de electrónica, ropa, hogar y más con los mejores precios.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <ProductsProvider>
            <OrdersProvider>
              <CouponsProvider>
                <WishlistProvider>
                  <ReviewsProvider>
                    <ChatProvider>
                      <CartProvider>
                        {children}
                        <Toaster
                          position="bottom-right"
                          toastOptions={{ style: { borderRadius: '14px', fontFamily: 'inherit' } }}
                        />
                      </CartProvider>
                    </ChatProvider>
                  </ReviewsProvider>
                </WishlistProvider>
              </CouponsProvider>
            </OrdersProvider>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
