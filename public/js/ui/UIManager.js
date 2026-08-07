const KEYBOARD_LAYOUT = [
    [
        { code: 'Backquote', label: '`', w: 1 }, { code: 'Digit1', label: '1', w: 1 }, { code: 'Digit2', label: '2', w: 1 },
        { code: 'Digit3', label: '3', w: 1 }, { code: 'Digit4', label: '4', w: 1 }, { code: 'Digit5', label: '5', w: 1 },
        { code: 'Digit6', label: '6', w: 1 }, { code: 'Digit7', label: '7', w: 1 }, { code: 'Digit8', label: '8', w: 1 },
        { code: 'Digit9', label: '9', w: 1 }, { code: 'Digit0', label: '0', w: 1 }, { code: 'Minus', label: '-', w: 1 },
        { code: 'Equal', label: '=', w: 1 }, { code: 'Backspace', label: '⌫', w: 2 }
    ],
    [
        { code: 'Tab', label: '⇥', w: 1.5 }, { code: 'KeyQ', label: 'Q', w: 1 }, { code: 'KeyW', label: 'W', w: 1 },
        { code: 'KeyE', label: 'E', w: 1 }, { code: 'KeyR', label: 'R', w: 1 }, { code: 'KeyT', label: 'T', w: 1 },
        { code: 'KeyY', label: 'Y', w: 1 }, { code: 'KeyU', label: 'U', w: 1 }, { code: 'KeyI', label: 'I', w: 1 },
        { code: 'KeyO', label: 'O', w: 1 }, { code: 'KeyP', label: 'P', w: 1 }, { code: 'BracketLeft', label: '[', w: 1 },
        { code: 'BracketRight', label: ']', w: 1 }, { code: 'Backslash', label: '\\', w: 1.5 }
    ],
    [
        { code: 'CapsLock', label: 'Caps', w: 1.75 }, { code: 'KeyA', label: 'A', w: 1 }, { code: 'KeyS', label: 'S', w: 1 },
        { code: 'KeyD', label: 'D', w: 1 }, { code: 'KeyF', label: 'F', w: 1 }, { code: 'KeyG', label: 'G', w: 1 },
        { code: 'KeyH', label: 'H', w: 1 }, { code: 'KeyJ', label: 'J', w: 1 }, { code: 'KeyK', label: 'K', w: 1 },
        { code: 'KeyL', label: 'L', w: 1 }, { code: 'Semicolon', label: ';', w: 1 }, { code: 'Quote', label: "'", w: 1 },
        { code: 'Enter', label: '⏎', w: 2.25 }
    ],
    [
        { code: 'ShiftLeft', label: '⇧', w: 2.25 }, { code: 'KeyZ', label: 'Z', w: 1 }, { code: 'KeyX', label: 'X', w: 1 },
        { code: 'KeyC', label: 'C', w: 1 }, { code: 'KeyV', label: 'V', w: 1 }, { code: 'KeyB', label: 'B', w: 1 },
        { code: 'KeyN', label: 'N', w: 1 }, { code: 'KeyM', label: 'M', w: 1 }, { code: 'Comma', label: ',', w: 1 },
        { code: 'Period', label: '.', w: 1 }, { code: 'Slash', label: '/', w: 1 }, { code: 'ShiftRight', label: '⇧', w: 2.75 }
    ],
    [
        { code: 'ControlLeft', label: 'Ctrl', w: 1.25 }, { code: 'MetaLeft', label: '⊞', w: 1.25 },
        { code: 'AltLeft', label: 'Alt', w: 1.25 }, { code: 'Space', label: '', w: 6.25 },
        { code: 'AltRight', label: 'Alt', w: 1.25 }, { code: 'MetaRight', label: '⊞', w: 1.25 },
        { code: 'ContextMenu', label: 'Menu', w: 1.25 }, { code: 'ControlRight', label: 'Ctrl', w: 1.25 }
    ]
];

export default class UIManager {
    constructor(exceptionHandler, typingEngine, audioEngine, multiplayerManager) {
        this.exceptionHandler = exceptionHandler;
        this.typingEngine = typingEngine;
        this.audioEngine = audioEngine;
        this.mpManager = multiplayerManager;

        this.keyEls = new Map();
        this.currentView = 'view-keytest';
        this.promptCallback = null;

        // Wrap UI methods
        this.init = this.exceptionHandler.wrap(this.init.bind(this), 'UIManager.init');
        this.handleKeyDown = this.exceptionHandler.wrap(this.handleKeyDown.bind(this), 'UIManager.handleKeyDown');
        this.handleKeyUp = this.exceptionHandler.wrap(this.handleKeyUp.bind(this), 'UIManager.handleKeyUp');
        this.handleMpKeyDown = this.exceptionHandler.wrap(this.handleMpKeyDown.bind(this), 'UIManager.handleMpKeyDown');
        this.renderTypingArea = this.exceptionHandler.wrap(this.renderTypingArea.bind(this), 'UIManager.renderTypingArea');
        this.updateStatsDisplay = this.exceptionHandler.wrap(this.updateStatsDisplay.bind(this), 'UIManager.updateStatsDisplay');
        this.showResults = this.exceptionHandler.wrap(this.showResults.bind(this), 'UIManager.showResults');
        this.switchView = this.exceptionHandler.wrap(this.switchView.bind(this), 'UIManager.switchView');
        this.mpRenderPlayers = this.exceptionHandler.wrap(this.mpRenderPlayers.bind(this), 'UIManager.mpRenderPlayers');
        this.mpRenderWords = this.exceptionHandler.wrap(this.mpRenderWords.bind(this), 'UIManager.mpRenderWords');
        
        // Hooks
        this.typingEngine.onTick = () => this.updateStatsDisplay();
        this.typingEngine.onFinish = () => this.showResults();
        
        this.mpManager.onRoomStateUpdate = (data) => {
            if (this.mpManager.state.status === 'waiting') {
                document.getElementById('mpLobby').classList.add('hidden');
                document.getElementById('mpRacing').classList.add('hidden');
                document.getElementById('mpResults').classList.add('hidden');
                document.getElementById('mpWaiting').classList.remove('hidden');

                document.getElementById('mpWaitingCode').textContent = data.code;
                document.getElementById('mpHostControls').classList.toggle('hidden', !this.mpManager.state.isHost);

                let html = '';
                data.players.forEach(p => {
                    html += '<li class="mp-player">';
                    html += '<span class="mp-player-name">' + this.escapeHtml(p.name) + (p.id === this.mpManager.socket.id ? ' (YOU)' : '') + (p.id === data.host ? ' 👑' : '') + '</span>';
                    html += '</li>';
                });
                document.getElementById('mpWaitingPlayers').innerHTML = html;
            }
        };

        this.mpManager.onCountdown = (count) => {
            document.getElementById('mpWaiting').classList.add('hidden');
            document.getElementById('mpRacing').classList.remove('hidden');
            document.getElementById('mpRoomCode').textContent = this.mpManager.state.roomCode;
            document.getElementById('mpCountdownMsg').textContent = 'Starting in ' + count + '...';
            
            if (count === 3 && !this.mpManager.state.isActive) {
                document.getElementById('mpTimeLeft').textContent = this.mpManager.state.timeLeft;
                this.mpRenderPlayers();
                this.mpRenderWords();
            }
        };

        this.mpManager.onRaceStarted = () => {
            document.getElementById('mpCountdownMsg').textContent = 'RACE!';
            setTimeout(() => { document.getElementById('mpCountdownMsg').textContent = ''; }, 1000);
            document.getElementById('mpWordsDisplay').focus();
        };

        this.mpManager.onPlayerUpdate = (status) => {
            if (status === 'finished') {
                this.mpFinishResults();
            } else if (status === 'reset') {
                this.mpResetUI();
            } else {
                if (this.mpManager.state.status === 'racing') {
                    this.mpRenderPlayers();
                    document.getElementById('mpTimeLeft').textContent = this.mpManager.state.timeLeft;
                }
            }
        };
    }

    escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    keyLabelFromEvent(e) {
        if (e.code === 'Space') return '␣';
        if (e.key && e.key.length === 1) return e.key.toUpperCase();
        const special = { Enter: '⏎', Backspace: '⌫', Tab: '⇥', ShiftLeft: '⇧', ShiftRight: '⇧', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', AltLeft: 'Alt', AltRight: 'Alt', CapsLock: 'Caps', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Escape: 'Esc', MetaLeft: '⊞', MetaRight: '⊞' };
        return special[e.code] || (e.key || e.code);
    }

    getRank(wpm) {
        if (wpm >= 120) return 'SS';
        if (wpm >= 90) return 'S';
        if (wpm >= 70) return 'A';
        if (wpm >= 50) return 'B';
        if (wpm >= 35) return 'C';
        if (wpm >= 20) return 'D';
        return 'F';
    }

    getPB() {
        try { return parseInt(localStorage.getItem('climaxkeys_pb') || '0', 10); } catch (e) { return 0; }
    }

    setPB(wpm) {
        try { localStorage.setItem('climaxkeys_pb', String(wpm)); } catch (e) { }
    }

    buildKeyboard(root) {
        const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform || navigator.userAgent || '');
        const overrides = isMac ? { MetaLeft: '⌘', MetaRight: '⌘', AltLeft: 'Option', AltRight: 'Option' } : {};
        KEYBOARD_LAYOUT.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'kb-row';
            row.forEach(k => {
                const el = document.createElement('div');
                el.className = 'kb-key' + ((k.code === 'KeyF' || k.code === 'KeyJ') ? ' home-bump' : '');
                el.style.flexGrow = k.w;
                el.style.flexBasis = '0';
                el.dataset.code = k.code;
                const span = document.createElement('span');
                span.textContent = overrides[k.code] || k.label;
                el.appendChild(span);
                rowEl.appendChild(el);
                this.keyEls.set(k.code, el);
            });
            root.appendChild(rowEl);
        });
    }

    setKeyPressed(code, pressed) {
        const el = this.keyEls.get(code);
        if (!el) return;
        el.classList.toggle('pressed', pressed);
        if (pressed) el.classList.add('tested');
    }

    updateLastKeyDisplay() {
        document.getElementById('lastKeyBox').textContent = this.typingEngine.state.lastKey.label;
        document.getElementById('lastKeyCode').textContent = this.typingEngine.state.lastKey.code;
        document.getElementById('testedCount').textContent = this.typingEngine.state.testedKeys.size;
    }

    showPrompt(title, type, defaultValue, callback) {
        const modal = document.getElementById('promptModal');
        const titleEl = document.getElementById('promptTitle');
        const inputEl = document.getElementById('promptInput');
        const textEl = document.getElementById('promptTextarea');
        const advancedEl = document.getElementById('promptAdvanced');
        const boxEl = document.getElementById('modalBox');
        
        titleEl.textContent = title;
        this.promptCallback = callback;
        
        if (type === 'textarea') {
            inputEl.classList.add('hidden');
            advancedEl.classList.remove('hidden');
            boxEl.classList.add('large');
            textEl.value = defaultValue || '';
        } else {
            advancedEl.classList.add('hidden');
            boxEl.classList.remove('large');
            inputEl.classList.remove('hidden');
            inputEl.value = defaultValue || '';
        }
        
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            if (type === 'textarea') {
                textEl.focus();
                textEl.selectionStart = textEl.selectionEnd = textEl.value.length;
            } else {
                inputEl.focus();
                inputEl.select();
            }
        }, 10);
    }

    closePrompt(submit) {
        const modal = document.getElementById('promptModal');
        if (modal.classList.contains('hidden')) return;
        
        const inputEl = document.getElementById('promptInput');
        const textEl = document.getElementById('promptTextarea');
        const type = inputEl.classList.contains('hidden') ? 'textarea' : 'text';
        const val = type === 'textarea' ? textEl.value : inputEl.value;
        
        modal.classList.add('hidden');
        
        if (this.promptCallback) {
            const cb = this.promptCallback;
            this.promptCallback = null;
            if (submit) cb(val);
            else cb(null);
        }
    }

    renderTypingArea() {
        const container = document.getElementById('wordsDisplay');
        const startIdx = Math.max(0, this.typingEngine.state.currentWordIndex - 15);
        const endIdx = Math.min(this.typingEngine.state.words.length, this.typingEngine.state.currentWordIndex + 30);
        let html = '';
        for (let wi = startIdx; wi < endIdx; wi++) {
            const word = this.typingEngine.state.words[wi];
            html += '<span class="word' + (wi === this.typingEngine.state.currentWordIndex ? ' current' : '') + '">';
            if (wi < this.typingEngine.state.currentWordIndex) {
                const typedDone = this.typingEngine.state.typedWords[wi] || '';
                const len = Math.max(word.length, typedDone.length);
                for (let i = 0; i < len; i++) {
                    const t = word[i], y = typedDone[i];
                    if (y === undefined) html += '<span class="char missed">' + this.escapeHtml(t) + '</span>';
                    else if (t === undefined) html += '<span class="char extra">' + this.escapeHtml(y) + '</span>';
                    else if (y === t) html += '<span class="char correct">' + this.escapeHtml(t) + '</span>';
                    else html += '<span class="char incorrect">' + this.escapeHtml(t) + '</span>';
                }
            } else if (wi === this.typingEngine.state.currentWordIndex) {
                const typed = this.typingEngine.state.currentInput;
                for (let j = 0; j < word.length; j++) {
                    if (j < typed.length) {
                        html += '<span class="char ' + (typed[j] === word[j] ? 'correct' : 'incorrect') + '">' + this.escapeHtml(word[j]) + '</span>';
                    } else {
                        html += '<span class="char">' + this.escapeHtml(word[j]) + '</span>';
                    }
                }
                if (typed.length > word.length) {
                    for (let k = word.length; k < typed.length; k++) html += '<span class="char extra">' + this.escapeHtml(typed[k]) + '</span>';
                }
                html += '<span class="cursor"></span>';
            } else {
                html += '<span class="char">' + this.escapeHtml(word) + '</span>';
            }
            html += '</span>';
        }
        container.innerHTML = html;
        const currentEl = container.querySelector('.word.current');
        if (currentEl) {
            const top = currentEl.offsetTop;
            if (top !== this.typingEngine.state.lastRowTop) {
                let targetScroll = top - 48;
                if (targetScroll < 0) targetScroll = 0;
                container.scrollTop = targetScroll;
                this.typingEngine.state.lastRowTop = top;
            }
        }
    }

    updateStatsDisplay() {
        if (this.typingEngine.state.mode === 'time') {
            document.getElementById('statTime').textContent = this.typingEngine.state.timeLeft;
        } else {
            document.getElementById('statTime').textContent = this.typingEngine.state.timeElapsed;
        }
        
        const elapsed = this.typingEngine.state.mode === 'time' ? (this.typingEngine.state.timeConfig - this.typingEngine.state.timeLeft) : this.typingEngine.state.timeElapsed;
        const wpm = this.typingEngine.calculateWpm(elapsed);
        document.getElementById('statWpm').textContent = Math.round(wpm);
        const acc = this.typingEngine.state.totalCharsTyped > 0 ? Math.round((this.typingEngine.state.correctChars / this.typingEngine.state.totalCharsTyped) * 100) : 100;
        document.getElementById('statAcc').textContent = acc + '%';
        this.updateComboDisplay();
        this.updateStreakDisplay();
    }

    updateComboDisplay() {
        const el = document.getElementById('comboVal');
        el.textContent = '×' + this.typingEngine.state.combo;
        const parent = el.closest('.combo-display');
        parent.classList.remove('fire', 'blazing');
        if (this.typingEngine.state.combo >= 10) parent.classList.add('blazing');
        else if (this.typingEngine.state.combo >= 5) parent.classList.add('fire');
        el.classList.remove('combo-pop');
        void el.offsetWidth;
        el.classList.add('combo-pop');
    }

    updateStreakDisplay() {
        document.getElementById('streakVal').textContent = this.typingEngine.state.streak;
    }

    updatePBDisplay() {
        const pb = this.getPB();
        document.getElementById('pbVal').textContent = pb > 0 ? pb : '--';
    }

    showResults() {
        this.audioEngine.playFinish();

        const duration = this.typingEngine.state.mode === 'time' ? this.typingEngine.state.timeConfig : (this.typingEngine.state.timeElapsed || 1);
        const wpm = Math.round(this.typingEngine.calculateWpm(duration));
        const acc = this.typingEngine.state.totalCharsTyped > 0 ? Math.round((this.typingEngine.state.correctChars / this.typingEngine.state.totalCharsTyped) * 100) : 100;
        document.getElementById('resultsWpm').textContent = wpm;
        document.getElementById('resultsAcc').textContent = acc + '%';
        document.getElementById('resultsChars').textContent = this.typingEngine.state.totalCharsTyped;
        document.getElementById('resultsStreak').textContent = this.typingEngine.state.maxStreak;
        document.getElementById('resultsCombo').textContent = '×' + this.typingEngine.state.maxCombo;

        const rank = this.getRank(wpm);
        document.getElementById('rankBadge').innerHTML = '<div class="rank-badge rank-' + rank.replace(/\+/g, '') + '">' + rank + '</div>';

        const modeKey = this.typingEngine.state.mode + '_' + (this.typingEngine.state.mode === 'words' ? this.typingEngine.state.wordsConfig : (this.typingEngine.state.mode === 'time' ? this.typingEngine.state.timeConfig : this.typingEngine.state.quoteConfig || ''));
        const pbKey = 'pb_' + modeKey;
        const currentPb = localStorage.getItem(pbKey) || 0;
        const msg = document.getElementById('newRecordMsg');

        if (wpm > currentPb && wpm > 0) {
            localStorage.setItem(pbKey, String(wpm));
            this.setPB(wpm); // global highest if needed
            msg.innerHTML = '<div class="new-record">★ NEW PERSONAL BEST! ★</div>';
        } else {
            msg.innerHTML = '';
        }
        this.updatePBDisplay();

        const username = localStorage.getItem('climaxkeys_name') || 'Guest_' + Math.floor(Math.random() * 1000);
        
        document.getElementById('wordsDisplay').classList.add('hidden');
        document.getElementById('typingStats').classList.add('hidden');
        document.getElementById('gameBar').classList.add('hidden');
        document.getElementById('resultsPanel').classList.remove('hidden');

        // Submit score
        fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                mode: this.typingEngine.state.mode,
                wpm: wpm,
                accuracy: parseFloat(acc.toFixed(1))
            })
        }).then(res => res.json()).then(data => {
            return fetch('/api/scores/top?mode=' + this.typingEngine.state.mode);
        }).then(res => res.json()).then(topScores => {
            let html = '<h4>Global Leaderboard (' + this.typingEngine.state.mode + ')</h4><ol style="text-align:left; font-family: var(--font-terminal); color: var(--text-dim);">';
            topScores.forEach(s => {
                html += '<li><strong style="color:var(--text)">' + s.username + '</strong> - ' + s.wpm + ' WPM (' + s.accuracy + '%)</li>';
            });
            html += '</ol>';
            let div = document.getElementById('leaderboardDisplay');
            if (!div) {
                div = document.createElement('div');
                div.id = 'leaderboardDisplay';
                div.style.marginTop = '20px';
                document.querySelector('.results-stats').after(div);
            }
            div.innerHTML = html;
        }).catch(err => {
            this.exceptionHandler.handle(err, 'showResults.submitScore');
        });
    }

    buildDurationButtons() {
        const row = document.getElementById('durationRow');
        row.innerHTML = '';
        
        if (this.typingEngine.state.mode === 'custom') {
            const changeBtn = document.createElement('button');
            changeBtn.className = 'config-btn active';
            changeBtn.textContent = 'Change Text';
            changeBtn.addEventListener('click', () => {
                if (this.typingEngine.state.isActive) return;
                this.showPrompt("Enter custom text:", "textarea", this.typingEngine.state.customText, (text) => {
                    if (text && text.trim()) {
                        this.typingEngine.state.customText = text.trim();
                        this.resetTestUI();
                    }
                });
            });
            row.appendChild(changeBtn);
            const slbl = document.querySelector('#statTime').nextElementSibling;
            if (slbl) slbl.textContent = 'time (s)';
            return;
        }
        
        if (this.typingEngine.state.mode === 'quote') {
            const quoteOptions = ['short', 'medium', 'long'];
            const currentQuote = this.typingEngine.state.quoteConfig || 'medium';
            quoteOptions.forEach(d => {
                const btn = document.createElement('button');
                btn.className = 'config-btn' + (d === currentQuote ? ' active' : '');
                btn.textContent = d;
                btn.addEventListener('click', () => {
                    if (this.typingEngine.state.isActive) return;
                    this.typingEngine.state.quoteConfig = d;
                    this.buildDurationButtons();
                    this.resetTestUI();
                });
                row.appendChild(btn);
            });
            const slbl = document.querySelector('#statTime').nextElementSibling;
            if (slbl) slbl.textContent = 'time (s)';
            return;
        }
        
        if (this.typingEngine.state.mode === 'zen') {
            const stopBtn = document.createElement('button');
            stopBtn.className = 'config-btn icon-only active';
            stopBtn.title = 'Stop Zen session';
            stopBtn.innerHTML = '<span class="icon">🛑</span> STOP';
            stopBtn.addEventListener('click', () => {
                if (this.typingEngine.state.isActive) this.typingEngine.finishTest();
            });
            row.appendChild(stopBtn);
            const slbl = document.querySelector('#statTime').nextElementSibling;
            if (slbl) slbl.textContent = 'time (s)';
            return;
        }
        
        const options = this.typingEngine.state.mode === 'time' ? [15, 30, 60, 120] : [10, 25, 50, 100];
        const currentVal = this.typingEngine.state.mode === 'time' ? this.typingEngine.state.timeConfig : this.typingEngine.state.wordsConfig;
        let hasCurrentVal = false;
        
        options.forEach(d => {
            if (d === currentVal) hasCurrentVal = true;
            const btn = document.createElement('button');
            btn.className = 'config-btn' + (d === currentVal ? ' active' : '');
            btn.textContent = String(d);
            btn.dataset.duration = String(d);
            btn.addEventListener('click', () => {
                if (this.typingEngine.state.isActive) return;
                if (this.typingEngine.state.mode === 'time') {
                    this.typingEngine.state.timeConfig = d;
                } else {
                    this.typingEngine.state.wordsConfig = d;
                }
                this.buildDurationButtons();
                this.resetTestUI();
            });
            row.appendChild(btn);
        });
        
        if (!hasCurrentVal && currentVal > 0) {
            const cBtn = document.createElement('button');
            cBtn.className = 'config-btn active';
            cBtn.textContent = String(currentVal);
            cBtn.addEventListener('click', () => {
                if (this.typingEngine.state.isActive) return;
                this.buildDurationButtons();
                this.resetTestUI();
            });
            row.appendChild(cBtn);
        }

        const customBtn = document.createElement('button');
        customBtn.className = 'config-btn icon-only';
        customBtn.title = 'Custom amount';
        customBtn.innerHTML = '<span class="icon">🛠</span>';
        customBtn.addEventListener('click', () => {
            if (this.typingEngine.state.isActive) return;
            const promptMsg = this.typingEngine.state.mode === 'time' ? 'Enter custom time (seconds):' : 'Enter custom word count:';
            this.showPrompt(promptMsg, "text", "", (val) => {
                if (val) {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                        if (this.typingEngine.state.mode === 'time') {
                            this.typingEngine.state.timeConfig = parsed;
                        } else {
                            this.typingEngine.state.wordsConfig = parsed;
                        }
                        this.buildDurationButtons();
                        this.resetTestUI();
                    }
                }
            });
        });
        row.appendChild(customBtn);
        
        const statLabelEl = document.querySelector('#statTime').nextElementSibling;
        if (statLabelEl) {
            statLabelEl.textContent = this.typingEngine.state.mode === 'time' ? 'seconds' : 'time (s)';
        }
    }

    updateConfigUI() {
        document.querySelectorAll('#configModifiers .config-btn').forEach(b => {
            if (this.typingEngine.state[b.dataset.mod]) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        document.querySelectorAll('#configModes .config-btn').forEach(b => {
            if (b.dataset.mode === this.typingEngine.state.mode) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        
        const modGroup = document.getElementById('configModifiers');
        if (this.typingEngine.state.mode === 'quote' || this.typingEngine.state.mode === 'zen' || this.typingEngine.state.mode === 'custom') {
            modGroup.style.display = 'none';
        } else {
            modGroup.style.display = 'flex';
        }
    }

    resetTestUI() {
        this.typingEngine.resetTest();
        document.getElementById('wordsDisplay').classList.remove('hidden');
        document.getElementById('typingStats').classList.remove('hidden');
        document.getElementById('gameBar').classList.remove('hidden');
        document.getElementById('resultsPanel').classList.add('hidden');

        this.buildDurationButtons();
        this.updateStatsDisplay();
        this.updatePBDisplay();
        this.renderTypingArea();

        document.getElementById('wordsDisplay').scrollTop = 0;
        window.scrollTo(0, 0);
    }

    isTypingFocused() {
        return this.currentView === 'view-typing';
    }

    isMpFocused() {
        return this.mpManager.state.status === 'racing';
    }

    handleKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const modal = document.getElementById('promptModal');
        if (modal && !modal.classList.contains('hidden')) return;

        this.typingEngine.state.pressedKeys.add(e.code);
        this.typingEngine.state.testedKeys.add(e.code);
        this.typingEngine.state.lastKey = { code: e.code, label: this.keyLabelFromEvent(e) };
        this.setKeyPressed(e.code, true);
        this.updateLastKeyDisplay();
        this.audioEngine.playKeyClick();

        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (this.isMpFocused()) {
            this.handleMpKeyDown(e);
            return;
        }

        if (this.typingEngine.state.isFinished) {
            if (e.code === 'Space') e.preventDefault();
            return;
        }

        if (e.code === 'Tab') { e.preventDefault(); return; }

        if (e.code === 'Backspace') {
            e.preventDefault();
            if (!this.isTypingFocused()) return;
            if (this.typingEngine.state.currentInput.length > 0) {
                this.typingEngine.state.currentInput = this.typingEngine.state.currentInput.slice(0, -1);
                this.renderTypingArea();
            } else if (this.typingEngine.state.isActive && this.typingEngine.state.currentWordIndex > 0) {
                if (this.typingEngine.unfinalizeLastWord()) {
                    this.renderTypingArea();
                    this.updateStatsDisplay();
                }
            }
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            if (e.repeat) return;
            if (!this.isTypingFocused()) return;

            if (!this.typingEngine.state.isActive) {
                this.typingEngine.startTest();
            }

            if (this.typingEngine.state.mode === 'zen') {
                if (this.typingEngine.state.currentInput.length > 0) {
                    this.typingEngine.state.words[this.typingEngine.state.currentWordIndex] = this.typingEngine.state.currentInput;
                    this.typingEngine.state.typedWords[this.typingEngine.state.currentWordIndex] = this.typingEngine.state.currentInput;
                    this.typingEngine.state.correctChars += this.typingEngine.state.currentInput.length + 1;
                    this.typingEngine.state.totalCharsTyped += this.typingEngine.state.currentInput.length + 1;
                    this.typingEngine.state.currentWordIndex++;
                    this.typingEngine.state.currentInput = '';
                    this.renderTypingArea();
                    this.updateStatsDisplay();
                }
                return;
            }

            if (this.typingEngine.state.isActive) {
                const res = this.typingEngine.finalizeCurrentWord();
                if (res.perfect) this.audioEngine.playComboUp();
                else if (this.typingEngine.state.combo === 1) this.audioEngine.playComboBreak();
                
                this.renderTypingArea();
                this.updateStatsDisplay();
            }
            return;
        }

        if (e.repeat) return;

        if (e.key && e.key.length === 1) {
            e.preventDefault();
            if (!this.isTypingFocused()) return;

            if (!this.typingEngine.state.isActive) {
                this.typingEngine.startTest();
            }

            if (this.typingEngine.state.isActive) {
                this.typingEngine.state.currentInput += e.key;
                
                if (this.typingEngine.state.mode === 'zen') {
                    if (this.typingEngine.state.currentWordIndex >= this.typingEngine.state.words.length) {
                        this.typingEngine.state.words.push(this.typingEngine.state.currentInput);
                    } else {
                        this.typingEngine.state.words[this.typingEngine.state.currentWordIndex] = this.typingEngine.state.currentInput;
                    }
                } else {
                    const target = this.typingEngine.state.words[this.typingEngine.state.currentWordIndex];
                    if ((this.typingEngine.state.mode === 'words' || this.typingEngine.state.mode === 'quote' || this.typingEngine.state.mode === 'custom') && this.typingEngine.state.currentWordIndex === this.typingEngine.state.words.length - 1) {
                        if (this.typingEngine.state.currentInput === target) {
                            const res = this.typingEngine.finalizeCurrentWord();
                            if (res.perfect) this.audioEngine.playComboUp();
                            this.renderTypingArea();
                            this.updateStatsDisplay();
                            return;
                        }
                    }
                }
                
                this.renderTypingArea();
            }
        }
    }

    handleKeyUp(e) {
        this.typingEngine.state.pressedKeys.delete(e.code);
        this.setKeyPressed(e.code, false);
    }

    handleMpKeyDown(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (this.mpManager.state.status !== 'racing' || !this.mpManager.state.isActive) return;
        if (e.target.tagName === 'INPUT') return;

        if (e.code === 'Tab') { e.preventDefault(); return; }

        if (e.code === 'Backspace') {
            e.preventDefault();
            if (this.mpManager.state.currentInput.length > 0) {
                this.mpManager.state.currentInput = this.mpManager.state.currentInput.slice(0, -1);
                this.mpRenderWords();
            }
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            if (e.repeat) return;
            const target = this.mpManager.state.words[this.mpManager.state.currentWordIndex];
            const s = this.mpManager.scoreWord(target, this.mpManager.state.currentInput);
            this.mpManager.state.correctChars += s.correct;
            this.mpManager.state.totalCharsTyped += s.total;
            this.mpManager.state.typedWords[this.mpManager.state.currentWordIndex] = this.mpManager.state.currentInput;
            this.mpManager.state.currentWordIndex++;
            this.mpManager.state.currentInput = '';
            
            this.mpRenderWords();
            this.mpRenderPlayers();
            if (this.mpManager.socket) {
                this.mpManager.socket.emit('update_progress', {
                    code: this.mpManager.state.roomCode,
                    progress: this.mpManager.state.currentWordIndex,
                    wpm: this.mpManager.calcWpm()
                });
            }
            return;
        }

        if (e.repeat) return;
        if (e.key && e.key.length === 1) {
            e.preventDefault();
            this.mpManager.state.currentInput += e.key;
            this.mpRenderWords();
        }
    }

    mpRenderPlayers() {
        const list = document.getElementById('mpPlayerList');
        let maxWords = Math.max(this.mpManager.state.currentWordIndex, 1);
        this.mpManager.state.players.forEach(b => { if (b.progress > maxWords) maxWords = b.progress; });
        maxWords = Math.max(maxWords, 1);

        const players = this.mpManager.state.players.map(p => {
            const isYou = this.mpManager.socket && p.id === this.mpManager.socket.id;
            const currentWpm = isYou ? this.mpManager.calcWpm() : p.wpm;
            const words = isYou ? this.mpManager.state.currentWordIndex : p.progress;
            return {
                name: p.name + (isYou ? ' (YOU)' : ''),
                words: words,
                wpm: currentWpm,
                isYou: isYou
            };
        });

        players.sort((a, b) => b.words - a.words);

        let html = '';
        players.forEach((p, i) => {
            const pct = Math.min(100, (p.words / maxWords) * 100);
            html += '<li class="mp-player' + (p.isYou ? ' you' : ' bot') + '">';
            html += '<span class="mp-player-rank">#' + (i + 1) + '</span>';
            html += '<span class="mp-player-name">' + this.escapeHtml(p.name) + '</span>';
            html += '<div class="mp-player-bar-wrap"><div class="mp-player-bar" style="width:' + pct + '%"></div></div>';
            html += '<span class="mp-player-wpm">' + p.wpm + ' WPM</span>';
            html += '</li>';
        });
        list.innerHTML = html;
    }

    mpRenderWords() {
        const container = document.getElementById('mpWordsDisplay');
        const startIdx = Math.max(0, this.mpManager.state.currentWordIndex - 5);
        const endIdx = Math.min(this.mpManager.state.words.length, this.mpManager.state.currentWordIndex + 20);
        let html = '';
        for (let wi = startIdx; wi < endIdx; wi++) {
            const word = this.mpManager.state.words[wi];
            html += '<span class="word' + (wi === this.mpManager.state.currentWordIndex ? ' current' : '') + '">';
            if (wi < this.mpManager.state.currentWordIndex) {
                const typedDone = this.mpManager.state.typedWords[wi] || '';
                for (let i = 0; i < word.length; i++) {
                    const ch = typedDone[i];
                    if (ch === undefined) html += '<span class="char missed">' + this.escapeHtml(word[i]) + '</span>';
                    else if (ch === word[i]) html += '<span class="char correct">' + this.escapeHtml(word[i]) + '</span>';
                    else html += '<span class="char incorrect">' + this.escapeHtml(word[i]) + '</span>';
                }
            } else if (wi === this.mpManager.state.currentWordIndex) {
                const typed = this.mpManager.state.currentInput;
                for (let j = 0; j < word.length; j++) {
                    if (j < typed.length) {
                        html += '<span class="char ' + (typed[j] === word[j] ? 'correct' : 'incorrect') + '">' + this.escapeHtml(word[j]) + '</span>';
                    } else {
                        html += '<span class="char">' + this.escapeHtml(word[j]) + '</span>';
                    }
                }
                if (typed.length > word.length) {
                    for (let k = word.length; k < typed.length; k++) html += '<span class="char extra">' + this.escapeHtml(typed[k]) + '</span>';
                }
                html += '<span class="cursor"></span>';
            } else {
                html += '<span class="char">' + this.escapeHtml(word) + '</span>';
            }
            html += '</span>';
        }
        container.innerHTML = html;
        const cur = container.querySelector('.word.current');
        if (cur) {
            const top = cur.offsetTop;
            if (top !== this.mpManager.state.lastRowTop) {
                let targetScroll = top - 48;
                if (targetScroll < 0) targetScroll = 0;
                container.scrollTop = targetScroll;
                this.mpManager.state.lastRowTop = top;
            }
        }
    }

    mpFinishResults() {
        this.audioEngine.playFinish();

        const players = this.mpManager.state.players.map(p => {
            const isYou = this.mpManager.socket && p.id === this.mpManager.socket.id;
            const currentWpm = isYou ? this.mpManager.calcWpm() : p.wpm;
            const words = isYou ? this.mpManager.state.currentWordIndex : p.progress;
            return {
                name: p.name + (isYou ? ' (YOU)' : ''),
                words: words,
                wpm: currentWpm,
                isYou: isYou
            };
        });
        players.sort((a, b) => b.wpm - a.wpm);

        const winnerName = players[0].name;
        document.getElementById('mpWinnerMsg').textContent = '🏆 ' + winnerName + ' WINS! 🏆';

        let html = '';
        players.forEach((p, i) => {
            html += '<li class="mp-player' + (p.isYou ? ' you' : ' bot') + '">';
            html += '<span class="mp-player-rank">#' + (i + 1) + '</span>';
            html += '<span class="mp-player-name">' + this.escapeHtml(p.name) + '</span>';
            html += '<div class="mp-player-bar-wrap"><div class="mp-player-bar" style="width:100%"></div></div>';
            html += '<span class="mp-player-wpm">' + p.wpm + ' WPM</span>';
            html += '</li>';
        });
        document.getElementById('mpResultsList').innerHTML = html;

        document.getElementById('mpRacing').classList.add('hidden');
        document.getElementById('mpResults').classList.remove('hidden');
    }

    mpResetUI() {
        document.getElementById('mpWaiting').classList.add('hidden');
        document.getElementById('mpRacing').classList.add('hidden');
        document.getElementById('mpResults').classList.add('hidden');
        document.getElementById('mpLobby').classList.remove('hidden');
    }

    switchView(viewId) {
        this.currentView = viewId;
        document.querySelectorAll('.view').forEach(el => {
            el.classList.toggle('active', el.id === viewId);
        });
        document.querySelectorAll('.nav-link').forEach(el => {
            el.classList.toggle('active', el.dataset.target === viewId);
        });

        if (viewId !== 'view-typing' && this.typingEngine.state.isActive) {
            this.resetTestUI();
        }
        if (viewId !== 'view-mp' && this.mpManager.state.status !== 'lobby') {
            this.mpManager.leave();
        }
        window.scrollTo(0, 0);
    }

    init() {
        document.getElementById('soundToggle').addEventListener('click', (e) => {
            const on = this.audioEngine.toggleSound();
            e.target.textContent = on ? '🔊' : '🔇';
            e.target.classList.toggle('on', on);
        });

        document.getElementById('promptOkBtn').addEventListener('click', () => this.closePrompt(true));
        document.getElementById('promptCancelBtn').addEventListener('click', () => this.closePrompt(false));
        document.getElementById('promptInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.closePrompt(true); }
            if (e.key === 'Escape') { e.preventDefault(); this.closePrompt(false); }
        });
        document.getElementById('promptTextarea').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); this.closePrompt(true); }
            if (e.key === 'Escape') { e.preventDefault(); this.closePrompt(false); }
        });

        this.buildKeyboard(document.getElementById('keyboard'));
        document.getElementById('totalKeyCount').textContent = this.keyEls.size;
        this.buildDurationButtons();

        this.typingEngine.fetchQuotes().then(() => {
            this.resetTestUI();
        });

        document.querySelectorAll('#configModifiers .config-btn').forEach(b => {
            b.addEventListener('click', () => {
                if (this.typingEngine.state.isActive) return;
                this.typingEngine.state[b.dataset.mod] = !this.typingEngine.state[b.dataset.mod];
                this.updateConfigUI();
                this.resetTestUI();
            });
        });

        document.querySelectorAll('#configModes .config-btn:not(.disabled)').forEach(b => {
            b.addEventListener('click', () => {
                if (this.typingEngine.state.isActive || b.classList.contains('disabled')) return;
                const requestedMode = b.dataset.mode;
                if (requestedMode === 'custom') {
                    this.showPrompt('Enter custom text to type:', 'textarea', '', (text) => {
                        if (!text || text.trim().length === 0) return;
                        this.typingEngine.state.customText = text.trim();
                        this.typingEngine.state.mode = requestedMode;
                        this.updateConfigUI();
                        this.buildDurationButtons();
                        this.resetTestUI();
                    });
                    return;
                }
                this.typingEngine.state.mode = requestedMode;
                this.updateConfigUI();
                this.buildDurationButtons();
                this.resetTestUI();
            });
        });

        document.getElementById('restartBtn').addEventListener('click', () => this.resetTestUI());
        document.getElementById('tryAgainBtn').addEventListener('click', () => this.resetTestUI());

        document.getElementById('mpCreateBtn').addEventListener('click', () => {
            const name = document.getElementById('mpName').value.trim();
            this.mpManager.createRoom(name);
        });
        document.getElementById('mpJoinBtn').addEventListener('click', () => {
            const name = document.getElementById('mpName').value.trim();
            const code = document.getElementById('mpCode').value.trim();
            this.mpManager.joinRoom(code, name);
        });
        document.getElementById('mpStartBtn').addEventListener('click', () => this.mpManager.startRace());
        document.getElementById('mpAddBotBtn').addEventListener('click', () => this.mpManager.addBot());
        document.getElementById('mpWaitingLeaveBtn').addEventListener('click', () => this.mpManager.leave());
        document.getElementById('mpLeaveBtn').addEventListener('click', () => this.mpManager.leave());
        document.getElementById('mpPlayAgainBtn').addEventListener('click', () => this.mpManager.leave());

        const savedName = localStorage.getItem('climaxkeys_name');
        if (savedName) document.getElementById('mpName').value = savedName;

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', () => {
            this.typingEngine.state.pressedKeys.forEach(code => this.setKeyPressed(code, false));
            this.typingEngine.state.pressedKeys.clear();
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.target);
            });
        });
        
        this.mpManager.initSocket();
        this.switchView('view-keytest');
    }
}
