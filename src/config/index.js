// src/config/index.js
require('dotenv').config();

module.exports = {
    // Servidor
    port: process.env.PORT || 3000,
    wsPort: process.env.WS_PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // 🔑 Claves
    esp32ApiKey: process.env.ESP32_API_KEY,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    
    // ✅ Rate Limiting (definido aquí)
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100
    },
    
    // Opciones adicionales
    logLevel: process.env.LOG_LEVEL || 'info'
};