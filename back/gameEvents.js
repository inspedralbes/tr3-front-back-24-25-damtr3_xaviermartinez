const handleGameEvents = (io, socket, Stats) => {
    // Sala actual del jugador
    let currentRoom = null;

    // Unirse a una sala
    socket.on('join_room', (roomId) => {
        if (currentRoom) {
            socket.leave(currentRoom);
        }
        socket.join(roomId);
        currentRoom = roomId;
        io.to(roomId).emit('player_joined', {
            playerId: socket.id,
            timestamp: new Date()
        });
    });

    // Colocar bomba
    socket.on('place_bomb', (data) => {
        io.to(currentRoom).emit('bomb_placed', {
            playerId: socket.id,
            position: data.position,
            timestamp: new Date()
        });
    });

    // Recoger power-up
    socket.on('collect_powerup', (data) => {
        io.to(currentRoom).emit('powerup_collected', {
            playerId: socket.id,
            type: data.type,
            position: data.position,
            timestamp: new Date()
        });
    });

    // Jugador eliminado
    socket.on('player_killed', async (data) => {
        io.to(currentRoom).emit('player_death', {
            playerId: data.playerId,
            killerId: data.killerId,
            timestamp: new Date()
        });

        // Actualizar estadísticas
        try {
            await Stats.updateOne(
                { player: data.playerId },
                { $inc: { deaths: 1 } }
            );
            if (data.killerId) {
                await Stats.updateOne(
                    { player: data.killerId },
                    { $inc: { kills: 1 } }
                );
            }
        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
        }
    });

    // Actualización de estado del jugador
    socket.on('player_state', (data) => {
        io.to(currentRoom).emit('player_update', {
            playerId: socket.id,
            position: data.position,
            powerups: data.powerups,
            health: data.health,
            timestamp: new Date()
        });
    });

    // Final de la partida
    socket.on('game_over', async (data) => {
        io.to(currentRoom).emit('match_ended', {
            winner: data.winner,
            scores: data.scores,
            timestamp: new Date()
        });

        // Guardar estadísticas de la partida
        try {
            const gameStats = {
                player: data.winner,
                gamesPlayed: 1,
                kills: data.scores[data.winner].kills,
                bombsPlaced: data.scores[data.winner].bombsPlaced,
                powerupsCollected: data.scores[data.winner].powerupsCollected,
                winRate: 1,
                gameHistory: [{
                    mapName: data.mapName,
                    position: 1,
                    kills: data.scores[data.winner].kills,
                    date: new Date()
                }]
            };
            await Stats.updateOne(
                { player: data.winner },
                { $inc: { gamesPlayed: 1 }, $push: { gameHistory: gameStats.gameHistory[0] } }
            );
        } catch (error) {
            console.error('Error guardando estadísticas:', error);
        }
    });

    // Chat del juego
    socket.on('game_chat', (message) => {
        io.to(currentRoom).emit('chat_message', {
            playerId: socket.id,
            message: message,
            timestamp: new Date()
        });
    });
};

module.exports = handleGameEvents;
