import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Edit2, Trash2, Power, PowerOff, X, Upload } from 'lucide-react'
import { APP_CONFIG } from '../config'

function MenuManager() {
  const [plats, setPlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlat, setEditingPlat] = useState(null)
  const [imageMode, setImageMode] = useState('url') // 'url' ou 'upload'
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    categorie: 'Plats Principaux',
    description: '',
    image_url: '',
    image_file: null,
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

  const uploadImage = async (file) => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`
      const filePath = `plats/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Erreur upload:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

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
        image_file: null,
        disponible: plat.disponible
      })
      setImageMode(plat.image_url ? 'url' : 'upload')
    } else {
      setEditingPlat(null)
      setFormData({
        nom: '',
        prix: '',
        categorie: 'Plats Principaux',
        description: '',
        image_url: '',
        image_file: null,
        disponible: true
      })
      setImageMode('url')
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
      let imageUrl = formData.image_url

      // Si un fichier a été sélectionné, l'uploader
      if (formData.image_file) {
        imageUrl = await uploadImage(formData.image_file)
      }

      const platData = {
        nom: formData.nom,
        prix: parseInt(formData.prix),
        categorie: formData.categorie,
        description: formData.description,
        image_url: imageUrl,
        disponible: formData.disponible
      }

      if (editingPlat) {
        const { error } = await supabase
          .from('plats')
          .update(platData)
          .eq('id', editingPlat.id)

        if (error) throw error
        alert('Plat modifié avec succès')
      } else {
        const { error } = await supabase
          .from('plats')
          .insert([platData])

        if (error) throw error
        alert('Plat ajouté avec succès')
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
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent"
          style={{ borderColor: `${APP_CONFIG.theme.primary}40`, borderTopColor: 'transparent' }}
        ></div>
      </div>
    )
  }

  const platsByCategory = plats.reduce((acc, plat) => {
    if (!acc[plat.categorie]) {
      acc[plat.categorie] = []
    }
    acc[plat.categorie].push(plat)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestion du Menu</h2>
          <p className="text-gray-600 mt-1">{plats.length} plat(s) au total</p>
        </div>
        <button
          onClick={() => openModal()}
          className="text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          style={{ background: `linear-gradient(to right, ${APP_CONFIG.theme.success}, ${APP_CONFIG.theme.successHover})` }}
        >
          <Plus size={20} />
          Ajouter un Plat
        </button>
      </div>

      {/* Liste des plats */}
      {Object.entries(platsByCategory).map(([categorie, platsCategorie]) => (
        <div key={categorie} className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <span className="px-4 py-1 rounded-full"
              style={{ 
                backgroundColor: `${APP_CONFIG.theme.primary}20`,
                color: APP_CONFIG.theme.primary
              }}
            >
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
                    ? 'bg-white'
                    : 'bg-gray-50 opacity-75'
                }`}
                style={{
                  borderColor: plat.disponible ? `${APP_CONFIG.theme.success}40` : `${APP_CONFIG.theme.danger}40`
                }}
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
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full`}
                      style={{
                        backgroundColor: plat.disponible ? `${APP_CONFIG.theme.success}20` : `${APP_CONFIG.theme.danger}20`,
                        color: plat.disponible ? APP_CONFIG.theme.success : APP_CONFIG.theme.danger
                      }}
                    >
                      {plat.disponible ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>

                  {plat.description && (
                    <p className="text-sm text-gray-600" style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {plat.description}
                    </p>
                  )}

                  <p className="text-xl font-bold"
                    style={{ color: APP_CONFIG.theme.primary }}
                  >
                    {plat.prix.toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => toggleDisponibilite(plat)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all`}
                    style={{
                      backgroundColor: plat.disponible ? `${APP_CONFIG.theme.danger}20` : `${APP_CONFIG.theme.success}20`,
                      color: plat.disponible ? APP_CONFIG.theme.danger : APP_CONFIG.theme.success
                    }}
                    title={plat.disponible ? 'Rendre indisponible' : 'Rendre disponible'}
                  >
                    {plat.disponible ? <PowerOff size={18} /> : <Power size={18} />}
                    <span className="text-sm">
                      {plat.disponible ? 'Désactiver' : 'Activer'}
                    </span>
                  </button>

                  <button
                    onClick={() => openModal(plat)}
                    className="p-2 rounded-lg transition"
                    style={{
                      backgroundColor: `${APP_CONFIG.theme.info}20`,
                      color: APP_CONFIG.theme.info
                    }}
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => deletePlat(plat)}
                    className="p-2 rounded-lg transition"
                    style={{
                      backgroundColor: `${APP_CONFIG.theme.danger}20`,
                      color: APP_CONFIG.theme.danger
                    }}
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeModal}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="text-white p-6 flex justify-between items-center"
                style={{ background: `linear-gradient(to right, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.primaryHover})` }}
              >
                <h3 className="text-2xl font-bold">
                  {editingPlat ? 'Modifier le Plat' : 'Ajouter un Plat'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Nom du plat *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none"
                    style={{ borderColor: APP_CONFIG.theme.primary }}
                    placeholder="Ex: Poulet Braisé"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Prix ({APP_CONFIG.options.deviseMonnaie}) *</label>
                    <input
                      type="number"
                      value={formData.prix}
                      onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none"
                      style={{ borderColor: APP_CONFIG.theme.primary }}
                      placeholder="2500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Catégorie *</label>
                    <select
                      value={formData.categorie}
                      onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none"
                      style={{ borderColor: APP_CONFIG.theme.primary }}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none"
                    style={{ borderColor: APP_CONFIG.theme.primary }}
                    rows="3"
                    placeholder="Description du plat..."
                  ></textarea>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Image du plat</label>
                  
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`flex-1 py-2 rounded-lg font-semibold transition`}
                      style={{
                        backgroundColor: imageMode === 'url' ? APP_CONFIG.theme.primary : '#f3f4f6',
                        color: imageMode === 'url' ? 'white' : '#6b7280'
                      }}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`flex-1 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2`}
                      style={{
                        backgroundColor: imageMode === 'upload' ? APP_CONFIG.theme.primary : '#f3f4f6',
                        color: imageMode === 'upload' ? 'white' : '#6b7280'
                      }}
                    >
                      <Upload size={18} />
                      Upload
                    </button>
                  </div>

                  {imageMode === 'url' ? (
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none"
                      style={{ borderColor: APP_CONFIG.theme.primary }}
                      placeholder="https://example.com/image.jpg"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, image_file: e.target.files[0] })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none"
                      style={{ borderColor: APP_CONFIG.theme.primary }}
                    />
                  )}
                  
                  {(formData.image_url || formData.image_file) && (
                    <div className="mt-3">
                      <img
                        src={formData.image_file ? URL.createObjectURL(formData.image_file) : formData.image_url}
                        alt="Aperçu"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <input
                    type="checkbox"
                    id="disponible"
                    checked={formData.disponible}
                    onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                    className="w-5 h-5"
                    style={{ accentColor: APP_CONFIG.theme.primary }}
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
                    disabled={uploading}
                    className="flex-1 px-6 py-3 text-white rounded-xl font-semibold transition shadow-lg"
                    style={{ background: `linear-gradient(to right, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.primaryHover})` }}
                  >
                    {uploading ? 'Upload en cours...' : (editingPlat ? 'Modifier' : 'Ajouter')}
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