const wsServer = require('../websocket');
const config = require('../config');

class SensorController {
    // Recibir datos del ESP32
    receiveData(req, res) {
        try {
            const { temperature, humidity, gasValue, apiKey } = req.body;
            
            // Verificar API Key
            if (apiKey !== config.apiKey) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid API Key'
                });
            }

            // Validar datos
            if (!temperature || !humidity || gasValue === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: temperature, humidity, gasValue'
                });
            }

            // Actualizar datos en WebSocket
            const updated = wsServer.updateData({ temperature, humidity, gasValue });
            
            if (updated) {
                res.json({
                    success: true,
                    message: 'Data received and broadcasted',
                    data: wsServer.getData(),
                    clients: wsServer.getClientCount()
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Invalid sensor data'
                });
            }
        } catch (error) {
            console.error('❌ Error in receiveData:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obtener datos actuales (para el frontend)
    getCurrentData(req, res) {
        const data = wsServer.getData();
        res.json({
            success: true,
            data: data,
            clients: wsServer.getClientCount(),
            timestamp: Date.now()
        });
    }

    // Obtener estado del servidor
    getStatus(req, res) {
        res.json({
            success: true,
            status: 'online',
            clients: wsServer.getClientCount(),
            lastUpdate: wsServer.getData().timestamp,
            uptime: process.uptime()
        });
    }
}

module.exports = new SensorController();