require('dotenv').config();

module.exports = {
    // Servidor
    port: process.env.PORT || 3000,
    wsPort: process.env.WS_PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // 🔑 CLAVE PARA ESP32 (TÚ LA CREAS)
    esp32ApiKey: process.env.ESP32_API_KEY,  // "MiClaveSuperSecretaParaESP32_2024"
    
    // 🔐 CLAVE PARA JWT (Render API Key o tú la creas)
    jwtSecret: process.env.JWT_SECRET,       // "rnd_abc123..." o "MiClaveJWTParaFrontend_2024"
    
    // 🌐 URLs (Render te las da)
    frontendUrl: process.env.FRONTEND_URL,   // "https://mi-frontend.onrender.com"
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || []
};