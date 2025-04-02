const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    player: String,
    bombsPlaced: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    blocksDestroyed: { type: Number, default: 0 },
    gameDetails: {
        date: { type: Date, default: Date.now }
    }
});

module.exports = mongoose.model('Stats', StatsSchema);
