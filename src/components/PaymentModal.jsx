// fastorder-manager/src/components/PaymentModal.jsx
import { useState } from 'react'
import { Mail, Smartphone, X, Send, Printer, CheckCircle } from 'lucide-react'
import { APP_CONFIG } from '../config'

function PaymentModal({ commande, onClose, onPaymentComplete }) {
  const [step, setStep] = useState('choice') // 'choice', 'email', 'payment', 'success'
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [loading, setLoading] = useState(false)

  const paymentMethods = [
    { id: 'wave', name: 'Wave', icon: '📱', color: '#00D9B1', code: '*144#' },
    { id: 'orange', name: 'Orange Money', icon: '🟠', color: '#FF6600', code: '#144#' },
    { id: 'mtn', name: 'MTN MoMo', icon: '💛', color: '#FFCC00', code: '*133#' },
    { id: 'moov', name: 'Moov Money', icon: '🔵', color: '#0066CC', code: '*155#' }
  ]

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
    if (!email || !email.includes('@')) {
      alert('❌ Veuillez entrer une adresse email valide')
      return
    }

    setLoading(true)

    try {
      // TODO: Intégrer un service d'email (Resend, SendGrid, Brevo...)
      // Exemple avec Resend : https://resend.com/docs/send-with-nodejs
      
      // Pour l'instant, on simule l'envoi
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const invoiceHTML = generateInvoiceHTML()
      
      console.log('📧 Envoi de la facture à:', email)
      console.log('HTML:', invoiceHTML)
      
      // Appeler votre API backend pour envoyer l'email
      /*
      await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          html: invoiceHTML,
          subject: `Facture ${commande.id.slice(0, 8)} - ${APP_CONFIG.restaurant.nom}`
        })
      })
      */
      
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
              {step === 'choice' && '💳 Paiement'}
              {step === 'email' && '📧 Envoi par Email'}
              {step === 'payment' && '📱 Paiement Mobile'}
              {step === 'success' && '✅ Succès'}
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
          {/* Étape 1 : Choix */}
          {step === 'choice' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">Choisissez comment finaliser la commande :</p>
              
              <button
                onClick={printInvoice}
                className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-400 transition-all flex items-center gap-4 bg-gray-50 hover:bg-gray-100"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Printer size={32} className="text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-gray-800">Imprimer la facture</h3>
                  <p className="text-gray-600 text-sm">Imprimer et donner au client</p>
                </div>
              </button>

              <button
                onClick={() => setStep('email')}
                className="w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 hover:shadow-lg"
                style={{ 
                  borderColor: APP_CONFIG.theme.primary,
                  backgroundColor: `${APP_CONFIG.theme.primary}10`
                }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${APP_CONFIG.theme.primary}20` }}
                >
                  <Mail size={32} style={{ color: APP_CONFIG.theme.primary }} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-gray-800">Envoyer par email</h3>
                  <p className="text-gray-600 text-sm">Le client recevra la facture par email</p>
                </div>
              </button>

              <button
                onClick={() => setStep('payment')}
                className="w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 hover:shadow-lg"
                style={{ 
                  borderColor: APP_CONFIG.theme.success,
                  backgroundColor: `${APP_CONFIG.theme.success}10`
                }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${APP_CONFIG.theme.success}20` }}
                >
                  <Smartphone size={32} style={{ color: APP_CONFIG.theme.success }} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-gray-800">Paiement mobile</h3>
                  <p className="text-gray-600 text-sm">Wave, Orange Money, MTN, Moov</p>
                </div>
              </button>
            </div>
          )}

          {/* Étape 2 : Email */}
          {step === 'email' && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email du client
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2"
                  style={{ borderColor: APP_CONFIG.theme.primary }}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choice')}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  disabled={loading}
                >
                  Retour
                </button>
                <button
                  onClick={sendInvoiceByEmail}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-white"
                  style={{ backgroundColor: APP_CONFIG.theme.primary }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Envoyer la facture
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 : Paiement */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-3">
                  Mode de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPayment?.id === method.id ? 'ring-4' : ''
                      }`}
                      style={{
                        borderColor: selectedPayment?.id === method.id ? method.color : '#e5e7eb',
                        backgroundColor: selectedPayment?.id === method.id ? `${method.color}10` : 'white',
                        ringColor: `${method.color}40`
                      }}
                    >
                      <div className="text-3xl mb-2">{method.icon}</div>
                      <div className="font-bold text-sm">{method.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{method.code}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPayment && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07 XX XX XX XX"
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2"
                    style={{ borderColor: selectedPayment.color }}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Le client recevra une demande de paiement sur son téléphone
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choice')}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  disabled={loading}
                >
                  Retour
                </button>
                <button
                  onClick={initiatePayment}
                  disabled={loading || !selectedPayment}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-white"
                  style={{ backgroundColor: APP_CONFIG.theme.success }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Initier le paiement
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Étape 4 : Succès */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce"
                style={{ backgroundColor: `${APP_CONFIG.theme.success}20` }}
              >
                <CheckCircle size={48} style={{ color: APP_CONFIG.theme.success }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ✅ Opération réussie !
              </h3>
              <p className="text-gray-600">
                La facture a été traitée avec succès
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal