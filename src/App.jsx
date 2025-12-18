import { useState } from 'react'
import { ChefHat, ShoppingBag, QrCode } from 'lucide-react'
import MenuManager from './components/MenuManager'
import OrdersDisplay from './components/OrdersDisplay'
import QRCodeGenerator from './components/QRCodeGenerator'
import './App.css'
import { APP_CONFIG } from './config'

function App() {
  const [activeTab, setActiveTab] = useState('menu')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="text-white shadow-xl"
  style={{ 
    background: `linear-gradient(to right, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.secondary})`
  }}
>
  <div className="max-w-7xl mx-auto px-6 py-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Logo */}
        {APP_CONFIG.restaurant.logo && (
          <img 
            src={APP_CONFIG.restaurant.logo} 
            alt={APP_CONFIG.restaurant.nom}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ChefHat size={36} />
            {APP_CONFIG.restaurant.nom}
          </h1>
          <p className="mt-1" style={{ color: `${APP_CONFIG.theme.primary}15` }}>
            {APP_CONFIG.restaurant.slogan}
          </p>
        </div>
      </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
              <p className="text-sm font-semibold">🔐 Mode Administrateur</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation par onglets */}
      <nav className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
              }`}
            >
              <ChefHat size={20} />
              Gestion du Menu
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag size={20} />
              Commandes
            </button>
            <button
              onClick={() => setActiveTab('qrcode')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'qrcode'
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
              }`}
            >
              <QrCode size={20} />
              QR Codes
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'menu' && <MenuManager />}
        {activeTab === 'orders' && <OrdersDisplay />}
        {activeTab === 'qrcode' && <QRCodeGenerator />}
      </main>
    </div>
  )
}

export default App