const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const config = require('../config');

// Middleware para verificar API Key (solo para POST)
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.body.apiKey;
    
    if (!apiKey || apiKey !== config.esp32ApiKey) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or missing API Key'
        });
    }
    next();
};

// Rutas públicas (GET)
router.get('/data', sensorController.getCurrentData);
router.get('/status', sensorController.getStatus);

// Rutas protegidas (POST)
router.post('/sensor', verifyApiKey, sensorController.receiveData);

module.exports = router;