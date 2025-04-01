const setupGameEvents = (io) => {
    io.on('connection', (socket) => {
        console.log('🎮 Cliente conectado:', socket.id);

        // Evento cuando Unity envía una actualización de estadísticas
        socket.on('updateGameStats', (data) => {
            console.log('📊 Actualización de estadísticas recibida:', data);
            // Emitir a todos los clientes conectados
            io.emit('statsUpdated', data);
        });

        // Evento cuando Unity envía una actualización de ranking
        socket.on('updateRanking', (data) => {
            console.log('🏆 Actualización de ranking recibida:', data);
            io.emit('rankingUpdated', data);
        });

        // Eventos específicos del juego
        socket.on('playerKilled', (data) => {
            console.log('💀 Jugador eliminado:', data);
            io.emit('playerKilled', data);
        });

        socket.on('blockDestroyed', (data) => {
            console.log('🧱 Bloque destruido:', data);
            io.emit('blockDestroyed', data);
        });

        socket.on('bombPlaced', (data) => {
            console.log('💣 Bomba colocada:', data);
            io.emit('bombPlaced', data);
        });

        socket.on('gameEnded', (data) => {
            console.log('🎯 Juego terminado:', data);
            io.emit('gameEnded', data);
        });

        socket.on('disconnect', () => {
            console.log('👋 Cliente desconectado:', socket.id);
        });
    });
};

module.exports = { setupGameEvents };
