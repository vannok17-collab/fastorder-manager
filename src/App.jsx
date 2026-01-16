// fastorder-manager/src/App.jsx
import { useState } from 'react'
import { ChefHat, ShoppingBag, QrCode } from 'lucide-react'
import { useTheme } from './hooks/useTheme'
import { APP_CONFIG } from './config'
import MenuManager from './components/MenuManager'
import OrdersDisplay from './components/OrdersDisplay'
import QRCodeGenerator from './components/QRCodeGenerator'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('menu')
  const [commandesEnAttente, setCommandesEnAttente] = useState(0)
  
  // ✨ Utilisation du hook useTheme
  const { theme, loading: themeLoading, ready: themeReady } = useTheme()

  // ✨ Écran de chargement du thème amélioré
  if (themeLoading || !themeReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-200 border-t-orange-500 mx-auto"></div>
            {APP_CONFIG.restaurant.logo && (
              <img 
                src={APP_CONFIG.restaurant.logo} 
                alt={APP_CONFIG.restaurant.nom}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full object-cover shadow-lg"
              />
            )}
          </div>
          <p className="text-gray-700 font-bold text-xl mb-2">
            {APP_CONFIG.restaurant.nom}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Mode Administrateur
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header avec couleurs dynamiques */}
      <header className="text-white shadow-xl"
        style={{ 
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryHover} 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {APP_CONFIG.restaurant.logo && (
                <img 
                  src={APP_CONFIG.restaurant.logo} 
                  alt={APP_CONFIG.restaurant.nom}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-white/30"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <ChefHat size={36} />
                  {APP_CONFIG.restaurant.nom}
                </h1>
                <p className="mt-1 opacity-90 text-lg">
                  {APP_CONFIG.restaurant.slogan}
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
              <p className="text-sm font-semibold">⚙️ Mode Administrateur</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation avec couleurs dynamiques */}
      <nav className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('menu')}
              className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'menu' ? 'border-b-4' : 'hover:bg-gray-50'
              }`}
              style={{
                color: activeTab === 'menu' ? theme.primary : '#6b7280',
                borderColor: activeTab === 'menu' ? theme.primary : 'transparent',
                backgroundColor: activeTab === 'menu' ? `${theme.primary}10` : 'transparent'
              }}
            >
              <ChefHat size={20} />
              Gestion du Menu
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'orders' ? 'border-b-4' : 'hover:bg-gray-50'
              }`}
              style={{
                color: activeTab === 'orders' ? theme.primary : '#6b7280',
                borderColor: activeTab === 'orders' ? theme.primary : 'transparent',
                backgroundColor: activeTab === 'orders' ? `${theme.primary}10` : 'transparent'
              }}
            >
              <ShoppingBag size={20} />
              <span>Commandes</span>
              {commandesEnAttente > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse"
                  style={{ backgroundColor: theme.danger }}
                >
                  {commandesEnAttente}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('qrcode')}
              className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'qrcode' ? 'border-b-4' : 'hover:bg-gray-50'
              }`}
              style={{
                color: activeTab === 'qrcode' ? theme.primary : '#6b7280',
                borderColor: activeTab === 'qrcode' ? theme.primary : 'transparent',
                backgroundColor: activeTab === 'qrcode' ? `${theme.primary}10` : 'transparent'
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