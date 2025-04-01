const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    gameId: String,
    date: { type: Date, default: Date.now },
    duration: Number, // duración en segundos
    winner: String,
    players: [{
        name: String,
        score: Number,
        bombsPlaced: Number,
        powerupsCollected: Number,
        kills: Number
    }],
    mapName: String
});

module.exports = mongoose.model('Stats', statsSchema);
