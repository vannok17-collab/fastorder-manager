// ============================================
// CONFIGURATION FASTORDER - MANAGER
// Modifiez uniquement ce fichier pour personnaliser votre restaurant
// ============================================

export const APP_CONFIG = {
  // 🏪 Informations du restaurant
  restaurant: {
    nom: "Dabali Xpess",           // ← CHANGEZ ICI
    slogan: "A l'ivoirienne",
    logo: "https://dabalixpress-ci.com/assets/img/logo.jpg", // ← VOTRE LOGO
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
    client: "http://localhost:5174", // ← Remplacez par votre URL de production après déploiement
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