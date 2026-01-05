// fastorder-manager/src/components/QRCodeGenerator.jsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, Printer, QrCode as QrCodeIcon } from 'lucide-react'
import { APP_CONFIG } from '../config'

function QRCodeGenerator() {
  const [nombreTables, setNombreTables] = useState(10)
  const [baseUrl, setBaseUrl] = useState('')
  const canvasRefs = useRef([])

  useEffect(() => {
    const url = window.location.origin.replace('5174', '5173')
    setBaseUrl(url)
  }, [])

  const addLogoToQRCode = useCallback((canvas, tableNumber) => {
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Logo plus grand (25% de la taille du QR Code)
      const logoSize = canvas.width * 0.25
      const x = (canvas.width - logoSize) / 2
      const y = (canvas.height - logoSize) / 2
      
      // Fond blanc avec bordure colorée (plus grand)
      const bgRadius = logoSize / 1.6
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, bgRadius, 0, 2 * Math.PI)
      ctx.fill()
      
      // Bordure épaisse avec la couleur principale
      ctx.strokeStyle = APP_CONFIG.theme.primary
      ctx.lineWidth = 6
      ctx.stroke()
      
      // Ombre portée pour le logo
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      // Dessiner le logo (circulaire)
      ctx.save()
      ctx.beginPath()
      const logoRadius = logoSize / 2.1
      ctx.arc(canvas.width / 2, canvas.height / 2, logoRadius, 0, 2 * Math.PI)
      ctx.clip()
      ctx.drawImage(img, x + 6, y + 6, logoSize - 12, logoSize - 12)
      ctx.restore()
      
      // Réinitialiser l'ombre
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      
      // Ajouter le numéro de table en bas avec fond coloré
      const tableTextY = canvas.height - 15
      const tableText = `Table ${tableNumber}`
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      
      // Mesurer le texte pour le fond
      const textMetrics = ctx.measureText(tableText)
      const textWidth = textMetrics.width
      const padding = 12
      
      // Fond coloré pour le texte
      ctx.fillStyle = APP_CONFIG.theme.primary
      ctx.beginPath()
      ctx.roundRect(
        canvas.width / 2 - textWidth / 2 - padding,
        tableTextY - 20,
        textWidth + padding * 2,
        30,
        15
      )
      ctx.fill()
      
      // Texte blanc
      ctx.fillStyle = '#ffffff'
      ctx.fillText(tableText, canvas.width / 2, tableTextY)
    }
    
    img.onerror = () => {
      console.error('Impossible de charger le logo')
      // Dessiner un placeholder si le logo ne charge pas
      const ctx = canvas.getContext('2d')
      const logoSize = canvas.width * 0.25
      
      ctx.fillStyle = APP_CONFIG.theme.primary
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('LOGO', canvas.width / 2, canvas.height / 2 + 7)
    }
    
    img.src = APP_CONFIG.restaurant.logo
  }, [])

  const generateSimpleQRCode = useCallback((canvas, url, tableNumber) => {
    const ctx = canvas.getContext('2d')
    canvas.width = 300
    canvas.height = 300
    
    // Fond blanc
    ctx.fillStyle = APP_CONFIG.theme.primaryBg || '#ffffff'
    ctx.fillRect(0, 0, 300, 300)
    
    // Message d'erreur
    ctx.fillStyle = APP_CONFIG.theme.primary
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('QR Code Module manquant', 150, 120)
    ctx.font = '14px Arial'
    ctx.fillText('Installez: npm install qrcode', 150, 150)
    ctx.fillText(`Table ${tableNumber}`, 150, 180)
  }, [])

  const generateQRCode = useCallback((tableNumber, canvas) => {
    if (!canvas || !baseUrl) return

    const uuid = 'table_' + tableNumber + '_' + Date.now().toString(36)
    const url = `${baseUrl}?table=${tableNumber}&uuid=${uuid}`
    
    const qrColor = APP_CONFIG.theme.primary
    const bgColor = APP_CONFIG.theme.primaryBg || '#ffffff'
    
    // Charger QRCode depuis CDN si le module n'est pas installé
    if (window.QRCode) {
      window.QRCode.toCanvas(canvas, url, {
        width: 300,
        margin: 2,
        color: {
          dark: qrColor,
          light: bgColor
        },
        errorCorrectionLevel: 'H'
      }, (error) => {
        if (error) {
          console.error('Erreur génération QR Code:', error)
        } else {
          addLogoToQRCode(canvas, tableNumber)
        }
      })
    } else {
      // Fallback: essayer d'importer le module
      import('qrcode').then(QRCode => {
        QRCode.toCanvas(canvas, url, {
          width: 300,
          margin: 2,
          color: {
            dark: qrColor,
            light: bgColor
          },
          errorCorrectionLevel: 'H'
        }, (error) => {
          if (error) {
            console.error('Erreur génération QR Code:', error)
          } else {
            addLogoToQRCode(canvas, tableNumber)
          }
        })
      }).catch(err => {
        console.error('QRCode module non disponible:', err)
        // Générer manuellement un QR code simple
        generateSimpleQRCode(canvas, url, tableNumber)
      })
    }
  }, [baseUrl, addLogoToQRCode, generateSimpleQRCode])

  const generateAllQRCodes = useCallback(() => {
    for (let i = 0; i < nombreTables; i++) {
      generateQRCode(i + 1, canvasRefs.current[i])
    }
  }, [nombreTables, generateQRCode])

  useEffect(() => {
    if (baseUrl && canvasRefs.current.length > 0) {
      generateAllQRCodes()
    }
  }, [baseUrl, nombreTables, generateAllQRCodes])

  const downloadQRCode = (tableNumber) => {
    const canvas = canvasRefs.current[tableNumber - 1]
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `QR-Code-Table-${tableNumber}-${APP_CONFIG.restaurant.nom}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const downloadAllQRCodes = () => {
    for (let i = 1; i <= nombreTables; i++) {
      setTimeout(() => downloadQRCode(i), i * 100)
    }
  }

  const printQRCode = (tableNumber) => {
    const canvas = canvasRefs.current[tableNumber - 1]
    if (!canvas) return

    const printWindow = window.open('', '', 'width=800,height=600')
    const imgData = canvas.toDataURL()
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - Table ${tableNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          
          body {
            margin: 0;
            padding: 40px;
            font-family: 'Poppins', Arial, sans-serif;
            text-align: center;
            background: linear-gradient(135deg, ${APP_CONFIG.theme.primaryBg} 0%, #ffffff 100%);
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 40px;
            border: 4px solid ${APP_CONFIG.theme.primary};
            border-radius: 30px;
            background: white;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          }
          .logo-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 20px;
          }
          .logo {
            width: 100px;
            height: 100px;
            margin: 0 auto;
            border-radius: 50%;
            border: 4px solid ${APP_CONFIG.theme.primary};
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }
          h1 {
            color: ${APP_CONFIG.theme.primary};
            font-size: 42px;
            margin: 20px 0 10px 0;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          h2 {
            color: ${APP_CONFIG.theme.secondary || APP_CONFIG.theme.primary};
            font-size: 64px;
            margin: 10px 0;
            font-weight: 700;
            background: linear-gradient(135deg, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.secondary || APP_CONFIG.theme.primaryHover});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .qr-code {
            margin: 30px 0;
            position: relative;
          }
          .qr-code img {
            width: 350px;
            height: 350px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .scan-instruction {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, ${APP_CONFIG.theme.primary}15, ${APP_CONFIG.theme.accent}15);
            border-radius: 20px;
            border: 3px dashed ${APP_CONFIG.theme.primary};
          }
          .arrow {
            font-size: 48px;
            animation: bounce 1.5s ease-in-out infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .scan-text {
            color: ${APP_CONFIG.theme.primary};
            font-size: 28px;
            font-weight: 700;
            text-align: left;
          }
          .scan-emoji {
            font-size: 42px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 25px;
            border-top: 3px solid ${APP_CONFIG.theme.primary};
            color: ${APP_CONFIG.theme.primary};
            font-weight: 600;
            font-size: 18px;
          }
          @media print {
            body { margin: 0; padding: 20px; background: white; }
            .container { page-break-after: always; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="${APP_CONFIG.restaurant.logo}" alt="Logo" class="logo" />
          <h1>${APP_CONFIG.restaurant.nom}</h1>
          <h2>Table ${tableNumber}</h2>
          
          <div class="scan-instruction">
            <span class="scan-emoji">📱</span>
            <div class="scan-text">
              Scannez ce code<br/>pour commander
            </div>
            <span class="arrow">👇</span>
          </div>
          
          <div class="qr-code">
            <img src="${imgData}" alt="QR Code" />
          </div>
          
          <div class="footer">
            ✨ ${APP_CONFIG.restaurant.slogan || 'Commandez facilement'} ✨
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const printAllQRCodes = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - ${APP_CONFIG.restaurant.nom}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .qr-container {
            display: inline-block;
            width: 45%;
            margin: 10px;
            padding: 20px;
            border: 3px solid ${APP_CONFIG.theme.primary};
            border-radius: 15px;
            text-align: center;
            background: linear-gradient(135deg, ${APP_CONFIG.theme.primaryBg} 0%, #ffffff 100%);
            page-break-inside: avoid;
          }
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 10px;
            border-radius: 50%;
            border: 2px solid ${APP_CONFIG.theme.primary};
          }
          h3 {
            color: ${APP_CONFIG.theme.primary};
            font-size: 24px;
            margin: 10px 0;
          }
          h4 {
            color: ${APP_CONFIG.theme.secondary || APP_CONFIG.theme.primary};
            font-size: 36px;
            margin: 5px 0;
          }
          img.qr {
            width: 250px;
            height: 250px;
            margin: 10px 0;
          }
          p {
            color: #666;
            font-size: 14px;
          }
          @media print {
            .qr-container { width: 48%; }
          }
        </style>
      </head>
      <body>
    `

    for (let i = 1; i <= nombreTables; i++) {
      const canvas = canvasRefs.current[i - 1]
      if (canvas) {
        const imgData = canvas.toDataURL()
        htmlContent += `
          <div class="qr-container">
            <img src="${APP_CONFIG.restaurant.logo}" alt="Logo" class="logo" />
            <h3>${APP_CONFIG.restaurant.nom}</h3>
            <h4>Table ${i}</h4>
            <img src="${imgData}" alt="QR Code Table ${i}" class="qr" />
            <p>📱 Scannez pour commander</p>
          </div>
        `
      }
    }

    htmlContent += `
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <QrCodeIcon size={32} style={{ color: APP_CONFIG.theme.primary }} />
              Générateur de QR Codes
            </h2>
            <p className="text-gray-600 mt-2">
              QR Codes personnalisés avec les couleurs de {APP_CONFIG.restaurant.nom}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={downloadAllQRCodes}
              className="px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              style={{
                backgroundColor: APP_CONFIG.theme.success,
                color: '#ffffff'
              }}
            >
              <Download size={20} />
              Tout télécharger
            </button>
            
            <button
              onClick={printAllQRCodes}
              className="px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              style={{
                backgroundColor: APP_CONFIG.theme.primary,
                color: '#ffffff'
              }}
            >
              <Printer size={20} />
              Tout imprimer
            </button>
          </div>
        </div>

        {/* Configuration */}
        <div className="flex items-center gap-4">
          <label className="text-gray-700 font-semibold">Nombre de tables :</label>
          <input
            type="number"
            value={nombreTables}
            onChange={(e) => setNombreTables(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="100"
            className="px-4 py-2 border-2 rounded-xl font-semibold focus:outline-none focus:ring-2"
            style={{
              borderColor: APP_CONFIG.theme.primary
            }}
          />
          <span className="text-gray-600">table(s)</span>
        </div>
      </div>

      {/* Grille de QR Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: nombreTables }, (_, i) => i + 1).map((tableNumber) => (
          <div key={tableNumber} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold" style={{ color: APP_CONFIG.theme.primary }}>
                Table {tableNumber}
              </h3>
            </div>
            
            {/* QR Code avec flèche animée */}
            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-4 mb-4 flex justify-center items-center"
                style={{ backgroundColor: APP_CONFIG.theme.primaryBg }}
              >
                <canvas
                  ref={(el) => (canvasRefs.current[tableNumber - 1] = el)}
                  className="rounded-lg shadow-md"
                />
              </div>
              
              {/* Flèche animée et texte */}
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {/* Flèche animée qui pointe vers le QR Code */}
                    <svg 
                      width="60" 
                      height="60" 
                      viewBox="0 0 60 60"
                      className="animate-bounce-horizontal"
                      style={{ filter: `drop-shadow(2px 2px 4px rgba(0,0,0,0.2))` }}
                    >
                      <path
                        d="M 50 30 L 35 20 L 35 25 L 10 25 L 10 35 L 35 35 L 35 40 Z"
                        fill={APP_CONFIG.theme.primary}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div 
                    className="mt-2 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg"
                    style={{ 
                      backgroundColor: APP_CONFIG.theme.primary,
                      color: '#ffffff'
                    }}
                  >
                    📱 Scannez<br/>pour commander
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadQRCode(tableNumber)}
                className="flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white"
                style={{ backgroundColor: APP_CONFIG.theme.success }}
              >
                <Download size={18} />
                Télécharger
              </button>
              
              <button
                onClick={() => printQRCode(tableNumber)}
                className="flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white"
                style={{ backgroundColor: APP_CONFIG.theme.primary }}
              >
                <Printer size={18} />
                Imprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QRCodeGenerator