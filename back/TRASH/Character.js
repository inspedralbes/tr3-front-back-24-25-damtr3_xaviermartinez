const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    health: {
        type: Number,
        default: 5
    },
    speed: {
        type: Number,
        default: 5
    },
    damage: {
        type: Number,
        default: 30
    },
    powerups: {
        moreBombs: {
            type: Boolean,
            default: false
        },
        speedBoost: {
            type: Boolean,
            default: false
        }
    },
    stats: {
        gamesPlayed: {
            type: Number,
            default: 0
        },
        wins: {
            type: Number,
            default: 0
        },
        enemiesDefeated: {
            type: Number,
            default: 0
        }
    }
});

module.exports = mongoose.model('Character', characterSchema);
