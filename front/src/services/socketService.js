import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.callbacks = new Map();
    }

    connect() {
        if (!this.socket) {
            this.socket = io('http://localhost:3001');
            
            this.socket.on('connect', () => {
                console.log(' Conectado al servidor de WebSocket');
            });

            this.socket.on('disconnect', () => {
                console.log(' Desconectado del servidor de WebSocket');
            });

            // Eventos del juego
            this.setupGameEvents();
        }
        return this.socket;
    }

    setupGameEvents() {
        const events = [
            'statsUpdated',
            'rankingUpdated',
            'playerKilled',
        ];

        events.forEach(event => {
            this.socket.on(event, (data) => {
                if (this.callbacks.has(event)) {
                    this.callbacks.get(event).forEach(callback => callback(data));
                }
            });
        });
    }

    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, new Set());
        }
        this.callbacks.get(event).add(callback);
    }

    off(event, callback) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).delete(callback);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();
