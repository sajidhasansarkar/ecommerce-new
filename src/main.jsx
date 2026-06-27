import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CategoryProvider } from './context/CategoryContext.jsx'
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx'
import App from './App.jsx'
import './index.css'

// একবার বানিয়ে পুরো অ্যাপে শেয়ার করা হচ্ছে — প্রতিটা কম্পোনেন্টে নতুন client বানালে
// cache শেয়ার হবে না, তাই এটা সবসময় top-level-এ একবারই বানাতে হয়।
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // ৩০ সেকেন্ড পর্যন্ত ডেটা "fresh" ধরা হবে, ফালতু রিফেচ হবে না
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <SiteSettingsProvider>
              <CategoryProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </CategoryProvider>
            </SiteSettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
