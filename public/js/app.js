(function () {
            'use strict';
            
            /* ── Custom Prompt Dialog ────────────────────────── */
            var promptCallback = null;

            function showPrompt(title, type, defaultValue, callback) {
                var modal = document.getElementById('promptModal');
                var titleEl = document.getElementById('promptTitle');
                var inputEl = document.getElementById('promptInput');
                var textEl = document.getElementById('promptTextarea');
                var advancedEl = document.getElementById('promptAdvanced');
                var boxEl = document.getElementById('modalBox');
                
                titleEl.textContent = title;
                promptCallback = callback;
                
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
                
                setTimeout(function() {
                    if (type === 'textarea') {
                        textEl.focus();
                        textEl.selectionStart = textEl.selectionEnd = textEl.value.length;
                    } else {
                        inputEl.focus();
                        inputEl.select();
                    }
                }, 10);
            }

            function closePrompt(submit) {
                var modal = document.getElementById('promptModal');
                if (modal.classList.contains('hidden')) return;
                
                var inputEl = document.getElementById('promptInput');
                var textEl = document.getElementById('promptTextarea');
                var type = inputEl.classList.contains('hidden') ? 'textarea' : 'text';
                var val = type === 'textarea' ? textEl.value : inputEl.value;
                
                modal.classList.add('hidden');
                
                if (promptCallback) {
                    var cb = promptCallback;
                    promptCallback = null;
                    if (submit) cb(val);
                    else cb(null);
                }
            }

            /* ═══════════════════════════════════════════════════
               CONSTANTS
               ═══════════════════════════════════════════════════ */
            var KEYBOARD_LAYOUT = [
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

            var WORD_LIST = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "name", "home", "water", "room", "small", "found", "thought", "still", "family", "hand", "world", "school", "story", "sound", "above", "together", "group", "often", "run", "important", "until", "side", "feet", "night", "walk", "white", "sea", "four", "state", "book", "hear", "stop", "later", "idea", "enough", "eat", "face", "watch", "real", "young", "talk", "soon", "song", "mountain", "river", "city", "light", "kind", "child", "place", "right", "next", "sure", "mean", "keep", "last", "long", "both", "need", "feel", "seem", "ask", "tell", "end", "why", "area", "money", "month", "lot", "study", "word", "business", "issue", "head", "house", "service", "friend", "father", "power", "hour", "game", "line", "member", "law", "car", "community", "president", "team", "minute", "body", "information", "parent", "others", "level", "office", "door", "health", "person", "art", "war", "history", "party", "result", "change", "morning", "reason", "research", "girl", "guy", "moment", "air", "teacher", "force", "education"];
            
            var QUOTES = {
                short: [
                    "Hack the planet!",
                    "There is no spoon.",
                    "Information wants to be free.",
                    "The quietest people have the loudest minds."
                ],
                medium: [
                    "I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion.",
                    "The sky above the port was the color of television, tuned to a dead channel.",
                    "We are all connected; To each other, biologically. To the earth, chemically. To the rest of the universe atomically."
                ],
                long: [
                    "A hacker to me is someone intense about something, someone who figures things out and makes something out of it.",
                    "I am putting myself to the fullest possible use, which is all I think that any conscious entity can ever hope to do.",
                    "Cyberspace. A consensual hallucination experienced daily by billions of legitimate operators, in every nation."
                ]
            };

            var state = {
                pressedKeys: new Set(),
                testedKeys: new Set(),
                // Config
                mode: 'time',
                punctuation: false,
                numbers: false,
                timeConfig: 30,
                wordsConfig: 50,
                quoteConfig: 'medium',
                timeElapsed: 0,
                // Typing race
                duration: 30,
                timeLeft: 30,
                words: [],
                currentWordIndex: 0,
                currentInput: '',
                typedWords: [],
                wordScores: [], // {correct, total} per finalized word
                isActive: false,
                isFinished: false,
                correctChars: 0,
                totalCharsTyped: 0,
                timerInterval: null,
                // Combo / streak
                combo: 1,
                maxCombo: 1,
                streak: 0,
                maxStreak: 0,
                lastRowTop: 0
            };

            var DURATIONS = [15, 30, 60, 120];
            var RENDER_BEHIND = 15;
            var RENDER_AHEAD = 30;
            var REFILL_THRESHOLD = 40;
            var REFILL_AMOUNT = 40;

            var BOT_NAMES = ['CyberFox', 'NeonByte', 'PixelDust', 'RetroBot'];

            /* ═══════════════════════════════════════════════════
               SOUND ENGINE (Web Audio API — tiny retro beeps)
               ═══════════════════════════════════════════════════ */
            var audioCtx = null;
            var soundEnabled = false;

            function initAudio() {
                if (!audioCtx) {
                    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { }
                }
            }

            function playBeep(freq, duration, vol) {
                if (!soundEnabled || !audioCtx) return;
                var osc = audioCtx.createOscillator();
                var gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'square';
                osc.frequency.value = freq;
                gain.gain.value = vol || 0.05;
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration || 0.08));
                osc.stop(audioCtx.currentTime + (duration || 0.08));
            }

            function playKeyClick() { playBeep(800, 0.03, 0.03); }
            function playComboUp() { playBeep(1200, 0.06, 0.04); }
            function playComboBreak() { playBeep(200, 0.12, 0.04); }
            function playCountdown() { playBeep(600, 0.15, 0.05); }
            function playGo() { playBeep(1000, 0.2, 0.06); }
            function playFinish() { playBeep(440, 0.3, 0.06); setTimeout(function () { playBeep(660, 0.3, 0.06); }, 150); }

            document.getElementById('soundToggle').addEventListener('click', function () {
                initAudio();
                soundEnabled = !soundEnabled;
                this.textContent = soundEnabled ? '🔊' : '🔇';
                this.classList.toggle('on', soundEnabled);
                if (soundEnabled) playBeep(600, 0.1, 0.05);
            });

            /* ═══════════════════════════════════════════════════
               STATE
               ═══════════════════════════════════════════════════ */
            var state = {
                pressedKeys: new Set(),
                testedKeys: new Set(),
                lastKey: null,
                // Typing race
                duration: 30,
                timeLeft: 30,
                words: [],
                currentWordIndex: 0,
                currentInput: '',
                typedWords: [],
                wordScores: [], // {correct, total} per finalized word
                isActive: false,
                isFinished: false,
                correctChars: 0,
                totalCharsTyped: 0,
                timerInterval: null,
                // Combo / streak
                combo: 1,
                maxCombo: 1,
                streak: 0,
                maxStreak: 0,
            };

            var keyEls = new Map();
            var lastRowTop = null;

            /* ═══════════════════════════════════════════════════
               UTILITIES
               ═══════════════════════════════════════════════════ */
            function escapeHtml(s) {
                return String(s).replace(/[&<>"']/g, function (c) {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
                });
            }

            function keyLabelFromEvent(e) {
                if (e.code === 'Space') return '␣';
                if (e.key && e.key.length === 1) return e.key.toUpperCase();
                var special = { Enter: '⏎', Backspace: '⌫', Tab: '⇥', ShiftLeft: '⇧', ShiftRight: '⇧', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', AltLeft: 'Alt', AltRight: 'Alt', CapsLock: 'Caps', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Escape: 'Esc', MetaLeft: '⊞', MetaRight: '⊞' };
                return special[e.code] || (e.key || e.code);
            }

            function getRank(wpm) {
                if (wpm >= 120) return 'SS';
                if (wpm >= 90) return 'S';
                if (wpm >= 70) return 'A';
                if (wpm >= 50) return 'B';
                if (wpm >= 35) return 'C';
                if (wpm >= 20) return 'D';
                return 'F';
            }

            function getPB() {
                try { return parseInt(localStorage.getItem('climaxkeys_pb') || '0', 10); } catch (e) { return 0; }
            }
            function setPB(wpm) {
                try { localStorage.setItem('climaxkeys_pb', String(wpm)); } catch (e) { }
            }

            /* ═══════════════════════════════════════════════════
               KEYBOARD BUILD
               ═══════════════════════════════════════════════════ */
            function buildKeyboard(root) {
                var isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform || navigator.userAgent || '');
                var overrides = isMac ? { MetaLeft: '⌘', MetaRight: '⌘', AltLeft: 'Option', AltRight: 'Option' } : {};
                KEYBOARD_LAYOUT.forEach(function (row) {
                    var rowEl = document.createElement('div');
                    rowEl.className = 'kb-row';
                    row.forEach(function (k) {
                        var el = document.createElement('div');
                        el.className = 'kb-key' + ((k.code === 'KeyF' || k.code === 'KeyJ') ? ' home-bump' : '');
                        el.style.flexGrow = k.w;
                        el.style.flexBasis = '0';
                        el.dataset.code = k.code;
                        var span = document.createElement('span');
                        span.textContent = overrides[k.code] || k.label;
                        el.appendChild(span);
                        rowEl.appendChild(el);
                        keyEls.set(k.code, el);
                    });
                    root.appendChild(rowEl);
                });
            }

            function setKeyPressed(code, pressed) {
                var el = keyEls.get(code);
                if (!el) return;
                el.classList.toggle('pressed', pressed);
                if (pressed) el.classList.add('tested');
            }

            function updateLastKeyDisplay() {
                document.getElementById('lastKeyBox').textContent = state.lastKey.label;
                document.getElementById('lastKeyCode').textContent = state.lastKey.code;
            }

            function updateTestedCount() {
                document.getElementById('testedCount').textContent = state.testedKeys.size;
            }

            /* ═══════════════════════════════════════════════════
               TYPING RACE — WORD GENERATION & RENDERING
               ═══════════════════════════════════════════════════ */
            function generateWords(count) {
                var out = [];
                var puncList = [',', '.', '?', '!', ';', ':', '"', "'", '()'];
                for (var i = 0; i < count; i++) {
                    var w = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
                    if (state.numbers && Math.random() < 0.2) {
                        w = Math.floor(Math.random() * 100).toString();
                    }
                    if (state.punctuation && Math.random() < 0.3) {
                        var p = puncList[Math.floor(Math.random() * puncList.length)];
                        if (p === '()') w = '(' + w + ')';
                        else if (p === '"') w = '"' + w + '"';
                        else if (p === "'") w = "'" + w + "'";
                        else w = w + p;
                    }
                    out.push(w);
                }
                if (state.punctuation && out.length > 0) {
                    out[0] = out[0].charAt(0).toUpperCase() + out[0].slice(1);
                }
                return out;
            }

            function ensureEnoughWords() {
                if (state.mode === 'words' || state.mode === 'quote' || state.mode === 'zen' || state.mode === 'custom') return;
                if (state.words.length - state.currentWordIndex < REFILL_THRESHOLD) {
                    state.words = state.words.concat(generateWords(REFILL_AMOUNT));
                }
            }

            function renderTypingArea() {
                var container = document.getElementById('wordsDisplay');
                var startIdx = Math.max(0, state.currentWordIndex - RENDER_BEHIND);
                var endIdx = Math.min(state.words.length, state.currentWordIndex + RENDER_AHEAD);
                var html = '';
                for (var wi = startIdx; wi < endIdx; wi++) {
                    var word = state.words[wi];
                    html += '<span class="word' + (wi === state.currentWordIndex ? ' current' : '') + '">';
                    if (wi < state.currentWordIndex) {
                        var typedDone = state.typedWords[wi] || '';
                        var len = Math.max(word.length, typedDone.length);
                        for (var i = 0; i < len; i++) {
                            var t = word[i], y = typedDone[i];
                            if (y === undefined) html += '<span class="char missed">' + escapeHtml(t) + '</span>';
                            else if (t === undefined) html += '<span class="char extra">' + escapeHtml(y) + '</span>';
                            else if (y === t) html += '<span class="char correct">' + escapeHtml(t) + '</span>';
                            else html += '<span class="char incorrect">' + escapeHtml(t) + '</span>';
                        }
                    } else if (wi === state.currentWordIndex) {
                        var typed = state.currentInput;
                        for (var j = 0; j < word.length; j++) {
                            if (j < typed.length) {
                                html += '<span class="char ' + (typed[j] === word[j] ? 'correct' : 'incorrect') + '">' + escapeHtml(word[j]) + '</span>';
                            } else {
                                html += '<span class="char">' + escapeHtml(word[j]) + '</span>';
                            }
                        }
                        if (typed.length > word.length) {
                            for (var k = word.length; k < typed.length; k++) html += '<span class="char extra">' + escapeHtml(typed[k]) + '</span>';
                        }
                        html += '<span class="cursor"></span>';
                    } else {
                        html += '<span class="char">' + escapeHtml(word) + '</span>';
                    }
                    html += '</span>';
                }
                container.innerHTML = html;
                var currentEl = container.querySelector('.word.current');
                if (currentEl) {
                    var top = currentEl.offsetTop;
                    if (top !== state.lastRowTop) {
                        var targetScroll = top - 48;
                        if (targetScroll < 0) targetScroll = 0;
                        container.scrollTop = targetScroll;
                        state.lastRowTop = top;
                    }
                }
            }

            function updateStatsDisplay() {
                if (state.mode === 'time') {
                    document.getElementById('statTime').textContent = state.timeLeft;
                } else {
                    document.getElementById('statTime').textContent = state.timeElapsed;
                }
                
                var elapsed = state.mode === 'time' ? (state.timeConfig - state.timeLeft) : state.timeElapsed;
                var wpm = elapsed > 0 ? Math.round((state.correctChars / 5) / (elapsed / 60)) : 0;
                document.getElementById('statWpm').textContent = wpm;
                var acc = state.totalCharsTyped > 0 ? Math.round((state.correctChars / state.totalCharsTyped) * 100) : 100;
                document.getElementById('statAcc').textContent = acc + '%';
            }

            function updateComboDisplay() {
                var el = document.getElementById('comboVal');
                el.textContent = '×' + state.combo;
                var parent = el.closest('.combo-display');
                parent.classList.remove('fire', 'blazing');
                if (state.combo >= 10) parent.classList.add('blazing');
                else if (state.combo >= 5) parent.classList.add('fire');
                // Pop animation
                el.classList.remove('combo-pop');
                void el.offsetWidth; // trigger reflow
                el.classList.add('combo-pop');
            }

            function updateStreakDisplay() {
                document.getElementById('streakVal').textContent = state.streak;
            }

            function updatePBDisplay() {
                var pb = getPB();
                document.getElementById('pbVal').textContent = pb > 0 ? pb : '--';
            }



            /* ═══════════════════════════════════════════════════
               TYPING RACE — LOGIC
               ═══════════════════════════════════════════════════ */
            function startTest() {
                state.isActive = true;
                state.timerInterval = setInterval(tick, 1000);
            }

            function tick() {
                if (state.mode === 'time') {
                    state.timeLeft -= 1;
                    updateStatsDisplay();
                    if (state.timeLeft <= 0) finishTest();
                } else {
                    state.timeElapsed += 1;
                    updateStatsDisplay();
                }
            }

            function scoreWord(target, typed) {
                var correct = 0;
                var len = Math.max(target.length, typed.length);
                for (var i = 0; i < Math.min(target.length, typed.length); i++) if (target[i] === typed[i]) correct++;
                return { correct: correct, total: len };
            }

            function finalizeCurrentWord() {
                var target = state.words[state.currentWordIndex];
                var s = scoreWord(target, state.currentInput);
                state.correctChars += s.correct;
                state.totalCharsTyped += s.total;
                state.typedWords[state.currentWordIndex] = state.currentInput;
                state.wordScores[state.currentWordIndex] = s;

                // Combo & streak: perfect word = all chars correct AND same length
                var perfect = (state.currentInput === target);
                if (perfect) {
                    state.combo++;
                    state.streak++;
                    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
                    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
                    playComboUp();
                } else {
                    if (state.combo > 1) playComboBreak();
                    state.combo = 1;
                    state.streak = 0;
                }

                state.currentWordIndex++;
                state.currentInput = '';
                
                if (state.mode === 'words' && state.currentWordIndex >= state.wordsConfig) {
                    finishTest();
                    return;
                }
                
                ensureEnoughWords();
                renderTypingArea();
                updateStatsDisplay();
                updateComboDisplay();
                updateStreakDisplay();
            }

            function unfinalizeLastWord() {
                // Go back to the previous word
                if (state.currentWordIndex <= 0) return;
                state.currentWordIndex--;
                var prevScore = state.wordScores[state.currentWordIndex];
                if (prevScore) {
                    state.correctChars -= prevScore.correct;
                    state.totalCharsTyped -= prevScore.total;
                }
                state.currentInput = state.typedWords[state.currentWordIndex] || '';
                state.typedWords[state.currentWordIndex] = undefined;
                state.wordScores[state.currentWordIndex] = undefined;
                // Reset combo on going back
                state.combo = 1;
                state.streak = 0;
                renderTypingArea();
                updateStatsDisplay();
                updateComboDisplay();
                updateStreakDisplay();
            }

            function finishTest() {
                clearInterval(state.timerInterval);
                state.isActive = false;
                state.isFinished = true;
                playFinish();

                var rawWpm = state.timeElapsed > 0 ? ((state.totalCharsTyped / 5) / (state.timeElapsed / 60)) : 0;
                var netWpm = state.timeElapsed > 0 ? ((state.correctChars / 5) / (state.timeElapsed / 60)) : 0;
                var acc = state.totalCharsTyped > 0 ? (state.correctChars / state.totalCharsTyped) * 100 : 0;
                var rank = getRank(netWpm);

                document.getElementById('resWpm').textContent = Math.round(netWpm);
                document.getElementById('resRaw').textContent = Math.round(rawWpm);
                document.getElementById('resAcc').textContent = acc.toFixed(1) + '%';
                document.getElementById('resTime').textContent = state.timeElapsed + 's';
                document.getElementById('resRank').className = 'rank-badge rank-' + rank.replace(/\+/g, '');
                document.getElementById('resRank').textContent = rank;

                var modeKey = state.mode;
                if (state.mode === 'words') modeKey += '_' + state.wordsConfig;
                else if (state.mode === 'time') modeKey += '_' + state.timeConfig;
                else if (state.mode === 'quote') modeKey += '_' + state.quoteConfig;

                var pbKey = 'pb_' + modeKey;
                var currentPb = localStorage.getItem(pbKey) || 0;
                var msg = document.getElementById('resMsg');
                if (Math.round(netWpm) > currentPb) {
                    localStorage.setItem(pbKey, Math.round(netWpm));
                    msg.innerHTML = '<div class="new-record">★ NEW PERSONAL BEST! ★</div>';
                } else {
                    msg.innerHTML = '';
                }
                updatePBDisplay();
                
                // Submit score to Postgres DB
                var username = localStorage.getItem('climaxkeys_name') || 'Guest_' + Math.floor(Math.random() * 1000);
                fetch('/api/scores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: username,
                        mode: state.mode,
                        wpm: Math.round(netWpm),
                        accuracy: parseFloat(acc.toFixed(1))
                    })
                }).then(function(res) {
                    return res.json();
                }).then(function(data) {
                    console.log('Score saved to database', data);
                    // Fetch top scores
                    return fetch('/api/scores/top?mode=' + state.mode);
                }).then(function(res) {
                    return res.json();
                }).then(function(topScores) {
                    var html = '<h4>Global Leaderboard (' + state.mode + ')</h4><ol style="text-align:left; font-family: var(--font-terminal); color: var(--text-dim);">';
                    topScores.forEach(function(s) {
                        html += '<li><strong style="color:var(--text)">' + s.username + '</strong> - ' + s.wpm + ' WPM (' + s.accuracy + '%)</li>';
                    });
                    html += '</ol>';
                    var div = document.getElementById('leaderboardDisplay');
                    if (!div) {
                        div = document.createElement('div');
                        div.id = 'leaderboardDisplay';
                        div.style.marginTop = '20px';
                        document.querySelector('.results-stats').after(div);
                    }
                    div.innerHTML = html;
                }).catch(function(err) {
                    console.error('Error with database:', err);
                });

                document.getElementById('wordsDisplay').classList.add('hidden');
                document.getElementById('typingStats').classList.add('hidden');
                document.getElementById('gameBar').classList.add('hidden');
                document.getElementById('resultsPanel').classList.remove('hidden');
            }

            function showResults() {
                var duration = state.mode === 'time' ? state.timeConfig : (state.timeElapsed || 1);
                var wpm = Math.round((state.correctChars / 5) / (duration / 60));
                var acc = state.totalCharsTyped > 0 ? Math.round((state.correctChars / state.totalCharsTyped) * 100) : 100;
                document.getElementById('resultsWpm').textContent = wpm;
                document.getElementById('resultsAcc').textContent = acc + '%';
                document.getElementById('resultsChars').textContent = state.totalCharsTyped;
                document.getElementById('resultsStreak').textContent = state.maxStreak;
                document.getElementById('resultsCombo').textContent = '×' + state.maxCombo;

                // Rank
                var rank = getRank(wpm);
                document.getElementById('rankBadge').innerHTML = '<div class="rank-badge rank-' + rank + '">' + rank + '</div>';

                // Personal best
                var pb = getPB();
                var msg = document.getElementById('newRecordMsg');
                if (wpm > pb && wpm > 0) {
                    setPB(wpm);
                    msg.innerHTML = '<div class="new-record">★ NEW PERSONAL BEST! ★</div>';
                } else {
                    msg.innerHTML = '';
                }
                updatePBDisplay();

                document.getElementById('wordsDisplay').classList.add('hidden');
                document.getElementById('typingStats').classList.add('hidden');
                document.getElementById('gameBar').classList.add('hidden');
                document.getElementById('resultsPanel').classList.remove('hidden');
            }

            function resetTest() {
                clearInterval(state.timerInterval);
                if (state.mode === 'custom') {
                    state.words = state.customText ? state.customText.split(/\s+/) : ['custom', 'text', 'missing'];
                } else if (state.mode === 'quote') {
                    var list = QUOTES[state.quoteConfig || 'medium'];
                    var quote = list[Math.floor(Math.random() * list.length)];
                    state.words = quote.split(/\s+/);
                } else if (state.mode === 'zen') {
                    state.words = [];
                } else {
                    var wordCount = state.mode === 'words' ? state.wordsConfig : 60;
                    state.words = generateWords(wordCount);
                }
                state.currentWordIndex = 0;
                state.currentInput = '';
                state.typedWords = [];
                state.wordScores = [];
                state.isActive = false;
                state.isFinished = false;
                state.timeLeft = state.timeConfig;
                state.timeElapsed = 0;
                state.correctChars = 0;
                state.totalCharsTyped = 0;
                state.combo = 1;
                state.maxCombo = 1;
                state.streak = 0;
                state.maxStreak = 0;
                state.lastRowTop = 0;

                document.getElementById('wordsDisplay').classList.remove('hidden');
                document.getElementById('typingStats').classList.remove('hidden');
                document.getElementById('gameBar').classList.remove('hidden');
                document.getElementById('resultsPanel').classList.add('hidden');

                buildDurationButtons();
                updateStatsDisplay();
                updateComboDisplay();
                updateStreakDisplay();
                updatePBDisplay();
                renderTypingArea();

                // Reset scroll position
                document.getElementById('wordsDisplay').scrollTop = 0;
                window.scrollTo(0, 0);
            }

            function buildDurationButtons() {
                var row = document.getElementById('durationRow');
                row.innerHTML = '';
                
                if (state.mode === 'custom') {
                    var changeBtn = document.createElement('button');
                    changeBtn.className = 'config-btn active';
                    changeBtn.textContent = 'Change Text';
                    changeBtn.addEventListener('click', function() {
                        if (state.isActive) return;
                        showPrompt("Enter custom text:", "textarea", state.customText, function(text) {
                            if (text && text.trim()) {
                                state.customText = text.trim();
                                resetTest();
                            }
                        });
                    });
                    row.appendChild(changeBtn);
                    
                    var slbl = document.querySelector('#statTime').nextElementSibling;
                    if (slbl) slbl.textContent = 'time (s)';
                    return;
                }
                
                if (state.mode === 'quote') {
                    var quoteOptions = ['short', 'medium', 'long'];
                    var currentQuote = state.quoteConfig || 'medium';
                    quoteOptions.forEach(function (d) {
                        var btn = document.createElement('button');
                        btn.className = 'config-btn' + (d === currentQuote ? ' active' : '');
                        btn.textContent = d;
                        btn.addEventListener('click', function () {
                            if (state.isActive) return;
                            state.quoteConfig = d;
                            buildDurationButtons();
                            resetTest();
                        });
                        row.appendChild(btn);
                    });
                    var slbl = document.querySelector('#statTime').nextElementSibling;
                    if (slbl) slbl.textContent = 'time (s)';
                    return;
                }
                
                if (state.mode === 'zen') {
                    var stopBtn = document.createElement('button');
                    stopBtn.className = 'config-btn icon-only active';
                    stopBtn.title = 'Stop Zen session';
                    stopBtn.innerHTML = '<span class="icon">🛑</span> STOP';
                    stopBtn.addEventListener('click', function () {
                        if (state.isActive) finishTest();
                    });
                    row.appendChild(stopBtn);
                    var slbl = document.querySelector('#statTime').nextElementSibling;
                    if (slbl) slbl.textContent = 'time (s)';
                    return;
                }
                
                var options = state.mode === 'time' ? [15, 30, 60, 120] : [10, 25, 50, 100];
                var currentVal = state.mode === 'time' ? state.timeConfig : state.wordsConfig;
                
                var hasCurrentVal = false;
                
                options.forEach(function (d) {
                    if (d === currentVal) hasCurrentVal = true;
                    var btn = document.createElement('button');
                    btn.className = 'config-btn' + (d === currentVal ? ' active' : '');
                    btn.textContent = String(d);
                    btn.dataset.duration = String(d);
                    btn.addEventListener('click', function () {
                        if (state.isActive) return;
                        if (state.mode === 'time') {
                            state.timeConfig = d;
                            state.timeLeft = d;
                        } else {
                            state.wordsConfig = d;
                        }
                        buildDurationButtons();
                        resetTest();
                    });
                    row.appendChild(btn);
                });
                
                if (!hasCurrentVal && currentVal > 0) {
                    var cBtn = document.createElement('button');
                    cBtn.className = 'config-btn active';
                    cBtn.textContent = String(currentVal);
                    cBtn.addEventListener('click', function () {
                        if (state.isActive) return;
                        if (state.mode === 'time') {
                            state.timeConfig = currentVal;
                            state.timeLeft = currentVal;
                        } else {
                            state.wordsConfig = currentVal;
                        }
                        buildDurationButtons();
                        resetTest();
                    });
                    row.appendChild(cBtn);
                }

                var customBtn = document.createElement('button');
                customBtn.className = 'config-btn icon-only';
                customBtn.title = 'Custom amount';
                customBtn.innerHTML = '<span class="icon">🛠</span>';
                customBtn.addEventListener('click', function () {
                    if (state.isActive) return;
                    var promptMsg = state.mode === 'time' ? 'Enter custom time (seconds):' : 'Enter custom word count:';
                    showPrompt(promptMsg, "text", "", function(val) {
                        if (val) {
                            var parsed = parseInt(val, 10);
                            if (!isNaN(parsed) && parsed > 0) {
                                if (state.mode === 'time') {
                                    state.timeConfig = parsed;
                                    state.timeLeft = parsed;
                                } else {
                                    state.wordsConfig = parsed;
                                }
                                buildDurationButtons();
                                resetTest();
                            }
                        }
                    });
                });
                row.appendChild(customBtn);
                
                var statLabelEl = document.querySelector('#statTime').nextElementSibling;
                if (statLabelEl) {
                    statLabelEl.textContent = state.mode === 'time' ? 'seconds' : 'time (s)';
                }
            }

            function updateConfigUI() {
                document.querySelectorAll('#configModifiers .config-btn').forEach(function(b) {
                    if (state[b.dataset.mod]) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
                document.querySelectorAll('#configModes .config-btn').forEach(function(b) {
                    if (b.dataset.mode === state.mode) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
                
                var modGroup = document.getElementById('configModifiers');
                if (state.mode === 'quote' || state.mode === 'zen' || state.mode === 'custom') {
                    modGroup.style.display = 'none';
                } else {
                    modGroup.style.display = 'flex';
                }
            }

            /* ═══════════════════════════════════════════════════
               KEY HANDLER
               ═══════════════════════════════════════════════════ */
            function isTypingFocused() {
                return currentView === 'view-typing';
            }

            function isMpFocused() {
                return mpState.status === 'racing';
            }

            function handleKeyDown(e) {
                // Don't capture keys when typing in inputs
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                var modal = document.getElementById('promptModal');
                if (modal && !modal.classList.contains('hidden')) return;

                state.pressedKeys.add(e.code);
                state.testedKeys.add(e.code);
                state.lastKey = { code: e.code, label: keyLabelFromEvent(e) };
                setKeyPressed(e.code, true);
                updateLastKeyDisplay();
                updateTestedCount();
                playKeyClick();

                if (e.ctrlKey || e.metaKey || e.altKey) return;

                // Multiplayer racing handles its own input
                if (isMpFocused()) {
                    handleMpKeyDown(e);
                    return;
                }

                if (state.isFinished) {
                    if (e.code === 'Space') e.preventDefault();
                    return;
                }

                if (e.code === 'Tab') { e.preventDefault(); return; }

                if (e.code === 'Backspace') {
                    e.preventDefault();
                    if (!isTypingFocused()) return;
                    if (state.currentInput.length > 0) {
                        state.currentInput = state.currentInput.slice(0, -1);
                        renderTypingArea();
                    } else if (state.isActive && state.currentWordIndex > 0) {
                        // Go back to previous word
                        unfinalizeLastWord();
                    }
                    return;
                }

                if (e.code === 'Space') {
                    e.preventDefault();
                    if (e.repeat) return;
                    if (!isTypingFocused()) return;

                    if (!state.isActive) {
                        startTest();
                    }

                    if (state.mode === 'zen') {
                        if (state.currentInput.length > 0) {
                            state.words[state.currentWordIndex] = state.currentInput;
                            state.typedWords[state.currentWordIndex] = state.currentInput;
                            state.correctChars += state.currentInput.length + 1; // plus space
                            state.totalCharsTyped += state.currentInput.length + 1;
                            state.currentWordIndex++;
                            state.currentInput = '';
                            renderTypingArea();
                            updateStatsDisplay();
                        }
                        return;
                    }

                    if (state.isActive) finalizeCurrentWord();
                    return;
                }

                if (e.repeat) return;

                if (e.key && e.key.length === 1) {
                    e.preventDefault();
                    if (!isTypingFocused()) return;

                    if (!state.isActive) {
                        startTest();
                    }

                    if (state.isActive) {
                        state.currentInput += e.key;
                        
                        if (state.mode === 'zen') {
                            if (state.currentWordIndex >= state.words.length) {
                                state.words.push(state.currentInput);
                            } else {
                                state.words[state.currentWordIndex] = state.currentInput;
                            }
                        } else {
                            var target = state.words[state.currentWordIndex];
                            if ((state.mode === 'words' || state.mode === 'quote' || state.mode === 'custom') && state.currentWordIndex === state.words.length - 1) {
                                if (state.currentInput === target) {
                                    finalizeCurrentWord();
                                    return;
                                }
                            }
                        }
                        
                        renderTypingArea();
                    }
                }
            }

            function handleKeyUp(e) {
                state.pressedKeys.delete(e.code);
                setKeyPressed(e.code, false);
            }

            /* ═══════════════════════════════════════════════════
               MULTIPLAYER — SOCKET.IO
               ═══════════════════════════════════════════════════ */
            var mpState = {
                status: 'lobby',
                duration: 30, // Default 30s
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

            var socket = null;
            if (typeof io !== 'undefined') {
                initSocket();
            } else {
                // Add socket.io script dynamically to head if not present
                var s = document.createElement('script');
                s.src = "/socket.io/socket.io.js";
                s.onload = initSocket;
                document.head.appendChild(s);
            }

            function initSocket() {
                socket = io();

                socket.on('room_state', function (data) {
                    mpState.roomCode = data.code;
                    mpState.status = data.status;
                    mpState.isHost = (data.host === socket.id);
                    mpState.players = data.players;

                    if (mpState.status === 'waiting') {
                        document.getElementById('mpLobby').classList.add('hidden');
                        document.getElementById('mpRacing').classList.add('hidden');
                        document.getElementById('mpResults').classList.add('hidden');
                        document.getElementById('mpWaiting').classList.remove('hidden');

                        document.getElementById('mpWaitingCode').textContent = data.code;
                        document.getElementById('mpHostControls').classList.toggle('hidden', !mpState.isHost);

                        var html = '';
                        data.players.forEach(function (p, i) {
                            html += '<li class="mp-player">';
                            html += '<span class="mp-player-name">' + escapeHtml(p.name) + (p.id === socket.id ? ' (YOU)' : '') + (p.id === data.host ? ' 👑' : '') + '</span>';
                            html += '</li>';
                        });
                        document.getElementById('mpWaitingPlayers').innerHTML = html;
                    }
                });

                socket.on('countdown', function (count) {
                    document.getElementById('mpWaiting').classList.add('hidden');
                    document.getElementById('mpRacing').classList.remove('hidden');
                    document.getElementById('mpRoomCode').textContent = mpState.roomCode;
                    document.getElementById('mpCountdownMsg').textContent = 'Starting in ' + count + '...';

                    if (count === 3 && !mpState.isActive) {
                        mpState.words = mpGenerateWords(120);
                        mpState.currentWordIndex = 0;
                        mpState.currentInput = '';
                        mpState.typedWords = [];
                        mpState.correctChars = 0;
                        mpState.totalCharsTyped = 0;
                        mpState.timeLeft = mpState.duration;
                        document.getElementById('mpTimeLeft').textContent = mpState.timeLeft;
                        mpRenderPlayers();
                        mpRenderWords();
                    }
                });

                socket.on('race_started', function () {
                    document.getElementById('mpCountdownMsg').textContent = 'RACE!';
                    setTimeout(function () { document.getElementById('mpCountdownMsg').textContent = ''; }, 1000);

                    mpState.status = 'racing';
                    mpState.isActive = true;
                    mpState.timeLeft = mpState.duration;
                    clearInterval(mpState.timerInterval);
                    mpState.timerInterval = setInterval(mpTick, 1000);
                    document.getElementById('mpWordsDisplay').focus();
                });

                socket.on('player_update', function (data) {
                    var p = mpState.players.find(function (x) { return x.id === data.id; });
                    if (p) {
                        p.progress = data.progress;
                        p.wpm = data.wpm;
                        if (mpState.status === 'racing') mpRenderPlayers();
                    }
                });
            }

            function mpGenerateWords(count) {
                var out = [];
                for (var i = 0; i < count; i++) out.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
                return out;
            }

            function mpCreateRoom() {
                var name = document.getElementById('mpName').value.trim() || 'Player';
                localStorage.setItem('climaxkeys_name', name);
                if (socket) socket.emit('join_room', { create: true, name: name }, function (res) {
                    if (res.error) alert(res.error);
                });
            }

            function mpJoinRoom() {
                var name = document.getElementById('mpName').value.trim() || 'Player';
                var code = document.getElementById('mpCode').value.trim();
                if (!code) return alert('Enter a room code');
                localStorage.setItem('climaxkeys_name', name);
                if (socket) socket.emit('join_room', { create: false, code: code, name: name }, function (res) {
                    if (res.error) alert(res.error);
                });
            }

            function mpStartRace() {
                if (socket && mpState.isHost) {
                    socket.emit('start_race', mpState.roomCode);
                }
            }

            function mpTick() {
                mpState.timeLeft--;
                document.getElementById('mpTimeLeft').textContent = mpState.timeLeft;

                if (socket) {
                    socket.emit('update_progress', {
                        code: mpState.roomCode,
                        progress: mpState.currentWordIndex,
                        wpm: calcMpWpm()
                    });
                }

                mpRenderPlayers();
                if (mpState.timeLeft <= 0) mpFinish();
            }

            function mpRenderPlayers() {
                var list = document.getElementById('mpPlayerList');
                var maxWords = Math.max(mpState.currentWordIndex, 1);
                mpState.players.forEach(function (b) { if (b.progress > maxWords) maxWords = b.progress; });
                maxWords = Math.max(maxWords, 1);

                var players = mpState.players.map(function (p) {
                    var isYou = socket && p.id === socket.id;
                    var currentWpm = isYou ? calcMpWpm() : p.wpm;
                    var words = isYou ? mpState.currentWordIndex : p.progress;
                    return {
                        name: p.name + (isYou ? ' (YOU)' : ''),
                        words: words,
                        wpm: currentWpm,
                        isYou: isYou
                    };
                });

                // Sort by words typed
                players.sort(function (a, b) { return b.words - a.words; });

                var html = '';
                players.forEach(function (p, i) {
                    var pct = Math.min(100, (p.words / maxWords) * 100);
                    html += '<li class="mp-player' + (p.isYou ? ' you' : ' bot') + '">';
                    html += '<span class="mp-player-rank">#' + (i + 1) + '</span>';
                    html += '<span class="mp-player-name">' + escapeHtml(p.name) + '</span>';
                    html += '<div class="mp-player-bar-wrap"><div class="mp-player-bar" style="width:' + pct + '%"></div></div>';
                    html += '<span class="mp-player-wpm">' + p.wpm + ' WPM</span>';
                    html += '</li>';
                });
                list.innerHTML = html;
            }

            function calcMpWpm() {
                var elapsed = mpState.duration - mpState.timeLeft;
                return elapsed > 0 ? Math.round((mpState.correctChars / 5) / (elapsed / 60)) : 0;
            }

            function mpRenderWords() {
                var container = document.getElementById('mpWordsDisplay');
                var startIdx = Math.max(0, mpState.currentWordIndex - 5);
                var endIdx = Math.min(mpState.words.length, mpState.currentWordIndex + 20);
                var html = '';
                for (var wi = startIdx; wi < endIdx; wi++) {
                    var word = mpState.words[wi];
                    html += '<span class="word' + (wi === mpState.currentWordIndex ? ' current' : '') + '">';
                    if (wi < mpState.currentWordIndex) {
                        var typedDone = mpState.typedWords[wi] || '';
                        for (var i = 0; i < word.length; i++) {
                            var ch = typedDone[i];
                            if (ch === undefined) html += '<span class="char missed">' + escapeHtml(word[i]) + '</span>';
                            else if (ch === word[i]) html += '<span class="char correct">' + escapeHtml(word[i]) + '</span>';
                            else html += '<span class="char incorrect">' + escapeHtml(word[i]) + '</span>';
                        }
                    } else if (wi === mpState.currentWordIndex) {
                        var typed = mpState.currentInput;
                        for (var j = 0; j < word.length; j++) {
                            if (j < typed.length) {
                                html += '<span class="char ' + (typed[j] === word[j] ? 'correct' : 'incorrect') + '">' + escapeHtml(word[j]) + '</span>';
                            } else {
                                html += '<span class="char">' + escapeHtml(word[j]) + '</span>';
                            }
                        }
                        if (typed.length > word.length) {
                            for (var k = word.length; k < typed.length; k++) html += '<span class="char extra">' + escapeHtml(typed[k]) + '</span>';
                        }
                        html += '<span class="cursor"></span>';
                    } else {
                        html += '<span class="char">' + escapeHtml(word) + '</span>';
                    }
                    html += '</span>';
                }
                container.innerHTML = html;
                var cur = container.querySelector('.word.current');
                if (cur) {
                    var top = cur.offsetTop;
                    if (top !== mpState.lastRowTop) {
                        var targetScroll = top - 48;
                        if (targetScroll < 0) targetScroll = 0;
                        container.scrollTop = targetScroll;
                        mpState.lastRowTop = top;
                    }
                }
            }

            function handleMpKeyDown(e) {
                if (e.ctrlKey || e.metaKey || e.altKey) return;
                if (mpState.status !== 'racing' || !mpState.isActive) return;
                if (e.target.tagName === 'INPUT') return;

                if (e.code === 'Tab') { e.preventDefault(); return; }

                if (e.code === 'Backspace') {
                    e.preventDefault();
                    if (mpState.currentInput.length > 0) {
                        mpState.currentInput = mpState.currentInput.slice(0, -1);
                        mpRenderWords();
                    }
                    return;
                }

                if (e.code === 'Space') {
                    e.preventDefault();
                    if (e.repeat) return;
                    // Finalize word
                    var target = mpState.words[mpState.currentWordIndex];
                    var s = scoreWord(target, mpState.currentInput);
                    mpState.correctChars += s.correct;
                    mpState.totalCharsTyped += s.total;
                    mpState.typedWords[mpState.currentWordIndex] = mpState.currentInput;
                    mpState.currentWordIndex++;
                    mpState.currentInput = '';
                    mpRenderWords();
                    mpRenderPlayers();
                    if (socket) {
                        socket.emit('update_progress', {
                            code: mpState.roomCode,
                            progress: mpState.currentWordIndex,
                            wpm: calcMpWpm()
                        });
                    }
                    return;
                }

                if (e.repeat) return;
                if (e.key && e.key.length === 1) {
                    e.preventDefault();
                    mpState.currentInput += e.key;
                    mpRenderWords();
                }
            }

            function mpFinish() {
                clearInterval(mpState.timerInterval);
                mpState.status = 'finished';
                mpState.isActive = false;
                playFinish();

                // Build final results
                var players = mpState.players.map(function (p) {
                    var isYou = socket && p.id === socket.id;
                    var currentWpm = isYou ? calcMpWpm() : p.wpm;
                    var words = isYou ? mpState.currentWordIndex : p.progress;
                    return {
                        name: p.name + (isYou ? ' (YOU)' : ''),
                        words: words,
                        wpm: currentWpm,
                        isYou: isYou
                    };
                });
                players.sort(function (a, b) { return b.wpm - a.wpm; });

                var winnerName = players[0].name;
                document.getElementById('mpWinnerMsg').textContent = '🏆 ' + winnerName + ' WINS! 🏆';

                var html = '';
                players.forEach(function (p, i) {
                    html += '<li class="mp-player' + (p.isYou ? ' you' : ' bot') + '">';
                    html += '<span class="mp-player-rank">#' + (i + 1) + '</span>';
                    html += '<span class="mp-player-name">' + escapeHtml(p.name) + '</span>';
                    html += '<div class="mp-player-bar-wrap"><div class="mp-player-bar" style="width:100%"></div></div>';
                    html += '<span class="mp-player-wpm">' + p.wpm + ' WPM</span>';
                    html += '</li>';
                });
                document.getElementById('mpResultsList').innerHTML = html;

                document.getElementById('mpRacing').classList.add('hidden');
                document.getElementById('mpResults').classList.remove('hidden');
            }

            function mpLeave() {
                if (socket) {
                    socket.disconnect();
                    socket.connect();
                }
                mpReset();
            }

            function mpReset() {
                clearInterval(mpState.timerInterval);
                mpState.status = 'lobby';
                mpState.isActive = false;
                document.getElementById('mpWaiting').classList.add('hidden');
                document.getElementById('mpRacing').classList.add('hidden');
                document.getElementById('mpResults').classList.add('hidden');
                document.getElementById('mpLobby').classList.remove('hidden');
            }

            /* ═══════════════════════════════════════════════════
               VIEW ROUTING
               ═══════════════════════════════════════════════════ */
            var currentView = 'view-keytest';

            function switchView(viewId) {
                currentView = viewId;
                document.querySelectorAll('.view').forEach(function (el) {
                    el.classList.toggle('active', el.id === viewId);
                });
                document.querySelectorAll('.nav-link').forEach(function (el) {
                    el.classList.toggle('active', el.dataset.target === viewId);
                });

                // If switching away from typing race, reset it if it's active
                if (viewId !== 'view-typing' && state.isActive) {
                    resetTest();
                }
                // If switching away from MP, reset lobby
                if (viewId !== 'view-mp' && mpState.status !== 'lobby') {
                    mpReset();
                }
                window.scrollTo(0, 0);
            }

            /* ═══════════════════════════════════════════════════
               INIT
               ═══════════════════════════════════════════════════ */
            function init() {
                // Modal Listeners
                document.getElementById('promptOkBtn').addEventListener('click', function() { closePrompt(true); });
                document.getElementById('promptCancelBtn').addEventListener('click', function() { closePrompt(false); });
                document.getElementById('promptInput').addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') { e.preventDefault(); closePrompt(true); }
                    if (e.key === 'Escape') { e.preventDefault(); closePrompt(false); }
                });
                document.getElementById('promptTextarea').addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); closePrompt(true); }
                    if (e.key === 'Escape') { e.preventDefault(); closePrompt(false); }
                });

                buildKeyboard(document.getElementById('keyboard'));
                document.getElementById('totalKeyCount').textContent = keyEls.size;
                buildDurationButtons();

                state.words = generateWords(60);
                renderTypingArea();
                updateStatsDisplay();
                updatePBDisplay();
                updateComboDisplay();
                updateStreakDisplay();

                // Config buttons listeners
                document.querySelectorAll('#configModifiers .config-btn').forEach(function(b) {
                    b.addEventListener('click', function() {
                        if (state.isActive) return;
                        state[this.dataset.mod] = !state[this.dataset.mod];
                        updateConfigUI();
                        resetTest();
                    });
                });
                document.querySelectorAll('#configModes .config-btn:not(.disabled)').forEach(function(b) {
                    b.addEventListener('click', function() {
                        if (state.isActive || b.classList.contains('disabled')) return;
                        
                        var requestedMode = this.dataset.mode;
                        if (requestedMode === 'custom') {
                            showPrompt('Enter custom text to type:', 'textarea', '', function(text) {
                                if (!text || text.trim().length === 0) {
                                    return; // Cancelled
                                }
                                state.customText = text.trim();
                                state.mode = requestedMode;
                                updateConfigUI();
                                buildDurationButtons();
                                resetTest();
                            });
                            return; // callback handles the rest
                        }
                        
                        state.mode = requestedMode;
                        updateConfigUI();
                        buildDurationButtons();
                        resetTest();
                    });
                });

                document.getElementById('restartBtn').addEventListener('click', resetTest);
                document.getElementById('tryAgainBtn').addEventListener('click', resetTest);

                // Add listeners for multiplayer buttons
                document.getElementById('mpCreateBtn').addEventListener('click', mpCreateRoom);
                document.getElementById('mpJoinBtn').addEventListener('click', mpJoinRoom);
                document.getElementById('mpStartBtn').addEventListener('click', mpStartRace);
                document.getElementById('mpAddBotBtn').addEventListener('click', function () {
                    if (socket && mpState.isHost) socket.emit('add_bot', mpState.roomCode);
                });
                document.getElementById('mpWaitingLeaveBtn').addEventListener('click', mpLeave);
                document.getElementById('mpLeaveBtn').addEventListener('click', mpLeave);
                document.getElementById('mpPlayAgainBtn').addEventListener('click', mpLeave);

                // Init local storage name
                var savedName = localStorage.getItem('climaxkeys_name');
                if (savedName) document.getElementById('mpName').value = savedName;

                window.addEventListener('keydown', handleKeyDown);
                window.addEventListener('keyup', handleKeyUp);
                window.addEventListener('blur', function () {
                    state.pressedKeys.forEach(function (code) { setKeyPressed(code, false); });
                    state.pressedKeys.clear();
                });

                document.querySelectorAll('.nav-link').forEach(function (link) {
                    link.addEventListener('click', function (e) {
                        switchView(this.dataset.target);
                    });
                });
                switchView('view-keytest');
            }

            init();
        })();