const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sequelize = require('../models/index.js');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        console.log('Recibiendo registro:', { username, password, name });

        // Verificar si el usuario ya existe
        const [existingUsers] = await sequelize.query(
            'SELECT * FROM users WHERE user = ?',
            {
                replacements: [username],
                type: sequelize.QueryTypes.SELECT
            }
        );
        console.log('usuarios existentes:', existingUsers);

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Insertar nuevo usuario
        const [result] = await sequelize.query(
            'INSERT INTO users (user, password, name) VALUES (?, ?, ?)',
            {
                replacements: [username, password, name],
                type: sequelize.QueryTypes.INSERT
            }
        );
        console.log("RESUUUUULTADOOOOOO", result);
        
        // Obtener el ID del usuario insertado
        const [idResult] = await sequelize.query(
            'SELECT id_user FROM users WHERE user = ? AND password = ? AND name = ?',
            {
                replacements: [username, password, name],
                type: sequelize.QueryTypes.SELECT
            }
        );
        console.log("ID insertado:", idResult);
        const userId = idResult.id_user;
        const jugador1 = "Jugador_" + name + "_1";
        const jugador2 = "Jugador_" + name + "_2";

        // Crear jugador asociado
        await sequelize.query(
            'INSERT INTO jugadores (id_user, id_jugador) VALUES (?, ?), (?, ?)',
            {
                replacements: [userId, jugador1, userId,jugador2],
                type: sequelize.QueryTypes.INSERT
            }
        );
        console.log("Jugadores creados para el usuario:", userId);

        res.status(200).json({
            message: 'Usuario registrado correctamente',
            user: {
                id: userId,
                username: username,
                name: name
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error en el servidor', details: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Intento de login:', { username });

        // Buscar usuario
        const [users] = await sequelize.query(
            'SELECT * FROM users WHERE user = ? AND password = ?',
            {
                replacements: [username, password],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!users || users.length === 0) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const user = users[0];

        res.status(200).json({
            message: 'Login correcto',
            user: {
                id: user.id_user,
                username: user.user,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor', details: error.message });
    }
});

module.exports = router;
