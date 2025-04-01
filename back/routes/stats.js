const express = require('express');
const router = express.Router();
const Stats = require('../models/Stats');

// Recibir estadísticas desde Unity
router.post('/', async (req, res) => {
    try {
        const newStats = new Stats(req.body);
        await newStats.save();
        res.status(201).json({ message: "Statistics saved successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener datos para gráficos
router.get('/plot', async (req, res) => {
    try {
        // Obtener estadísticas agregadas por jugador
        const stats = await Stats.aggregate([
            {
                $group: {
                    _id: '$player',
                    totalBombs: { $sum: '$bombsPlaced' },
                    totalGames: { $sum: '$gamesPlayed' },
                    totalBlocks: { $sum: '$blocksDestroyed' },
                    lastMap: { $last: '$gameDetails.mapName' },
                    lastResult: { $last: '$gameDetails.result' }
                }
            },
            { $sort: { totalGames: -1 } },
            { $limit: 10 }
        ]);
        
        const plotData = {
            players: stats.map(s => s._id),
            bombsPlaced: stats.map(s => s.totalBombs),
            gamesPlayed: stats.map(s => s.totalGames),
            blocksDestroyed: stats.map(s => s.totalBlocks),
            lastMap: stats.map(s => s.lastMap),
            lastResult: stats.map(s => s.lastResult)
        };

        res.json(plotData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener resumen de estadísticas
router.get('/summary', async (req, res) => {
    try {
        const summary = await Stats.aggregate([
            {
                $group: {
                    _id: null,
                    totalGames: { $sum: '$gamesPlayed' },
                    totalBombs: { $sum: '$bombsPlaced' },
                    totalBlocks: { $sum: '$blocksDestroyed' },
                    uniquePlayers: { $addToSet: '$player' }
                }
            }
        ]);

        const result = summary[0] || {
            totalGames: 0,
            totalBombs: 0,
            totalBlocks: 0,
            uniquePlayers: []
        };

        result.uniquePlayersCount = result.uniquePlayers.length;
        delete result.uniquePlayers;
        delete result._id;

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas generales
router.get('/general', async (req, res) => {
    try {
        const totalGames = await Stats.countDocuments();
        const stats = await Stats.aggregate([
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$duration' },
                    totalGames: { $sum: 1 },
                    totalPlayers: { $sum: { $size: '$players' } },
                    totalBombs: { $sum: { $sum: '$players.bombsPlaced' } },
                    totalPowerups: { $sum: { $sum: '$players.powerupsCollected' } }
                }
            }
        ]);

        const playerStats = await Stats.aggregate([
            { $unwind: '$players' },
            {
                $group: {
                    _id: '$players.name',
                    totalKills: { $sum: '$players.kills' },
                    totalScore: { $sum: '$players.score' },
                    gamesPlayed: { $sum: 1 }
                }
            },
            { $sort: { totalScore: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            generalStats: stats[0],
            topPlayers: playerStats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas por mapa
router.get('/maps', async (req, res) => {
    try {
        const mapStats = await Stats.aggregate([
            {
                $group: {
                    _id: '$mapName',
                    gamesPlayed: { $sum: 1 },
                    avgDuration: { $avg: '$duration' },
                    totalKills: { $sum: { $sum: '$players.kills' } }
                }
            }
        ]);
        res.json(mapStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas de un jugador específico
router.get('/player/:name', async (req, res) => {
    try {
        const playerStats = await Stats.aggregate([
            { $unwind: '$players' },
            { $match: { 'players.name': req.params.name } },
            {
                $group: {
                    _id: '$players.name',
                    totalGames: { $sum: 1 },
                    totalKills: { $sum: '$players.kills' },
                    totalScore: { $sum: '$players.score' },
                    avgScore: { $avg: '$players.score' },
                    totalBombs: { $sum: '$players.bombsPlaced' },
                    totalPowerups: { $sum: '$players.powerupsCollected' }
                }
            }
        ]);
        res.json(playerStats[0] || { error: 'Player not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
