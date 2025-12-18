import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Edit2, Trash2, Power, PowerOff, X } from 'lucide-react'

function MenuManager() {
  const [plats, setPlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlat, setEditingPlat] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    categorie: 'Plats Principaux',
    description: '',
    image_url: '',
    disponible: true
  })

  const categories = ['Plats Principaux', 'Accompagnements', 'Boissons', 'Desserts']

  useEffect(() => {
    fetchPlats()
  }, [])

  const fetchPlats = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('plats')
        .select('*')
        .order('categorie')
        .order('nom')

      if (error) throw error
      setPlats(data || [])
    } catch (error) {
      console.error('Erreur chargement plats:', error)
      alert('Erreur lors du chargement du menu')
    } finally {
      setLoading(false)
    }
  }

  // ✨ NOUVEAU : Toggle disponibilité sans supprimer
  const toggleDisponibilite = async (plat) => {
    try {
      const { error } = await supabase
        .from('plats')
        .update({ disponible: !plat.disponible })
        .eq('id', plat.id)

      if (error) throw error
      
      await fetchPlats()
      alert(`${plat.nom} est maintenant ${!plat.disponible ? 'disponible' : 'indisponible'}`)
    } catch (error) {
      console.error('Erreur toggle disponibilité:', error)
      alert('Erreur lors de la modification')
    }
  }

  const openModal = (plat = null) => {
    if (plat) {
      setEditingPlat(plat)
      setFormData({
        nom: plat.nom,
        prix: plat.prix,
        categorie: plat.categorie,
        description: plat.description || '',
        image_url: plat.image_url || '',
        disponible: plat.disponible
      })
    } else {
      setEditingPlat(null)
      setFormData({
        nom: '',
        prix: '',
        categorie: 'Plats Principaux',
        description: '',
        image_url: '',
        disponible: true
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPlat(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nom || !formData.prix) {
      alert('Nom et prix sont obligatoires')
      return
    }

    try {
      const platData = {
        nom: formData.nom,
        prix: parseInt(formData.prix),
        categorie: formData.categorie,
        description: formData.description,
        image_url: formData.image_url,
        disponible: formData.disponible
      }

      if (editingPlat) {
        // Modification
        const { error } = await supabase
          .from('plats')
          .update(platData)
          .eq('id', editingPlat.id)

        if (error) throw error
        alert('Plat modifié avec succès !')
      } else {
        // Ajout
        const { error } = await supabase
          .from('plats')
          .insert([platData])

        if (error) throw error
        alert('Plat ajouté avec succès !')
      }

      await fetchPlats()
      closeModal()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const deletePlat = async (plat) => {
    if (!window.confirm(`Supprimer définitivement "${plat.nom}" ?`)) return

    try {
      const { error } = await supabase
        .from('plats')
        .delete()
        .eq('id', plat.id)

      if (error) throw error
      alert('Plat supprimé')
      await fetchPlats()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  // Grouper par catégorie
  const platsByCategory = plats.reduce((acc, plat) => {
    if (!acc[plat.categorie]) {
      acc[plat.categorie] = []
    }
    acc[plat.categorie].push(plat)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {/* Header avec bouton ajouter */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestion du Menu</h2>
          <p className="text-gray-600 mt-1">{plats.length} plat(s) au total</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus size={20} />
          Ajouter un Plat
        </button>
      </div>

      {/* Liste des plats par catégorie */}
      {Object.entries(platsByCategory).map(([categorie, platsCategorie]) => (
        <div key={categorie} className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full">
              {categorie}
            </span>
            <span className="text-gray-400 text-lg">({platsCategorie.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platsCategorie.map(plat => (
              <div
                key={plat.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  plat.disponible
                    ? 'border-green-200 bg-white'
                    : 'border-red-200 bg-gray-50 opacity-75'
                }`}
              >
                {/* Image */}
                {plat.image_url && (
                  <img
                    src={plat.image_url}
                    alt={plat.nom}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image'
                    }}
                  />
                )}

                {/* Infos */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-gray-800 text-lg">{plat.nom}</h4>
                    {/* Badge disponibilité */}
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        plat.disponible
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {plat.disponible ? '✓ Dispo' : '✗ Indispo'}
                    </span>
                  </div>

                  {plat.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {plat.description}
                    </p>
                  )}

                  <p className="text-xl font-bold text-orange-600">
                    {plat.prix.toLocaleString()} FCFA
                  </p>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2 mt-4">
                  {/* Toggle disponibilité */}
                  <button
                    onClick={() => toggleDisponibilite(plat)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all ${
                      plat.disponible
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                    title={plat.disponible ? 'Rendre indisponible' : 'Rendre disponible'}
                  >
                    {plat.disponible ? <PowerOff size={18} /> : <Power size={18} />}
                    <span className="text-sm">
                      {plat.disponible ? 'Désactiver' : 'Activer'}
                    </span>
                  </button>

                  {/* Modifier */}
                  <button
                    onClick={() => openModal(plat)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>

                  {/* Supprimer */}
                  <button
                    onClick={() => deletePlat(plat)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    title="Supprimer définitivement"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeModal}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header Modal */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold">
                  {editingPlat ? 'Modifier le Plat' : 'Ajouter un Plat'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-orange-600 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nom du plat *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: Poulet Braisé"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Prix (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={formData.prix}
                      onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                      placeholder="2500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={formData.categorie}
                      onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                    rows="3"
                    placeholder="Description du plat..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <input
                    type="checkbox"
                    id="disponible"
                    checked={formData.disponible}
                    onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                    className="w-5 h-5 text-orange-500"
                  />
                  <label htmlFor="disponible" className="text-gray-700 font-semibold">
                    Plat disponible immédiatement
                  </label>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg"
                  >
                    {editingPlat ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MenuManager