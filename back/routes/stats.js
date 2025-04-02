const express = require('express');
const router = express.Router();
const Stats = require('../models/Stats');

// Obtener todas las estadísticas
router.get('/', async (req, res) => {
    try {
        const stats = await Stats.find();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas de un jugador específico
router.get('/:player', async (req, res) => {
    try {
        const stats = await Stats.findOne({ player: req.params.player });
        if (!stats) {
            return res.status(404).json({ message: 'No se encontraron estadísticas para este jugador' });
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar o crear estadísticas de un jugador
router.post('/update', async (req, res) => {
    try {
        const { 
            player, 
            blocksDestroyed = 0, 
            bombsPlaced = 0, 
            gamesPlayed = 0 
        } = req.body;

        if (!player) {
            return res.status(400).json({ message: 'Se requiere el nombre del jugador' });
        }

        const stats = await Stats.findOneAndUpdate(
            { player },
            {
                $inc: {
                    blocksDestroyed,
                    bombsPlaced,
                    gamesPlayed
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
            message: 'Estadísticas actualizadas correctamente',
            stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener resumen de estadísticas globales
router.get('/summary/global', async (req, res) => {
    try {
        const summary = await Stats.aggregate([
            {
                $group: {
                    _id: null,
                    totalBlocksDestroyed: { $sum: '$blocksDestroyed' },
                    totalBombsPlaced: { $sum: '$bombsPlaced' },
                    totalGamesPlayed: { $sum: '$gamesPlayed' },
                    uniquePlayers: { $addToSet: '$player' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBlocksDestroyed: 1,
                    totalBombsPlaced: 1,
                    totalGamesPlayed: 1,
                    uniquePlayers: { $size: '$uniquePlayers' }
                }
            }
        ]);

        res.json(summary[0] || {
            totalBlocksDestroyed: 0,
            totalBombsPlaced: 0,
            totalGamesPlayed: 0,
            uniquePlayers: 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
