// fastorder-manager/src/components/Auth.jsx
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { APP_CONFIG } from '../config'
import { LogIn, UserPlus, Mail, Lock, Store } from 'lucide-react'

function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    restaurantId: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // Connexion
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (authError) throw authError

        // Récupérer les infos du manager
        const { data: managerData, error: managerError } = await supabase
          .from('managers')
          .select('*')
          .eq('user_id', authData.user.id)
          .single()

        if (managerError) {
          alert('❌ Aucun restaurant associé à ce compte')
          await supabase.auth.signOut()
          return
        }

        alert('✅ Connexion réussie !')
        onAuth(managerData)

      } else {
        // Inscription
        if (!formData.nom || !formData.restaurantId) {
          alert('❌ Veuillez remplir tous les champs')
          return
        }

        // Créer l'utilisateur
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        })

        if (authError) throw authError

        if (!authData.user) {
          alert('❌ Erreur lors de la création du compte')
          return
        }

        // Créer l'entrée manager
        const { error: managerError } = await supabase
          .from('managers')
          .insert({
            user_id: authData.user.id,
            restaurant_id: formData.restaurantId,
            nom: formData.nom,
            email: formData.email
          })

        if (managerError) throw managerError

        alert('✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
        setIsLogin(true)
        setFormData({ ...formData, nom: '', restaurantId: '' })
      }
    } catch (error) {
      console.error('Erreur auth:', error)
      alert(`❌ Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center"
          style={{ 
            background: `linear-gradient(135deg, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.primaryHover})`
          }}
        >
          {APP_CONFIG.restaurant.logo && (
            <img 
              src={APP_CONFIG.restaurant.logo} 
              alt="Logo"
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
            />
          )}
          <h1 className="text-3xl font-bold text-white mb-2">
            {APP_CONFIG.restaurant.nom}
          </h1>
          <p className="text-white/90">
            {isLogin ? '🔐 Connexion Manager' : '📝 Créer un compte'}
          </p>
        </div>

        {/* Formulaire */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className=" text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Store size={18} />
                    Nom du restaurant
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Dabali Xpress"
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2"
                    style={{ borderColor: APP_CONFIG.theme.primary }}
                    required={!isLogin}
                  />
                </div>

                <div>
                  <label className=" text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Store size={18} />
                    ID du restaurant (sans espaces)
                  </label>
                  <input
                    type="text"
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                    placeholder="Ex: dabali-xpress"
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 font-mono"
                    style={{ borderColor: APP_CONFIG.theme.primary }}
                    required={!isLogin}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cet ID sera utilisé pour identifier votre restaurant
                  </p>
                </div>
              </>
            )}

            <div>
              <label className=" text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2"
                style={{ borderColor: APP_CONFIG.theme.primary }}
                required
              />
            </div>

            <div>
              <label className=" text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Lock size={18} />
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2"
                style={{ borderColor: APP_CONFIG.theme.primary }}
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 caractères
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl text-white disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: APP_CONFIG.theme.primary }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Chargement...
                </>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? 'Se connecter' : "S'inscrire"}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-gray-800 font-semibold"
            >
              {isLogin ? (
                <>Pas de compte ? <span style={{ color: APP_CONFIG.theme.primary }}>Créer un compte</span></>
              ) : (
                <>Déjà un compte ? <span style={{ color: APP_CONFIG.theme.primary }}>Se connecter</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth