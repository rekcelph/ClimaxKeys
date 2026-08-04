const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
}));

app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Room state storage
const rooms = new Map();

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room
    socket.on('join_room', (data, callback) => {
        let code = data.code ? data.code.toUpperCase() : null;
        const isCreating = data.create;
        
        if (isCreating) {
            code = generateRoomCode();
            while (rooms.has(code)) code = generateRoomCode();
            
            rooms.set(code, {
                code: code,
                status: 'waiting', // waiting, countdown, racing, finished
                players: new Map(),
                host: socket.id
            });
        } else if (!code || !rooms.has(code)) {
            return callback({ error: 'Room not found' });
        } else if (rooms.get(code).status !== 'waiting') {
            return callback({ error: 'Race already started' });
        }

        socket.join(code);
        const room = rooms.get(code);
        
        // Add player to room
        room.players.set(socket.id, {
            id: socket.id,
            name: data.name || 'Guest',
            progress: 0,
            wpm: 0
        });

        // Broadcast to everyone in the room
        io.to(code).emit('room_state', {
            code: code,
            status: room.status,
            host: room.host,
            players: Array.from(room.players.values())
        });

        callback({ success: true, code: code });
    });

    // Start race (only host can do this)
    socket.on('start_race', (code) => {
        const room = rooms.get(code);
        if (room && room.host === socket.id && room.status === 'waiting') {
            room.status = 'countdown';
            io.to(code).emit('room_state', {
                code: code,
                status: room.status,
                host: room.host,
                players: Array.from(room.players.values())
            });

            // Start countdown
            let count = 3;
            const interval = setInterval(() => {
                count--;
                if (count <= 0) {
                    clearInterval(interval);
                    room.status = 'racing';
                    io.to(code).emit('race_started');
                    
                    room.botTimers = [];
                    for (const player of room.players.values()) {
                        if (player.isBot) {
                            const msPerWord = 60000 / player.targetWpm;
                            const t = setInterval(() => {
                                if (room.status !== 'racing') {
                                    clearInterval(t);
                                    return;
                                }
                                player.progress++;
                                player.wpm = player.targetWpm;
                                io.to(code).emit('player_update', {
                                    id: player.id,
                                    progress: player.progress,
                                    wpm: player.wpm
                                });
                            }, msPerWord + (Math.random() * 200 - 100));
                            room.botTimers.push(t);
                        }
                    }
                    
                    // Cleanup bots after 35s max duration
                    setTimeout(() => {
                        room.status = 'finished';
                        if (room.botTimers) {
                            room.botTimers.forEach(t => clearInterval(t));
                        }
                    }, 35000);
                } else {
                    io.to(code).emit('countdown', count);
                }
            }, 1000);
            io.to(code).emit('countdown', count);
        }
    });

    // Add Bot
    socket.on('add_bot', (code) => {
        const room = rooms.get(code);
        if (room && room.host === socket.id && room.status === 'waiting') {
            const botNames = ['CyberFox', 'NeonByte', 'PixelDust', 'RetroBot', 'MechTypist', 'AutoBot'];
            const botName = botNames[Math.floor(Math.random() * botNames.length)] + ' [BOT]';
            const botId = 'bot_' + Math.random().toString(36).substr(2, 9);
            
            room.players.set(botId, {
                id: botId,
                name: botName,
                progress: 0,
                wpm: 0,
                isBot: true,
                targetWpm: 30 + Math.floor(Math.random() * 70) // 30-100 wpm
            });
            
            io.to(code).emit('room_state', {
                code: code,
                status: room.status,
                host: room.host,
                players: Array.from(room.players.values())
            });
        }
    });

    // Update progress
    socket.on('update_progress', (data) => {
        const room = rooms.get(data.code);
        if (room) {
            const player = room.players.get(socket.id);
            if (player) {
                player.progress = data.progress;
                player.wpm = data.wpm;
                io.to(data.code).emit('player_update', {
                    id: socket.id,
                    progress: data.progress,
                    wpm: data.wpm
                });
            }
        }
    });

    // Handle disconnect
    socket.on('disconnecting', () => {
        for (const code of socket.rooms) {
            if (code !== socket.id) {
                const room = rooms.get(code);
                if (room) {
                    room.players.delete(socket.id);
                    if (room.players.size === 0) {
                        rooms.delete(code);
                    } else {
                        if (room.host === socket.id) {
                            // Assign new host
                            room.host = Array.from(room.players.keys())[0];
                        }
                        io.to(code).emit('room_state', {
                            code: code,
                            status: room.status,
                            host: room.host,
                            players: Array.from(room.players.values())
                        });
                    }
                }
            }
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
