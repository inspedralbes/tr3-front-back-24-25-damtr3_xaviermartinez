require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const statsRoutes = require('./routes/stats');
const charactersRoutes = require('./routes/characters');
const authRoutes = require('./routes/auth');
const { setupGameEvents } = require('./gameEvents');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:8080", "unity://game"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

const port = 3001;

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
app.use('/api/auth', authRoutes);

// Ruta para obtener el ranking
app.get('/api/rankings', async (req, res) => {
    try {
        const sequelize = require('./models/index.js');
        
        // Primero, veamos las tablas que existen
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('Tablas en la base de datos:', tables);
        
        // Luego, veamos la estructura de la tabla users
        const [structure] = await sequelize.query('DESCRIBE users');
        console.log('Estructura de la tabla users:', structure);
        
        // Finalmente, obtengamos todos los registros
        // const [players] = await sequelize.query('SELECT * FROM users');
        // console.log('Todos los jugadores:', players);
        
        const [players] = await sequelize.query('SELECT     u.name AS Nombre_Usuario,     j.id_jugador AS Nombre_Jugador,     j.wins FROM jugadores j JOIN users u ON j.id_user = u.id_user ORDER BY j.wins DESC');
        console.log('Todos los jugadores:', players);

        res.json({
            tables,
            structure,
            players
        });
    } catch (error) {
        console.error('Error al obtener rankings:', error);
        res.status(500).json({ error: 'Error al obtener rankings', details: error.message });
    }
});

// Ruta específica para Unity
app.post('/api/unity/stats', async (req, res) => {
    try {
        const { player, stats } = req.body;
        console.log('Recibiendo estadísticas de Unity:', { player, stats });
        
        // Validar los datos recibidos
        if (!player || !stats) {
            return res.status(400).json({ 
                error: 'Se requieren los campos player y stats' 
            });
        }

        // Actualizar las estadísticas usando el modelo existente
        const Stats = require('./TRASH/Stats.js');
        const updatedStats = await Stats.findOneAndUpdate(
            { player },
            {
                $inc: {
                    blocksDestroyed: stats.blocksDestroyed || 0,
                    bombsPlaced: stats.bombsPlaced || 0,
                    gamesPlayed: stats.gamesPlayed || 0
                },
                $set: {
                    'gameDetails.date': new Date()
                }
            },
            { 
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        res.json({
            message: 'Estadísticas actualizadas correctamente desde Unity',
            stats: updatedStats
        });
    } catch (error) {
        console.error('Error al procesar estadísticas de Unity:', error);
        res.status(500).json({ error: error.message });
    }
});


io.on('connection', (socket) => {
    console.log('🎮 Cliente conectado:', socket.id);
    
    // Configurar eventos del juego
    setupGameEvents(io);

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
    const Stats = require('./TRASH/Stats.js');
    const Character = require('./TRASH/Character.js');
    
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
