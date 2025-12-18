import { useState } from 'react'
import { ChefHat, ShoppingBag, QrCode } from 'lucide-react'
import MenuManager from './components/MenuManager'
import OrdersDisplay from './components/OrdersDisplay'
import QRCodeGenerator from './components/QRCodeGenerator'
import './App.css'
import { APP_CONFIG } from './config'

function App() {
  const [activeTab, setActiveTab] = useState('menu')
  const [commandesEnAttente, setCommandesEnAttente] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="text-white shadow-xl"
        style={{ 
          background: `linear-gradient(to right, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.primaryHover})`
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
                <p className="mt-1 opacity-90">
                  {APP_CONFIG.restaurant.slogan}
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
              <p className="text-sm font-semibold">Mode Administrateur</p>
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
              className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'border-b-4'
                  : 'hover:bg-gray-50'
              }`}
              style={{
                color: activeTab === 'menu' ? APP_CONFIG.theme.primary : '#6b7280',
                borderColor: activeTab === 'menu' ? APP_CONFIG.theme.primary : 'transparent',
                backgroundColor: activeTab === 'menu' ? `${APP_CONFIG.theme.primary}10` : 'transparent'
              }}
            >
              <ChefHat size={20} />
              Gestion du Menu
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'border-b-4'
                  : 'hover:bg-gray-50'
              }`}
              style={{
                color: activeTab === 'orders' ? APP_CONFIG.theme.primary : '#6b7280',
                borderColor: activeTab === 'orders' ? APP_CONFIG.theme.primary : 'transparent',
                backgroundColor: activeTab === 'orders' ? `${APP_CONFIG.theme.primary}10` : 'transparent'
              }}
            >
              <ShoppingBag size={20} />
              <span>Commandes</span>
              {/* Badge avec nombre de commandes en attente */}
              {commandesEnAttente > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse"
                  style={{ backgroundColor: APP_CONFIG.theme.danger }}
                >
                  {commandesEnAttente}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('qrcode')}
              className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'qrcode'
                  ? 'border-b-4'
                  : 'hover:bg-gray-50'
              }`}
              style={{
                color: activeTab === 'qrcode' ? APP_CONFIG.theme.primary : '#6b7280',
                borderColor: activeTab === 'qrcode' ? APP_CONFIG.theme.primary : 'transparent',
                backgroundColor: activeTab === 'qrcode' ? `${APP_CONFIG.theme.primary}10` : 'transparent'
              }}
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
        {activeTab === 'orders' && <OrdersDisplay onCountChange={setCommandesEnAttente} />}
        {activeTab === 'qrcode' && <QRCodeGenerator />}
      </main>
    </div>
  )
}

export default App