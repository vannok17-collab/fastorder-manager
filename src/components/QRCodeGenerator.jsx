import { useState, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, QrCode as QrCodeIcon } from 'lucide-react'
import { APP_CONFIG } from '../config'

function QRCodeGenerator() {
  const [numeroTable, setNumeroTable] = useState(1)
  const baseUrl = APP_CONFIG.urls.client

  const generateUrl = (table) => {
    const fixedUserId = `table_${table}_${btoa(String(table)).substring(0, 8)}`
    return `${baseUrl}/?table=${table}&uuid=${fixedUserId}`
  }

  const downloadQRCode = (table) => {
    const svg = document.getElementById(`qr-${table}`)
    if (!svg) {
      alert('Erreur: QR Code introuvable')
      return
    }

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
      downloadLink.download = `${APP_CONFIG.restaurant.nom.replace(/\s+/g, '-')}-Table-${table}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const tables = useMemo(() => {
    const tableList = []
    for (let i = 1; i <= APP_CONFIG.options.nombreTables; i++) {
      tableList.push(i)
    }
    return tableList
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <QrCodeIcon size={36} style={{ color: APP_CONFIG.theme.primary }} />
          Générateur de QR Codes
        </h2>
        <p className="text-gray-600 mt-2">
          Générez des QR Codes pour chaque table de votre restaurant
        </p>
      </div>

      {/* Info URL Verrouillée */}
      <div className="rounded-2xl p-6 border-2"
        style={{
          backgroundColor: `${APP_CONFIG.theme.info}10`,
          borderColor: `${APP_CONFIG.theme.info}40`
        }}
      >
        <div className="flex items-start gap-3">
          <div className="text-white p-2 rounded-lg"
            style={{ backgroundColor: APP_CONFIG.theme.info }}
          >
            <QrCodeIcon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              URL de l'Application Client
            </h3>
            <p className="text-gray-700 font-mono text-sm bg-white px-4 py-2 rounded-lg border"
              style={{ borderColor: `${APP_CONFIG.theme.info}40` }}
            >
              {baseUrl}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              URL verrouillée. Pour la modifier, éditez le fichier <code className="bg-gray-100 px-2 py-1 rounded">src/config.js</code>
            </p>
          </div>
        </div>
      </div>

      {/* QR Code unique */}
      <div className="rounded-2xl shadow-lg p-8"
        style={{
          background: `linear-gradient(to bottom right, ${APP_CONFIG.theme.primaryBg}, ${APP_CONFIG.theme.primary}20)`
        }}
      >
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
              max={APP_CONFIG.options.nombreTables}
              value={numeroTable}
              onChange={(e) => setNumeroTable(parseInt(e.target.value) || 1)}
              className="w-full px-6 py-4 border-2 rounded-xl focus:outline-none text-center text-2xl font-bold"
              style={{ 
                borderColor: APP_CONFIG.theme.primary,
                color: APP_CONFIG.theme.primary
              }}
            />
          </div>

          {/* QR Code avec textes */}
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="relative" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
              {/* Texte au-dessus */}
              <div className="absolute top-0 left-0 right-0 text-center">
                <p className="text-base font-bold px-6 py-3 rounded-xl inline-block shadow-lg"
                  style={{ 
                    backgroundColor: APP_CONFIG.theme.primary,
                    color: 'white'
                  }}
                >
                  {APP_CONFIG.qrCode.texteAppel}
                </p>
              </div>
              
              {/* QR Code */}
              <div className="flex justify-center">
                <QRCodeSVG
                  id={`qr-${numeroTable}`}
                  value={generateUrl(numeroTable)}
                  size={256}
                  level="H"
                  includeMargin={true}
                  fgColor={APP_CONFIG.qrCode.couleurPrincipale}
                />
              </div>
              
              {/* Nom du restaurant en bas */}
              <div className="absolute bottom-0 left-0 right-0 text-center">
                <p className="text-sm font-bold px-6 py-2 rounded-xl inline-block shadow-md border-2"
                  style={{ 
                    backgroundColor: 'white',
                    color: APP_CONFIG.theme.primary,
                    borderColor: APP_CONFIG.theme.primary
                  }}
                >
                  {APP_CONFIG.restaurant.nom}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-700 font-semibold mb-2">Table {numeroTable}</p>
            <p className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg font-mono max-w-md break-all">
              {generateUrl(numeroTable)}
            </p>
          </div>

          <button
            onClick={() => downloadQRCode(numeroTable)}
            className="text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
            style={{ background: `linear-gradient(to right, ${APP_CONFIG.theme.success}, ${APP_CONFIG.theme.successHover})` }}
          >
            <Download size={24} />
            Télécharger le QR Code
          </button>
        </div>
      </div>

      {/* Grille de tous les QR Codes */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Tous les QR Codes (Tables 1 à {APP_CONFIG.options.nombreTables})
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tables.map(table => (
            <div key={table} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition">
              <div className="bg-white p-3 rounded-lg mb-3">
                <div className="relative" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                  {/* Texte "Scanner ici" */}
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg inline-block"
                      style={{ 
                        backgroundColor: APP_CONFIG.theme.primary,
                        color: 'white',
                        fontSize: '9px'
                      }}
                    >
                      Scanner ici
                    </span>
                  </div>
                  
                  {/* QR Code */}
                  <div className="flex justify-center my-2">
                    <QRCodeSVG
                      id={`qr-${table}`}
                      value={generateUrl(table)}
                      size={128}
                      level="H"
                      includeMargin={true}
                      fgColor={APP_CONFIG.qrCode.couleurPrincipale}
                    />
                  </div>
                  
                  {/* Badge table */}
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <span className="text-xs font-bold px-3 py-1 rounded-full shadow-md inline-block"
                      style={{ 
                        backgroundColor: APP_CONFIG.theme.primary,
                        color: 'white'
                      }}
                    >
                      Table {table}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => downloadQRCode(table)}
                className="w-full text-white py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                style={{ backgroundColor: APP_CONFIG.theme.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = APP_CONFIG.theme.primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = APP_CONFIG.theme.primary}
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