require('dotenv').config();

const requiredEnvVars = [
    'ESP32_API_KEY',
    'JWT_SECRET',
    'FRONTEND_URL'
];

// Verificar variables requeridas
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('❌ ERROR: Variables de entorno faltantes:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

module.exports = {
    port: process.env.PORT || 3000,
    wsPort: process.env.WS_PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    esp32ApiKey: process.env.ESP32_API_KEY,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    
    // ✅ rateLimit DEFINIDO
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100
    },
    
    logLevel: process.env.LOG_LEVEL || 'info'
};