import { useState, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, QrCode as QrCodeIcon } from 'lucide-react'
import { APP_CONFIG } from '../config'  // ← AJOUTEZ

function QRCodeGenerator() {
  const [numeroTable, setNumeroTable] = useState(1)
  // ✅ URL verrouillée depuis la config
  const baseUrl = APP_CONFIG.urls.client

  // Générer l'URL avec paramètres - UUID fixe par table
  const generateUrl = (table) => {
    const fixedUserId = `table_${table}_${btoa(String(table)).substring(0, 8)}`
    return `${baseUrl}/?table=${table}&uuid=${fixedUserId}`
  }

  const downloadQRCode = (table) => {
    // Pour QRCodeSVG, on doit convertir le SVG en PNG
    const svg = document.getElementById(`qr-${table}`)
    if (!svg) {
      alert('Erreur: QR Code introuvable')
      return
    }

    // Créer un canvas temporaire pour la conversion
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    
    img.onload = function() {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `FastOrder-Table-${table}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  // Mémoriser la liste des tables
  const tables = useMemo(() => {
    const tableList = []
    for (let i = 1; i <= 20; i++) {
      tableList.push(i)
    }
    return tableList
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <QrCodeIcon size={36} className="text-orange-500" />
          Générateur de QR Codes
        </h2>
        <p className="text-gray-600 mt-2">
          Générez des QR Codes pour chaque table de votre restaurant
        </p>
      </div>

      {/* Info URL Verrouillée */}
<div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
  <div className="flex items-start gap-3">
    <div className="bg-blue-500 text-white p-2 rounded-lg">
      <QrCodeIcon size={24} />
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        URL de l'Application Client
      </h3>
      <p className="text-gray-700 font-mono text-sm bg-white px-4 py-2 rounded-lg border border-blue-200">
        {baseUrl}
      </p>
      <p className="text-sm text-gray-600 mt-2">
        🔒 URL verrouillée. Pour la modifier, éditez le fichier <code className="bg-gray-100 px-2 py-1 rounded">src/config.js</code>
      </p>
    </div>
  </div>
</div>

      {/* QR Code unique */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Générer un QR Code pour une Table Spécifique
        </h3>

        <div className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-xs">
            <label className="block text-gray-700 font-semibold mb-2 text-center">
              Numéro de Table
            </label>
            <input
              type="number"
              min="1"
              value={numeroTable}
              onChange={(e) => setNumeroTable(parseInt(e.target.value) || 1)}
              className="w-full px-6 py-4 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none text-center text-2xl font-bold"
            />
          </div>

        <div className="relative">
  <QRCodeSVG
    id={`qr-${numeroTable}`}
    value={generateUrl(numeroTable)}
    size={256}
    level="H"
    includeMargin={true}
    fgColor={APP_CONFIG.qrCode.couleurPrincipale}
  />
  
  {/* Texte au-dessus */}
  <div className="absolute -top-8 left-0 right-0 text-center">
    <p className="text-sm font-bold px-4 py-2 rounded-full inline-block shadow-md"
      style={{ 
        backgroundColor: APP_CONFIG.theme.primary,
        color: 'white'
      }}
    >
      {APP_CONFIG.qrCode.texteAppel}
    </p>
  </div>
  
  {/* Nom du restaurant en bas */}
  <div className="absolute -bottom-8 left-0 right-0 text-center">
    <p className="text-xs font-semibold px-4 py-1 rounded-full inline-block"
      style={{ 
        backgroundColor: `${APP_CONFIG.theme.primary}20`,
        color: APP_CONFIG.theme.primary
      }}
    >
      {APP_CONFIG.restaurant.nom}
    </p>
  </div>
</div>

{/* QR Code */}
<div className="bg-white p-8 pt-16 pb-16 rounded-2xl shadow-xl">  {/* ← Ajoutez pt-16 pb-16 */}
          </div>

          <div className="text-center">
            <p className="text-gray-700 font-semibold mb-2">Table {numeroTable}</p>
            <p className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg font-mono max-w-md break-all">
              {generateUrl(numeroTable)}
            </p>
          </div>

          <button
            onClick={() => downloadQRCode(numeroTable)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
          >
            <Download size={24} />
            Télécharger le QR Code
          </button>
        </div>
      </div>

      {/* Grille de tous les QR Codes */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Tous les QR Codes (Tables 1 à 20)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tables.map(table => (
            <div key={table} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition">
              <div className="bg-white p-3 rounded-lg mb-3 flex justify-center">
                <QRCodeSVG
                  id={`qr-${table}`}
                  value={generateUrl(table)}
                  size={128}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-center font-bold text-gray-800 mb-2">Table {table}</p>
              <button
                onClick={() => downloadQRCode(table)}
                className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Télécharger
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QRCodeGenerator