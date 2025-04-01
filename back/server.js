require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const statsRoutes = require('./routes/stats');
const charactersRoutes = require('./routes/characters');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // En producción, cambiar por la URL de Unity
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../front')));

// Rutas API
app.use('/api/stats', statsRoutes);
app.use('/api/characters', charactersRoutes);

// WebSocket eventos
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Evento cuando un jugador se une
    socket.on('player:join', (playerData) => {
        console.log('Jugador se unió:', playerData);
        io.emit('player:joined', playerData);
    });

    // Evento cuando un jugador se mueve
    socket.on('player:move', (moveData) => {
        socket.broadcast.emit('player:moved', moveData);
    });

    // Evento cuando un jugador coloca una bomba
    socket.on('player:placeBomb', (bombData) => {
        io.emit('bomb:placed', bombData);
    });

    // Evento cuando una bomba explota
    socket.on('bomb:explode', (explosionData) => {
        io.emit('bomb:exploded', explosionData);
    });

    // Evento cuando un jugador recibe daño
    socket.on('player:damage', (damageData) => {
        io.emit('player:damaged', damageData);
    });

    // Evento cuando un jugador recoge un power-up
    socket.on('player:powerup', (powerupData) => {
        io.emit('player:powerupCollected', powerupData);
    });

    // Evento cuando un jugador muere
    socket.on('player:die', (playerData) => {
        io.emit('player:died', playerData);
    });

    // Evento cuando termina la partida
    socket.on('game:end', (gameData) => {
        io.emit('game:ended', gameData);
    });

    // Desconexión del jugador
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
        io.emit('player:disconnected', { id: socket.id });
    });
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ Conectado a MongoDB');
        
        // Crear datos de prueba
        const Stats = require('./models/Stats');
        const Character = require('./models/Character');
        
        // Limpiar datos existentes
        await Stats.deleteMany({});
        await Character.deleteMany({});
        
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

        await Character.insertMany(testCharacters);
        
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
        
        await Stats.insertMany(testData);
        console.log('✅ Datos de prueba creados');
    })
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Iniciar servidor
httpServer.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
