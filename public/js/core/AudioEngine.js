export default class AudioEngine {
    constructor(exceptionHandler) {
        this.exceptionHandler = exceptionHandler;
        this.audioCtx = null;
        this.soundEnabled = false;
        
        // Wrap public methods
        this.initAudio = this.exceptionHandler.wrap(this.initAudio.bind(this), 'AudioEngine.initAudio');
        this.playBeep = this.exceptionHandler.wrap(this.playBeep.bind(this), 'AudioEngine.playBeep');
        this.toggleSound = this.exceptionHandler.wrap(this.toggleSound.bind(this), 'AudioEngine.toggleSound');
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    toggleSound() {
        this.initAudio();
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) {
            this.playBeep(600, 0.1, 0.05);
        }
        return this.soundEnabled;
    }

    playBeep(freq, duration = 0.08, vol = 0.05) {
        if (!this.soundEnabled || !this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.value = vol;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playKeyClick() { this.playBeep(800, 0.03, 0.03); }
    playComboUp() { this.playBeep(1200, 0.06, 0.04); }
    playComboBreak() { this.playBeep(200, 0.12, 0.04); }
    playCountdown() { this.playBeep(600, 0.15, 0.05); }
    playGo() { this.playBeep(1000, 0.2, 0.06); }
    
    playFinish() { 
        this.playBeep(440, 0.3, 0.06); 
        setTimeout(this.exceptionHandler.wrap(() => { 
            this.playBeep(660, 0.3, 0.06); 
        }, 'AudioEngine.playFinish(setTimeout)'), 150); 
    }
}
