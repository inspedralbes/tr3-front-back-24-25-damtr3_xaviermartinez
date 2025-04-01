require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const statsRoutes = require('./routes/stats');
const charactersRoutes = require('./routes/characters');
const handleGameEvents = require('./gameEvents');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:8080", "unity://game"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:8080", "unity://game"],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/stats', statsRoutes);
app.use('/api/characters', charactersRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de healthcheck
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket eventos
io.on('connection', (socket) => {
    console.log('🎮 Cliente conectado:', socket.id);
    
    // Configurar eventos del juego
    const Stats = require('./models/Stats');
    handleGameEvents(io, socket, Stats);

    socket.on('disconnect', () => {
        console.log('👋 Cliente desconectado:', socket.id);
        io.emit('player:disconnected', { id: socket.id });
    });
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    // Crear datos de prueba
    const Stats = require('./models/Stats');
    const Character = require('./models/Character');
    
    // Limpiar datos existentes
    Stats.deleteMany({});
    Character.deleteMany({});
    
    // Crear algunos personajes de prueba
    const testCharacters = [
        {
            name: "Bomberman Clásico",
            health: 5,
            speed: 5,
            damage: 30,
            powerups: {
                moreBombs: false,
                speedBoost: false
            },
            stats: {
                gamesPlayed: 0,
                wins: 0,
                enemiesDefeated: 0
            }
        },
        {
            name: "Speed Demon",
            health: 3,
            speed: 8,
            damage: 20,
            powerups: {
                moreBombs: false,
                speedBoost: true
            },
            stats: {
                gamesPlayed: 0,
                wins: 0,
                enemiesDefeated: 0
            }
        },
        {
            name: "Tank",
            health: 8,
            speed: 3,
            damage: 40,
            powerups: {
                moreBombs: true,
                speedBoost: false
            },
            stats: {
                gamesPlayed: 0,
                wins: 0,
                enemiesDefeated: 0
            }
        }
    ];

    Character.insertMany(testCharacters);
    
    // Crear datos de prueba para estadísticas
    const testData = [
        {
            player: "Jugador1",
            bombsPlaced: 150,
            gamesPlayed: 10,
            blocksDestroyed: 300,
            gameDetails: {
                mapName: "Classic",
                duration: 300,
                result: "win"
            }
        }
    ];
    
    Stats.insertMany(testData);
    console.log('✅ Datos de prueba creados');
    // Iniciar el servidor después de conectar a MongoDB
    httpServer.listen(port, () => {
        console.log(`
        🎮 Servidor Bomberman iniciado:
        🌐 http://localhost:${port}
        📊 Estadísticas: http://localhost:${port}/api/stats
        🎯 WebSocket: ws://localhost:${port}
        `);
    });
})
.catch(error => {
    console.error('❌ Error conectando a MongoDB:', error);
});
