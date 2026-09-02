const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');

const config = require('./config');
const wsServer = require('./websocket');
const apiRoutes = require('./routes/api');

// Inicializar Express
const app = express();
const server = http.createServer(app);

// ============= MIDDLEWARES =============

app.set('trust proxy', 1); 

// Seguridad
app.use(helmet({
    contentSecurityPolicy: false // Para desarrollo
}));

// CORS - Configuración específica para producción
app.use(cors({
    origin: config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ============= RUTAS =============
app.use('/api', apiRoutes);

// Ruta de salud
app.get('/', (req, res) => {
    res.json({
        name: 'IoT Monitoring API',
        version: '2.0.0',
        status: 'online',
        endpoints: {
            data: '/api/data (GET)',
            sensor: '/api/sensor (POST)',
            status: '/api/status (GET)',
            health: '/health (GET)',
            login: '/api/auth/login (POST)'
        },
        docs: 'https://websocket-control-ambiental.onrender.com'
    });
});

// ============= WEBSOCKET =============
wsServer.initialize(server);

// ============= INICIAR SERVIDOR =============
const PORT = config.port;
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║           IoT Monitoring System                    ║
╠═══════════════════════════════════════════════════╣
║  🚀 HTTP Server:  http://localhost:${PORT}         ║
║  🔌 WebSocket:    ws://localhost:${config.wsPort}/ws ║
║  📡 Environment:  ${config.nodeEnv}                ║
╚═══════════════════════════════════════════════════╝
    `);
});

// ============= MANEJO DE ERRORES =============
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // En producción, podrías reiniciar el proceso aquí
    if (config.nodeEnv === 'production') {
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, closing server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});