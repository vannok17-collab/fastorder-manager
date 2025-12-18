import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Clock, Package, CheckCircle, RefreshCw, Printer } from 'lucide-react'

function OrdersDisplay() {
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const audioRef = useRef(null)
  const lastCommandeIdRef = useRef(null)

  useEffect(() => {
    fetchCommandes()

    // Rafraîchissement automatique toutes les 15 secondes
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchCommandes(true) // true = mode silencieux pour le refresh auto
      }, 15000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchCommandes = async (silent = false) => {
    try {
      if (!silent) setLoading(true)

      const { data, error } = await supabase
        .from('commandes')
        .select(`
          *,
          commandes_items (
            *,
            plats (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Détecter nouvelle commande pour la notification sonore
      if (data && data.length > 0) {
        const latestCommandeId = data[0].id
        
        // Si c'est une nouvelle commande (différente de la dernière connue)
        if (lastCommandeIdRef.current && latestCommandeId !== lastCommandeIdRef.current) {
          playNotificationSound()
        }
        
        lastCommandeIdRef.current = latestCommandeId
      }

      setCommandes(data || [])
    } catch (error) {
      console.error('Erreur chargement commandes:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const playNotificationSound = () => {
    // Son de notification (bip)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800 // Fréquence du son
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    // Répéter 3 fois
    setTimeout(() => {
      const osc2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()
      osc2.connect(gain2)
      gain2.connect(audioContext.destination)
      osc2.frequency.value = 1000
      osc2.type = 'sine'
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      osc2.start(audioContext.currentTime)
      osc2.stop(audioContext.currentTime + 0.5)
    }, 200)
  }

  const updateStatut = async (commandeId, newStatut) => {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({ statut: newStatut })
        .eq('id', commandeId)

      if (error) throw error
      await fetchCommandes()
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const printFacture = (commande) => {
    const printWindow = window.open('', '', 'width=300,height=600')
    
    const items = commande.commandes_items
      .map(item => `
        <tr>
          <td>${item.plats.nom}</td>
          <td style="text-align: center;">${item.quantite}</td>
          <td style="text-align: right;">${item.prix_unitaire.toLocaleString()}</td>
          <td style="text-align: right;">${(item.prix_unitaire * item.quantite).toLocaleString()}</td>
        </tr>
      `)
      .join('')

    const totalArticles = commande.commandes_items.reduce((sum, item) => sum + item.quantite, 0)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture - Commande #${commande.id.slice(0, 8)}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            width: 280px;
            margin: 0 auto;
            padding: 10px;
          }
          h1 { text-align: center; font-size: 20px; margin: 10px 0; }
          h2 { text-align: center; font-size: 16px; margin: 5px 0; }
          .info { margin: 10px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 5px; font-size: 11px; }
          th { border-bottom: 1px dashed #000; text-align: left; }
          .total { border-top: 2px solid #000; font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          @media print {
            body { width: 100%; }
          }
        </style>
      </head>
      <body>
        <h1>FastOrder</h1>
        <h2>FACTURE</h2>
        
        <div class="info">
          <strong>Commande:</strong> #${commande.id.slice(0, 8)}<br>
          <strong>Table:</strong> ${commande.numero_table}<br>
          <strong>Date:</strong> ${new Date(commande.created_at).toLocaleString('fr-FR')}<br>
          <strong>Statut:</strong> ${commande.statut}
        </div>

        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th style="text-align: center;">Qté</th>
              <th style="text-align: right;">P.U.</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="2">TOTAL (${totalArticles} article${totalArticles > 1 ? 's' : ''})</td>
              <td colspan="2" style="text-align: right;">${commande.montant_total.toLocaleString()} FCFA</td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          Merci de votre visite !<br>
          À bientôt chez FastOrder
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

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'En préparation':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Terminée':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'En attente':
        return <Clock size={20} />
      case 'En préparation':
        return <Package size={20} />
      case 'Terminée':
        return <CheckCircle size={20} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Commandes</h2>
          <p className="text-gray-600 mt-1">
            {commandes.filter(c => c.statut !== 'Terminée').length} commande(s) en cours
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* Toggle auto-refresh */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              autoRefresh
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
            }`}
          >
            {autoRefresh ? '🔔 Auto-refresh ON' : '🔕 Auto-refresh OFF'}
          </button>

          {/* Rafraîchir manuellement */}
          <button
            onClick={() => fetchCommandes()}
            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold hover:bg-orange-200 transition flex items-center gap-2 border-2 border-orange-300"
          >
            <RefreshCw size={18} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Liste des commandes */}
      {commandes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">Aucune commande pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {commandes.map(commande => {
            const totalArticles = commande.commandes_items.reduce((sum, item) => sum + item.quantite, 0)

            return (
              <div
                key={commande.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Header commande */}
                <div className={`p-4 border-l-4 ${
                  commande.statut === 'En attente' ? 'border-yellow-500 bg-yellow-50' :
                  commande.statut === 'En préparation' ? 'border-blue-500 bg-blue-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        Table {commande.numero_table}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {new Date(commande.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 flex items-center gap-1 ${getStatutColor(commande.statut)}`}>
                      {getStatutIcon(commande.statut)}
                      {commande.statut}
                    </span>
                  </div>
                </div>

                {/* Détails articles */}
                <div className="p-4 space-y-2">
                  {commande.commandes_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        <strong className="text-orange-600">{item.quantite}x</strong> {item.plats.nom}
                      </span>
                      <span className="text-gray-600 font-semibold">
                        {(item.prix_unitaire * item.quantite).toLocaleString()} F
                      </span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="pt-3 mt-3 border-t-2 border-gray-200 flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">
                      Total ({totalArticles} article{totalArticles > 1 ? 's' : ''})
                    </span>
                    <span className="text-xl font-bold text-orange-600">
                      {commande.montant_total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 space-y-2">
                  {/* Changer statut */}
                  <div className="flex gap-2">
                    {commande.statut === 'En attente' && (
                      <button
                        onClick={() => updateStatut(commande.id, 'En préparation')}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                      >
                        <Package size={18} />
                        Préparer
                      </button>
                    )}
                    
                    {commande.statut === 'En préparation' && (
                      <button
                        onClick={() => updateStatut(commande.id, 'Terminée')}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Terminer
                      </button>
                    )}

                    {commande.statut === 'Terminée' && (
                      <div className="flex-1 text-center text-green-600 font-semibold py-2">
                        ✓ Commande terminée
                      </div>
                    )}
                  </div>

                  {/* Imprimer facture */}
                  <button
                    onClick={() => printFacture(commande)}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    Imprimer la facture
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrdersDisplay