const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    player: String,
    bombsPlaced: Number,
    gamesPlayed: Number,
    blocksDestroyed: Number,
    kills: Number,
    deaths: Number,
    powerupsCollected: Number,
    totalPlayTime: Number, // en minutos
    winRate: Number,
    favoriteMap: String,
    achievements: [{
        name: String,
        description: String,
        dateUnlocked: Date
    }],
    gameHistory: [{
        date: { type: Date, default: Date.now },
        mapName: String,
        duration: Number,
        result: String,
        kills: Number,
        deaths: Number,
        bombsPlaced: Number,
        blocksDestroyed: Number,
        powerupsCollected: Number
    }],
    seasonStats: {
        season: Number,
        rank: String,
        points: Number,
        highestStreak: Number
    }
});

module.exports = mongoose.model('Stats', StatsSchema);
