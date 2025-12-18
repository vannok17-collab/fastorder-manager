// ============================================
// CONFIGURATION FASTORDER - MANAGER
// Modifiez uniquement ce fichier pour personnaliser votre restaurant
// ============================================

export const APP_CONFIG = {
  // 🏪 Informations du restaurant
  restaurant: {
    nom: "Dabali Xpess",
    slogan: "A l'ivoirienne",
    logo: "https://dabalixpress-ci.com/assets/img/logo.jpg",
  },

  // 🎨 Couleurs du thème
  theme: {
    primary: "#f97316",           // Orange principal
    primaryHover: "#ea580c",      // Orange au survol
    primaryLight: "#fb923c",      // Orange clair
    primaryBg: "#fff7ed",         // Fond orange très clair
    
    success: "#10b981",           // Vert
    successHover: "#059669",      // Vert foncé
    successLight: "#d1fae5",      // Vert clair
    
    danger: "#ef4444",            // Rouge
    dangerHover: "#dc2626",       // Rouge foncé
    dangerLight: "#fee2e2",       // Rouge clair
    
    warning: "#f59e0b",           // Orange/Jaune
    warningLight: "#fef3c7",      // Jaune clair
    
    info: "#3b82f6",              // Bleu
    infoLight: "#dbeafe",         // Bleu clair
    
    text: {
      primary: "#111827",         // Texte principal
      secondary: "#6b7280",       // Texte secondaire
      light: "#9ca3af",           // Texte clair
    },
    
    background: {
      primary: "#ffffff",         // Fond blanc
      secondary: "#f9fafb",       // Fond gris clair
      dark: "#1f2937",            // Fond sombre
    }
  },

  // 🌐 URLs (à configurer après déploiement)
  urls: {
    client: "http://localhost:5173", // ← URL du CLIENT (pas 5174 !)
  },

  // 📱 Configuration QR Code
  qrCode: {
    texteAppel: "Scannez ici pour commander",
    couleurPrincipale: "#f97316",
  },

  // ⚙️ Options
  options: {
    deviseMonnaie: "FCFA",
    nombreTables: 20,
  }
}