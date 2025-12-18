// ============================================
// CONFIGURATION FASTORDER - MANAGER
// Modifiez uniquement ce fichier pour personnaliser votre restaurant
// ============================================

export const APP_CONFIG = {
  // 🏪 Informations du restaurant
  restaurant: {
    nom: "FastOrder Restaurant",           // ← CHANGEZ ICI
    slogan: "Tableau de bord de gestion",
    logo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop", // ← VOTRE LOGO
  },

  // 🎨 Couleurs du thème
  theme: {
    primary: "#f97316",
    secondary: "#ea580c",
    success: "#10b981",
    danger: "#ef4444",
  },

  // 🌐 URLs (à configurer après déploiement)
  urls: {
    client: "http://localhost:5173", // ← Remplacez par votre URL de production après déploiement
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