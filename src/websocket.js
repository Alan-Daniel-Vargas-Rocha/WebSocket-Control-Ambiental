const WebSocket = require('ws');
const config = require('./config');

class WebSocketServer {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // Almacenar clientes con ID
        this.sensorData = {
            temperature: 0,
            humidity: 0,
            gasValue: 0,
            timestamp: Date.now()
        };
        this.clientIdCounter = 0;
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/ws', // Ruta específica para WebSocket
            maxPayload: 1024 * 1024 // 1MB
        });

        this.wss.on('connection', this.handleConnection.bind(this));
        
        console.log(`🔌 WebSocket server initialized on path /ws`);
        
        // Heartbeat cada 30 segundos
        setInterval(() => this.sendHeartbeat(), 30000);
        
        // Limpiar conexiones muertas
        setInterval(() => this.cleanDeadConnections(), 60000);
    }

    handleConnection(ws, req) {
        const clientId = ++this.clientIdCounter;
        const ip = req.socket.remoteAddress;
        
        console.log(`🟢 Client ${clientId} connected from ${ip}`);
        this.clients.set(clientId, { ws, ip, lastPing: Date.now() });

        // Enviar ID y estado inicial
        this.sendToClient(clientId, {
            type: 'connection',
            clientId: clientId,
            status: 'connected',
            timestamp: Date.now()
        });

        // Enviar datos actuales
        this.sendToClient(clientId, {
            type: 'dataUpdate',
            data: this.sensorData
        });

        // Configurar eventos del cliente
        ws.on('message', (message) => {
            this.handleMessage(clientId, message);
        });

        ws.on('close', () => {
            console.log(`🔴 Client ${clientId} disconnected`);
            this.clients.delete(clientId);
            this.broadcastClientCount();
        });

        ws.on('error', (error) => {
            console.error(`❌ Client ${clientId} error:`, error);
            this.clients.delete(clientId);
        });

        // Notificar cantidad de clientes
        this.broadcastClientCount();
    }

handleMessage(clientId, message) {
    try {
        const data = JSON.parse(message);
        console.log(`📩 Client ${clientId}:`, data);

        switch(data.type) {
            case 'ping':
                this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
                break;
                
            case 'pong':  // ✅ AGREGADO
                // Responder al pong (mantener conexión activa)
                const client = this.clients.get(clientId);
                if (client) {
                    client.lastPong = Date.now();
                }
                break;
                
            case 'sensorData':
                if (this.validateSensorData(data)) {
                    this.sensorData = {
                        temperature: parseFloat(data.temperature),
                        humidity: parseFloat(data.humidity),
                        gasValue: parseInt(data.gasValue),
                        timestamp: Date.now()
                    };
                    this.broadcastData();
                    console.log(`📊 Datos recibidos del cliente ${clientId}`);
                }
                break;

            case 'getData':
                this.sendToClient(clientId, {
                    type: 'dataUpdate',
                    data: this.sensorData
                });
                break;

            default:
                console.warn(`⚠️ Unknown message type from client ${clientId}:`, data.type);
        }
    } catch (error) {
        console.error(`❌ Error processing message:`, error);
    }
}

    validateSensorData(data) {
        const temp = parseFloat(data.temperature);
        const hum = parseFloat(data.humidity);
        const gas = parseInt(data.gasValue);
        
        // Validar rangos razonables
        if (isNaN(temp) || temp < -40 || temp > 80) return false;
        if (isNaN(hum) || hum < 0 || hum > 100) return false;
        if (isNaN(gas) || gas < 0 || gas > 4096) return false;
        
        return true;
    }

    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    broadcastData() {
        const message = JSON.stringify({
            type: 'dataUpdate',
            data: this.sensorData,
            clients: this.clients.size
        });

        this.clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
            }
        });
    }

    broadcastClientCount() {
        const message = JSON.stringify({
            type: 'clientCount',
            count: this.clients.size
        });

        this.clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
            }
        });
    }

    sendHeartbeat() {
        this.clients.forEach((client, id) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify({ type: 'ping' }));
            }
        });
    }

    cleanDeadConnections() {
        let removed = 0;
        this.clients.forEach((client, id) => {
            if (client.ws.readyState === WebSocket.CLOSED || 
                client.ws.readyState === WebSocket.CLOSING) {
                this.clients.delete(id);
                removed++;
            }
        });
        if (removed > 0) {
            console.log(`🧹 Cleaned ${removed} dead connections`);
            this.broadcastClientCount();
        }
    }

    // Método para enviar datos desde el endpoint HTTP
    updateData(data) {
        if (this.validateSensorData(data)) {
            this.sensorData = {
                temperature: parseFloat(data.temperature),
                humidity: parseFloat(data.humidity),
                gasValue: parseInt(data.gasValue),
                timestamp: Date.now()
            };
            this.broadcastData();
            return true;
        }
        return false;
    }

    getData() {
        return this.sensorData;
    }

    getClientCount() {
        return this.clients.size;
    }
}

module.exports = new WebSocketServer();