// fastorder-manager/src/hooks/useTheme.jsx
import { useState, useEffect } from 'react'
import { APP_CONFIG, initializeThemeFromLogo } from '../config'

/**
 * Hook personnalisé pour gérer le thème avec extraction automatique des couleurs du logo
 * @returns {Object} { theme, loading, error, ready }
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(APP_CONFIG.theme)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        setLoading(true)
        console.log('🎨 Initialisation du thème depuis le logo...')
        
        const extractedTheme = await initializeThemeFromLogo()
        
        console.log('✅ Thème chargé avec succès:', extractedTheme)
        setTheme(extractedTheme)
        setReady(true)
        
      } catch (err) {
        console.error('❌ Erreur lors du chargement du thème:', err)
        setError(err.message || 'Erreur inconnue')
        setTheme(APP_CONFIG.theme)
        setReady(true)
      } finally {
        setLoading(false)
      }
    }

    loadTheme()
  }, [])

  return { 
    theme,
    loading,
    error,
    ready
  }
}