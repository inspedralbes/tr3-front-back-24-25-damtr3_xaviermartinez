require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Character = require('./models/Character');

const app = express();
const port = process.env.PORT || 3000;

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB');
        // Crear un personaje de prueba
        const testCharacter = new Character({
            name: "Personaje de Prueba",
            health: 5,
            speed: 5,
            damage: 30
        });

        testCharacter.save()
            .then(() => console.log('✅ Personaje de prueba creado'))
            .catch(err => console.error('❌ Error al crear personaje:', err));
    })
    .catch(err => {
        console.error('❌ Error conectando a MongoDB:', err);
    });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../front')));

// Initial game data
let gameData = {
    characters: {
        character1: {
            name: "Personaje 1",
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
        character2: {
            name: "Personaje 2",
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
        }
    },
    gameSettings: {
        matchDuration: 180,
        suddenDeath: true,
        powerupSpawnRate: 0.3,
        startingLives: 3
    },
    gameState: {
        isGameActive: false,
        currentMatchId: null,
        activePlayers: []
    }
};

// API Endpoints for Web Interface
app.get('/api/game-data', (req, res) => {
    res.json(gameData);
});

app.get('/api/characters', (req, res) => {
    res.json(gameData.characters);
});

app.put('/api/characters/:id', (req, res) => {
    const { id } = req.params;
    const updatedCharacter = req.body;
    
    if (gameData.characters[id]) {
        gameData.characters[id] = {
            ...gameData.characters[id],
            ...updatedCharacter
        };
        res.json(gameData.characters[id]);
    } else {
        res.status(404).json({ error: 'Character not found' });
    }
});

app.put('/api/characters/:id/powerups', (req, res) => {
    const { id } = req.params;
    const powerups = req.body;
    
    if (gameData.characters[id]) {
        gameData.characters[id].powerups = {
            ...gameData.characters[id].powerups,
            ...powerups
        };
        res.json(gameData.characters[id].powerups);
    } else {
        res.status(404).json({ error: 'Character not found' });
    }
});

app.get('/api/settings', (req, res) => {
    res.json(gameData.gameSettings);
});

app.put('/api/settings', (req, res) => {
    const updatedSettings = req.body;
    gameData.gameSettings = {
        ...gameData.gameSettings,
        ...updatedSettings
    };
    res.json(gameData.gameSettings);
});

// Unity-specific endpoints
app.post('/api/unity/start-game', (req, res) => {
    const { players } = req.body;
    const matchId = Date.now().toString();
    
    gameData.gameState = {
        isGameActive: true,
        currentMatchId: matchId,
        activePlayers: players
    };

    // Prepare initial game state for Unity
    const gameState = {
        matchId,
        settings: gameData.gameSettings,
        players: players.map(playerId => ({
            id: playerId,
            ...gameData.characters[playerId]
        }))
    };

    res.json(gameState);
});

app.post('/api/unity/end-game', (req, res) => {
    const { matchId, results } = req.body;
    
    if (matchId !== gameData.gameState.currentMatchId) {
        return res.status(400).json({ error: 'Invalid match ID' });
    }

    // Update player stats
    results.forEach(result => {
        if (gameData.characters[result.playerId]) {
            const stats = gameData.characters[result.playerId].stats;
            stats.gamesPlayed++;
            if (result.isWinner) stats.wins++;
            stats.enemiesDefeated += result.enemiesDefeated || 0;
        }
    });

    // Reset game state
    gameData.gameState = {
        isGameActive: false,
        currentMatchId: null,
        activePlayers: []
    };

    res.json({ status: 'success' });
});

app.get('/api/unity/character/:id', (req, res) => {
    const { id } = req.params;
    
    if (gameData.characters[id]) {
        res.json(gameData.characters[id]);
    } else {
        res.status(404).json({ error: 'Character not found' });
    }
});

// Endpoint para sincronizar el estado del juego en tiempo real
app.post('/api/unity/sync-state', (req, res) => {
    const { matchId, playerStates } = req.body;
    
    if (matchId !== gameData.gameState.currentMatchId) {
        return res.status(400).json({ error: 'Invalid match ID' });
    }

    // Aquí podrías implementar la lógica de sincronización en tiempo real
    // Por ejemplo, usando WebSockets para una comunicación más eficiente

    res.json({ status: 'success' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
