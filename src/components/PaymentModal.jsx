// fastorder-manager/src/components/PaymentModal.jsx
import { Printer, X } from 'lucide-react'
import { APP_CONFIG } from '../config'

function PaymentModal({ commande, onClose, onPaymentComplete }) {
  
  const clientContact = commande.contact || ''

  const generateInvoiceHTML = () => {
    const items = commande.commandes_items
      .map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.plats.nom}</td>
          <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantite}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${item.prix_unitaire.toLocaleString()}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${(item.prix_unitaire * item.quantite).toLocaleString()}</td>
        </tr>
      `)
      .join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture ${commande.id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #f9fafb; }
          .invoice { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid ${APP_CONFIG.theme.primary}; }
          .logo { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; }
          h1 { color: ${APP_CONFIG.theme.primary}; margin: 10px 0; font-size: 32px; }
          .info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
          .info-box { background: ${APP_CONFIG.theme.primaryBg}; padding: 15px; border-radius: 10px; }
          .label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
          .value { font-size: 16px; font-weight: bold; color: ${APP_CONFIG.theme.primary}; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th { background: ${APP_CONFIG.theme.primary}; color: white; padding: 12px; text-align: left; }
          .total { background: ${APP_CONFIG.theme.primaryBg}; font-size: 20px; font-weight: bold; padding: 15px !important; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid ${APP_CONFIG.theme.primary}; color: ${APP_CONFIG.theme.primary}; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <img src="${APP_CONFIG.restaurant.logo}" class="logo" />
            <h1>${APP_CONFIG.restaurant.nom}</h1>
            <p style="color: #6b7280; margin: 0;">${APP_CONFIG.restaurant.slogan}</p>
            <h2 style="color: ${APP_CONFIG.theme.primary}; margin: 15px 0 0;">FACTURE N° ${commande.id.slice(0, 8).toUpperCase()}</h2>
          </div>
          
          <div class="info">
            <div class="info-box"><div class="label">Date</div><div class="value">${new Date(commande.created_at).toLocaleDateString('fr-FR')}</div></div>
            <div class="info-box"><div class="label">Heure</div><div class="value">${new Date(commande.created_at).toLocaleTimeString('fr-FR')}</div></div>
            <div class="info-box"><div class="label">Table</div><div class="value">Table ${commande.numero_table}</div></div>
            <div class="info-box"><div class="label">Statut</div><div class="value">${commande.statut}</div></div>
          </div>
          
          <table>
            <thead><tr><th>Article</th><th style="text-align: center;">Qté</th><th style="text-align: right;">P.U.</th><th style="text-align: right;">Total</th></tr></thead>
            <tbody>${items}</tbody>
            <tfoot>
              <tr class="total">
                <td colspan="3" style="text-align: right; color: ${APP_CONFIG.theme.primary};">TOTAL À PAYER</td>
                <td style="text-align: right; color: ${APP_CONFIG.theme.primary};">${commande.montant_total.toLocaleString()} ${APP_CONFIG.options.deviseMonnaie}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <p>✨ Merci de votre visite ! ✨</p>
            <p style="font-size: 14px; margin-top: 10px;">À bientôt chez ${APP_CONFIG.restaurant.nom}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const sendInvoiceByEmail = async () => {
    if (!clientContact) {
      alert('❌ Aucun contact client trouvé dans la commande')
      return
    }

    if (!isEmail) {
      alert('❌ Le client a fourni un numéro de téléphone, pas un email. Envoi par SMS non disponible pour le moment.')
      return
    }

    setLoading(true)

    try {
      const invoiceHTML = generateInvoiceHTML()
      
      console.log('📧 Envoi de la facture à:', clientContact)
      console.log('HTML:', invoiceHTML)
      
      // TODO: Appeler votre API backend pour envoyer l'email
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStep('success')
      setTimeout(() => {
        onClose()
        onPaymentComplete?.()
      }, 2000)
    } catch (error) {
      console.error('Erreur envoi email:', error)
      alert('❌ Erreur lors de l\'envoi de l\'email')
    } finally {
      setLoading(false)
    }
  }

  const initiatePayment = async () => {
    if (!selectedPayment) {
      alert('❌ Sélectionnez un mode de paiement')
      return
    }

    if (!phoneNumber || phoneNumber.length < 8) {
      alert('❌ Numéro de téléphone invalide')
      return
    }

    setLoading(true)

    try {
      // TODO: Intégrer les APIs de paiement
      // Wave API: https://developers.wave.com
      // Orange Money API
      // MTN MoMo API
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('💳 Paiement initié:', {
        method: selectedPayment.name,
        phone: phoneNumber,
        amount: commande.montant_total
      })
      
      // Appeler votre API backend pour le paiement
      /*
      const response = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedPayment.id,
          phone: phoneNumber,
          amount: commande.montant_total,
          orderId: commande.id
        })
      })
      */
      
      setStep('success')
      setTimeout(() => {
        onClose()
        onPaymentComplete?.()
      }, 2000)
    } catch (error) {
      console.error('Erreur paiement:', error)
      alert('❌ Erreur lors du paiement')
    } finally {
      setLoading(false)
    }
  }

  const printInvoice = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(generateInvoiceHTML())
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
      setTimeout(() => printWindow.close(), 500)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center"
          style={{ background: `linear-gradient(135deg, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.primaryHover})` }}
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              💳 Facture & Paiement
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Table {commande.numero_table} • {commande.montant_total.toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Infos commande + Bouton imprimer */}
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 font-semibold mb-3">ℹ️ Informations commande</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Contact :</span>
                  <span className="font-bold">{clientContact || 'Non fourni'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Mode de paiement :</span>
                  <span className="font-bold">{
                    commande.mode_paiement === 'especes' ? '💵 Espèces' :
                    commande.mode_paiement === 'wave' ? '📱 Wave' :
                    commande.mode_paiement === 'orange_money' ? '🟠 Orange Money' :
                    commande.mode_paiement === 'mtn_momo' ? '💛 MTN MoMo' :
                    commande.mode_paiement === 'moov_money' ? '🔵 Moov Money' :
                    commande.mode_paiement === 'carte' ? '💳 Carte' : 
                    commande.mode_paiement || 'Non spécifié'
                  }</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4">
              <p className="text-green-800 font-semibold mb-2">✅ Le client peut voir sa facture</p>
              <p className="text-sm text-green-700">
                La facture est disponible dans l'onglet "Factures" de l'application client
              </p>
            </div>

            <button
              onClick={printInvoice}
              className="w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 hover:shadow-lg bg-blue-50 hover:bg-blue-100"
              style={{ borderColor: APP_CONFIG.theme.primary }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white"
                style={{ color: APP_CONFIG.theme.primary }}
              >
                <Printer size={32} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-gray-800">Imprimer la facture</h3>
                <p className="text-gray-600 text-sm">Pour vos archives</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal