import { extractColorsFromLogo } from './utils/colorExtractor'

export const APP_CONFIG = {
  restaurant: {
    nom: "Dabali Xpress",
    slogan: "A l'ivoirienne",
    logo: "https://dabalixpress-ci.com/assets/img/logo.jpg",
  },

  // Couleurs par défaut (seront remplacées automatiquement)
  theme: {
    primary: "#f97316",
    primaryHover: "#ea580c",
    primaryLight: "#fb923c",
    primaryBg: "#fff7ed",
    secondary: "#dc2626",
    accent: "#fbbf24",
    success: "#10b981",
    successHover: "#059669",
    successLight: "#d1fae5",
    danger: "#ef4444",
    dangerHover: "#dc2626",
    dangerLight: "#fee2e2",
    warning: "#f59e0b",
    warningLight: "#fef3c7",
    info: "#3b82f6",
    infoLight: "#dbeafe",
    text: {
      primary: "#111827",
      secondary: "#6b7280",
      light: "#9ca3af",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      dark: "#1f2937",
    }
  },

  urls: {
    client: "http://localhost:5173",
  },

  qrCode: {
    texteAppel: "Scannez ici pour commander",
    couleurPrincipale: "#f97316", // Sera remplacée
  },

  options: {
    deviseMonnaie: "FCFA",
    nombreTables: 20,
  }
}

// Fonction pour initialiser les couleurs depuis le logo
export const initializeThemeFromLogo = async () => {
  try {
    const extractedColors = await extractColorsFromLogo(APP_CONFIG.restaurant.logo)
    
    // Mettre à jour les couleurs
    APP_CONFIG.theme = extractedColors
    APP_CONFIG.qrCode.couleurPrincipale = extractedColors.primary
    
    console.log('🎨 Couleurs extraites du logo:', extractedColors)
    return extractedColors
  } catch (error) {
    console.error('Erreur extraction couleurs:', error)
    return APP_CONFIG.theme
  }
}