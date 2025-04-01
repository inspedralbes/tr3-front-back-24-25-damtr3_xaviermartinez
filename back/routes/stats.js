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
        const stats = await Stats.aggregate([
            {
                $group: {
                    _id: null,
                    totalGames: { $sum: 1 },
                    totalBombs: { $sum: '$bombsPlaced' },
                    totalBlocks: { $sum: '$blocksDestroyed' },
                    totalKills: { $sum: '$kills' },
                    totalDeaths: { $sum: '$deaths' },
                    avgPlayTime: { $avg: '$totalPlayTime' },
                    totalPowerups: { $sum: '$powerupsCollected' }
                }
            }
        ]);

        const result = stats[0] || {
            totalGames: 0,
            totalBombs: 0,
            totalBlocks: 0,
            totalKills: 0,
            totalDeaths: 0,
            avgPlayTime: 0,
            totalPowerups: 0
        };

        delete result._id;
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas por jugador
router.get('/player/:name', async (req, res) => {
    try {
        const playerStats = await Stats.findOne({ player: req.params.name });
        if (!playerStats) {
            return res.status(404).json({ message: "Player not found" });
        }
        res.json(playerStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener ranking de jugadores
router.get('/ranking', async (req, res) => {
    try {
        const ranking = await Stats.aggregate([
            {
                $group: {
                    _id: '$player',
                    totalGames: { $sum: '$gamesPlayed' },
                    totalKills: { $sum: '$kills' },
                    totalDeaths: { $sum: '$deaths' },
                    winRate: { $avg: { $cond: [{ $eq: ['$gameHistory.result', 'win'] }, 1, 0] } }
                }
            },
            {
                $project: {
                    player: '$_id',
                    totalGames: 1,
                    totalKills: 1,
                    totalDeaths: 1,
                    winRate: 1,
                    kdRatio: {
                        $cond: [
                            { $eq: ['$totalDeaths', 0] },
                            '$totalKills',
                            { $divide: ['$totalKills', '$totalDeaths'] }
                        ]
                    }
                }
            },
            { $sort: { winRate: -1, kdRatio: -1 } },
            { $limit: 10 }
        ]);

        res.json(ranking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
