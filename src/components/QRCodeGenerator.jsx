// fastorder-manager/src/components/QRCodeGenerator.jsx
import { useState, useRef, useEffect } from 'react'
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

  useEffect(() => {
    if (baseUrl && canvasRefs.current.length > 0) {
      generateAllQRCodes()
    }
  }, [baseUrl, nombreTables])

  const generateAllQRCodes = () => {
    for (let i = 0; i < nombreTables; i++) {
      generateQRCode(i + 1, canvasRefs.current[i])
    }
  }

  const generateQRCode = (tableNumber, canvas) => {
    if (!canvas) return

    const uuid = 'table_' + tableNumber + '_' + Date.now().toString(36)
    const url = `${baseUrl}?table=${tableNumber}&uuid=${uuid}`
    
    // Utiliser les couleurs du thème extrait du logo
    const qrColor = APP_CONFIG.theme.primary
    const bgColor = APP_CONFIG.theme.primaryBg || '#ffffff'
    
    // Importer et utiliser qrcode dynamiquement
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvas, url, {
        width: 300,
        margin: 2,
        color: {
          dark: qrColor,    // Couleur principale du logo (rouge/orange)
          light: bgColor     // Fond clair
        },
        errorCorrectionLevel: 'H'
      }, (error) => {
        if (error) {
          console.error('Erreur génération QR Code:', error)
        } else {
          // Ajouter le logo au centre du QR Code
          addLogoToQRCode(canvas, tableNumber)
        }
      })
    })
  }

  const addLogoToQRCode = (canvas, tableNumber) => {
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Taille du logo (20% de la taille du QR Code)
      const logoSize = canvas.width * 0.2
      const x = (canvas.width - logoSize) / 2
      const y = (canvas.height - logoSize) / 2
      
      // Fond blanc arrondi derrière le logo
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 1.8, 0, 2 * Math.PI)
      ctx.fill()
      
      // Bordure avec la couleur principale
      ctx.strokeStyle = APP_CONFIG.theme.primary
      ctx.lineWidth = 4
      ctx.stroke()
      
      // Dessiner le logo
      ctx.save()
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2.2, 0, 2 * Math.PI)
      ctx.clip()
      ctx.drawImage(img, x + 8, y + 8, logoSize - 16, logoSize - 16)
      ctx.restore()
      
      // Ajouter le numéro de table sous le logo
      ctx.fillStyle = APP_CONFIG.theme.primary
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Table ${tableNumber}`, canvas.width / 2, canvas.height - 20)
    }
    
    img.onerror = () => {
      console.error('Impossible de charger le logo')
    }
    
    img.src = APP_CONFIG.restaurant.logo
  }

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
          body {
            margin: 0;
            padding: 40px;
            font-family: Arial, sans-serif;
            text-align: center;
          }
          .container {
            max-width: 400px;
            margin: 0 auto;
            padding: 30px;
            border: 3px solid ${APP_CONFIG.theme.primary};
            border-radius: 20px;
            background: linear-gradient(135deg, ${APP_CONFIG.theme.primaryBg} 0%, #ffffff 100%);
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            border-radius: 50%;
            border: 3px solid ${APP_CONFIG.theme.primary};
          }
          h1 {
            color: ${APP_CONFIG.theme.primary};
            font-size: 32px;
            margin: 10px 0;
          }
          h2 {
            color: ${APP_CONFIG.theme.secondary || APP_CONFIG.theme.primary};
            font-size: 48px;
            margin: 10px 0;
          }
          .qr-code {
            margin: 20px 0;
          }
          p {
            color: #666;
            font-size: 16px;
            margin: 10px 0;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid ${APP_CONFIG.theme.primary};
            color: ${APP_CONFIG.theme.primary};
            font-weight: bold;
          }
          @media print {
            body { margin: 0; padding: 20px; }
            .container { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="${APP_CONFIG.restaurant.logo}" alt="Logo" class="logo" />
          <h1>${APP_CONFIG.restaurant.nom}</h1>
          <h2>Table ${tableNumber}</h2>
          <div class="qr-code">
            <img src="${imgData}" alt="QR Code" style="width: 300px; height: 300px;" />
          </div>
          <p>📱 Scannez ce code pour commander</p>
          <div class="footer">
            ${APP_CONFIG.restaurant.slogan || 'Commandez facilement'}
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
              borderColor: APP_CONFIG.theme.primary,
              focusRing: APP_CONFIG.theme.primary
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
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex justify-center items-center"
              style={{ backgroundColor: APP_CONFIG.theme.primaryBg }}
            >
              <canvas
                ref={(el) => (canvasRefs.current[tableNumber - 1] = el)}
                className="rounded-lg shadow-md"
              />
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