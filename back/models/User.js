const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    username: {
        type: Number,
        default: 5
    },
    contrassenya: {
        type: Number,
        default: 5
    }
});

module.exports = mongoose.model('User', userSchema);
