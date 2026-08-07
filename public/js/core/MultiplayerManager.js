import { WORD_LIST } from './TypingEngine.js';

export default class MultiplayerManager {
    constructor(exceptionHandler) {
        this.exceptionHandler = exceptionHandler;
        this.socket = null;
        
        this.state = {
            status: 'lobby',
            duration: 30,
            timeLeft: 30,
            words: [],
            currentWordIndex: 0,
            currentInput: '',
            typedWords: [],
            isActive: false,
            correctChars: 0,
            totalCharsTyped: 0,
            timerInterval: null,
            playerName: localStorage.getItem('climaxkeys_name') || '',
            players: [],
            roomCode: null,
            isHost: false,
            lastRowTop: 0
        };

        this.onRoomStateUpdate = null;
        this.onCountdown = null;
        this.onRaceStarted = null;
        this.onPlayerUpdate = null;
        
        // Wrap public methods
        this.initSocket = this.exceptionHandler.wrap(this.initSocket.bind(this), 'MultiplayerManager.initSocket');
        this.createRoom = this.exceptionHandler.wrap(this.createRoom.bind(this), 'MultiplayerManager.createRoom');
        this.joinRoom = this.exceptionHandler.wrap(this.joinRoom.bind(this), 'MultiplayerManager.joinRoom');
        this.startRace = this.exceptionHandler.wrap(this.startRace.bind(this), 'MultiplayerManager.startRace');
        this.leave = this.exceptionHandler.wrap(this.leave.bind(this), 'MultiplayerManager.leave');
        this.addBot = this.exceptionHandler.wrap(this.addBot.bind(this), 'MultiplayerManager.addBot');
        this.tick = this.exceptionHandler.wrap(this.tick.bind(this), 'MultiplayerManager.tick');
    }

    initSocket() {
        if (typeof io === 'undefined') {
            const s = document.createElement('script');
            s.src = "/socket.io/socket.io.js";
            s.onload = () => this.setupSocket();
            document.head.appendChild(s);
        } else {
            this.setupSocket();
        }
    }

    setupSocket() {
        this.socket = io();

        this.socket.on('room_state', this.exceptionHandler.wrap((data) => {
            this.state.roomCode = data.code;
            this.state.status = data.status;
            this.state.isHost = (data.host === this.socket.id);
            this.state.players = data.players;
            if (this.onRoomStateUpdate) this.onRoomStateUpdate(data);
        }, 'Socket.on(room_state)'));

        this.socket.on('countdown', this.exceptionHandler.wrap((count) => {
            if (this.onCountdown) this.onCountdown(count);
            if (count === 3 && !this.state.isActive) {
                this.state.words = this.generateWords(120);
                this.state.currentWordIndex = 0;
                this.state.currentInput = '';
                this.state.typedWords = [];
                this.state.correctChars = 0;
                this.state.totalCharsTyped = 0;
                this.state.timeLeft = this.state.duration;
            }
        }, 'Socket.on(countdown)'));

        this.socket.on('race_started', this.exceptionHandler.wrap(() => {
            this.state.status = 'racing';
            this.state.isActive = true;
            this.state.timeLeft = this.state.duration;
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = setInterval(() => this.tick(), 1000);
            if (this.onRaceStarted) this.onRaceStarted();
        }, 'Socket.on(race_started)'));

        this.socket.on('player_update', this.exceptionHandler.wrap((data) => {
            const p = this.state.players.find(x => x.id === data.id);
            if (p) {
                p.progress = data.progress;
                p.wpm = data.wpm;
                if (this.onPlayerUpdate) this.onPlayerUpdate();
            }
        }, 'Socket.on(player_update)'));
    }

    generateWords(count) {
        let out = [];
        for (let i = 0; i < count; i++) {
            out.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
        }
        return out;
    }

    createRoom(name) {
        this.state.playerName = name || 'Player';
        localStorage.setItem('climaxkeys_name', this.state.playerName);
        if (this.socket) {
            this.socket.emit('join_room', { create: true, name: this.state.playerName }, (res) => {
                if (res.error) alert(res.error);
            });
        }
    }

    joinRoom(code, name) {
        if (!code) return alert('Enter a room code');
        this.state.playerName = name || 'Player';
        localStorage.setItem('climaxkeys_name', this.state.playerName);
        if (this.socket) {
            this.socket.emit('join_room', { create: false, code: code, name: this.state.playerName }, (res) => {
                if (res.error) alert(res.error);
            });
        }
    }

    startRace() {
        if (this.socket && this.state.isHost) {
            this.socket.emit('start_race', this.state.roomCode);
        }
    }

    addBot() {
        if (this.socket && this.state.isHost) {
            this.socket.emit('add_bot', this.state.roomCode);
        }
    }

    tick() {
        this.state.timeLeft--;
        if (this.socket) {
            this.socket.emit('update_progress', {
                code: this.state.roomCode,
                progress: this.state.currentWordIndex,
                wpm: this.calcWpm()
            });
        }
        if (this.onPlayerUpdate) this.onPlayerUpdate();
        if (this.state.timeLeft <= 0) {
            this.finish();
        }
    }

    scoreWord(target, typed) {
        let correct = 0;
        let len = Math.max(target.length, typed.length);
        for (let i = 0; i < Math.min(target.length, typed.length); i++) {
            if (target[i] === typed[i]) correct++;
        }
        return { correct, total: len };
    }

    calcWpm() {
        const elapsed = this.state.duration - this.state.timeLeft;
        return elapsed > 0 ? Math.round((this.state.correctChars / 5) / (elapsed / 60)) : 0;
    }

    finish() {
        clearInterval(this.state.timerInterval);
        this.state.status = 'finished';
        this.state.isActive = false;
        if (this.onPlayerUpdate) this.onPlayerUpdate('finished');
    }

    leave() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket.connect();
        }
        this.reset();
    }

    reset() {
        clearInterval(this.state.timerInterval);
        this.state.status = 'lobby';
        this.state.isActive = false;
        if (this.onPlayerUpdate) this.onPlayerUpdate('reset');
    }
}
