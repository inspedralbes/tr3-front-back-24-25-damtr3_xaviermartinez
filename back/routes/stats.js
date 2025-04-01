const express = require('express');
const router = express.Router();
const Stats = require('../models/Stats');

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
