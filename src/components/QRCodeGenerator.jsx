// fastorder-manager/src/components/QRCodeGenerator.jsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, Printer, QrCode as QrCodeIcon } from 'lucide-react'
import { APP_CONFIG } from '../config'

function QRCodeGenerator() {
  const [nombreTables, setNombreTables] = useState(10)
  const [baseUrl, setBaseUrl] = useState('')
  const canvasRefs = useRef([])

  useEffect(() => {
    const url = "https://fastorder-client.netlify.app/"
    setBaseUrl(url)
  }, [])

  const generateQRCode = useCallback((tableNumber, canvas) => {
    if (!canvas || !baseUrl) return
    const uuid = 'table_' + tableNumber + '_' + Date.now().toString(36)
    const url = `${baseUrl}?table=${tableNumber}&uuid=${uuid}`
    
    const renderQR = (QRCodeLib) => {
      QRCodeLib.toCanvas(canvas, url, {
        width: 300, // Taille originale rétablie
        margin: 2,
        color: { dark: APP_CONFIG.theme.primary, light: '#ffffff' },
        errorCorrectionLevel: 'M'
      }, (error) => {
        if (error) console.error('Erreur QR:', error)
      })
    }

    if (window.QRCode) {
      renderQR(window.QRCode)
    } else {
      import('qrcode').then(renderQR).catch(err => console.error(err))
    }
  }, [baseUrl])

  useEffect(() => {
    if (baseUrl) {
      for (let i = 0; i < nombreTables; i++) {
        if (canvasRefs.current[i]) generateQRCode(i + 1, canvasRefs.current[i])
      }
    }
  }, [baseUrl, nombreTables, generateQRCode])

  const downloadQRCode = (tableNumber) => {
    const canvas = canvasRefs.current[tableNumber - 1]
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `QR-Table-${tableNumber}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const printQRCode = (tableNumber) => {
    const canvas = canvasRefs.current[tableNumber - 1]
    if (!canvas) return
    const printWindow = window.open('', '', 'width=800,height=900')
    const imgData = canvas.toDataURL()
    
    printWindow.document.write(`
      <html>
      <head>
        <title>Dabali Xpress - Table ${tableNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
          body { margin: 0; padding: 40px; font-family: 'Poppins', sans-serif; text-align: center; }
          .container { 
            max-width: 500px; 
            margin: 0 auto; 
            padding: 40px; 
            border: 6px solid ${APP_CONFIG.theme.primary}; 
            border-radius: 50px;
          }
          .logo { width: 150px; height: 150px; border-radius: 50%; border: 4px solid ${APP_CONFIG.theme.primary}; margin-bottom: 10px; }
          .slogan { font-size: 22px; color: #555; font-style: italic; font-weight: 500; margin-bottom: 5px; }
          h1 { color: ${APP_CONFIG.theme.primary}; font-size: 34px; margin: 0 0 30px 0; font-weight: 900; text-transform: uppercase; }
          .qr-wrapper { background: #fdfdfd; padding: 20px; border-radius: 20px; display: inline-block; border: 1px solid #eee; margin-bottom: 20px; }
          .qr-wrapper img { width: 320px; height: 320px; display: block; }
          .instruction { font-size: 20px; font-weight: 600; color: #333; margin-bottom: 30px; }
          .footer { background-color: ${APP_CONFIG.theme.primary}; color: white; padding: 15px; border-radius: 20px; font-size: 54px; font-weight: 900; }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="${APP_CONFIG.restaurant.logo}" class="logo" />
          <div class="slogan">A l'ivoirienne</div>
          <h1>${APP_CONFIG.restaurant.nom}</h1>
          <div class="qr-wrapper"><img src="${imgData}" /></div>
          <div class="instruction">📱 Scannez pour commander</div>
          <div class="footer">TABLE ${tableNumber}</div>
        </div>
        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const printAllQRCodes = () => {
    const printWindow = window.open('', '', 'width=800,height=900')
    let htmlContent = `<html><head><style>
      body { font-family: 'Poppins', sans-serif; padding: 10px; text-align:center; }
      .qr-card { 
        display: inline-block; width: 44%; margin: 2%; padding: 20px 10px; 
        border: 2px solid ${APP_CONFIG.theme.primary}; border-radius: 30px; 
        page-break-inside: avoid; vertical-align: top;
      }
      .logo-mini { width: 70px; height: 70px; border-radius: 50%; }
      .slogan-mini { font-size: 12px; font-style: italic; color: #666; }
      h3 { margin: 2px 0 10px 0; color: ${APP_CONFIG.theme.primary}; font-size: 16px; }
      img.qr { width: 180px; height: 180px; }
      .footer-mini { background: ${APP_CONFIG.theme.primary}; color: white; border-radius: 10px; font-size: 24px; font-weight: bold; margin-top: 10px; padding: 5px; }
    </style></head><body>`

    for (let i = 1; i <= nombreTables; i++) {
      const canvas = canvasRefs.current[i - 1]
      if (canvas) {
        htmlContent += `
          <div class="qr-card">
            <img src="${APP_CONFIG.restaurant.logo}" class="logo-mini" />
            <div class="slogan-mini">${APP_CONFIG.restaurant.slogan}</div>
            <h3>${APP_CONFIG.restaurant.nom}</h3>
            <img src="${canvas.toDataURL()}" class="qr" />
            <div class="footer-mini">TABLE ${i}</div>
          </div>`
      }
    }
    htmlContent += `<script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script></body></html>`
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-t-8 border-orange-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-3">
              <QrCodeIcon size={40} className="text-orange-500" />
              DABALI XPRESS
            </h2>
            <p className="text-orange-500 font-bold italic text-lg">A l'ivoirienne</p>
          </div>
          <div className="flex gap-4">
            <button onClick={printAllQRCodes} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg transition-all flex items-center gap-2">
              <Printer size={24} /> IMPRIMER LES TABLES
            </button>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
          <label className="text-sm font-black text-gray-400 uppercase">Nombre de tables :</label>
          <input type="number" value={nombreTables} onChange={(e) => setNombreTables(Math.max(1, parseInt(e.target.value) || 1))} className="bg-gray-100 border-none rounded-xl px-4 py-2 font-bold w-24 text-center" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: nombreTables }, (_, i) => i + 1).map((num) => (
          <div key={num} className="bg-white rounded-3xl shadow-md p-6 border border-gray-100 flex flex-col items-center">
            <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-black mb-4 uppercase tracking-widest">TABLE {num}</div>
            <div className="bg-gray-50 p-3 rounded-2xl mb-6 shadow-inner">
              <canvas ref={(el) => (canvasRefs.current[num - 1] = el)} className="w-full h-auto" />
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
              <button onClick={() => downloadQRCode(num)} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <Download size={18} /> TÉLÉCHARGER
              </button>
              <button onClick={() => printQRCode(num)} className="w-full py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                <Printer size={18} /> IMPRIMER
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QRCodeGenerator